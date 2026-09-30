import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  APTITUDE_QUESTIONS,
  selectPracticeQuestions,
  TECHNICAL_QUESTIONS,
} from './src/data/questionBank.ts';
import {
  AptitudeResultRecord,
  BookmarkRecord,
  computeInterviewReadiness,
  computeRuleBasedRecommendations,
  MockInterviewRecord,
  QuizResultRecord,
  ResumeAnalysisRecord,
  StudentProfileRecord,
  StudyNoteRecord,
} from './src/utils/recommendationEngine.ts';
import {
  AptitudeResultModel,
  BookmarkModel,
  InterviewModel,
  NoteModel,
  ProgressModel,
  QuizResultModel,
  ResumeModel,
  UserModel,
} from './server/models/schemas.ts';
import {
  analyzeResumeWithGemini,
  evaluateInterviewAnswerWithGemini,
  extractRawTextFromPdfBuffer,
  extractTextFromDocxBuffer,
  generateInterviewQuestionWithGemini,
  summarizeInterviewWithGemini,
} from './server/services/geminiService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

interface UserMemoryStore {
  password?: string;
  profile: StudentProfileRecord | null;
  quizResults: QuizResultRecord[];
  aptitudeResults: AptitudeResultRecord[];
  notes: StudyNoteRecord[];
  bookmarks: BookmarkRecord[];
  resumes: ResumeAnalysisRecord[];
  interviews: MockInterviewRecord[];
}

const memoryStore = new Map<string, UserMemoryStore>();
const emailToUidMap = new Map<string, string>();
let isMongoConnected = false;

function seedDefaultNotesForUser(store: UserMemoryStore, uid: string) {
  if (store.notes.length === 0) {
    const now = new Date().toISOString();
    store.notes.push(
      {
        id: `note_seed_1_${uid}`,
        userId: uid,
        title: 'DBMS Normalization (1NF, 2NF, 3NF, BCNF)',
        subject: 'DBMS',
        topic: 'Database Normalization & Keys',
        content:
          '1NF: Atomic values in every column.\n2NF: 1NF + No partial dependency on any candidate key.\n3NF: 2NF + No transitive dependency for non-prime attributes.\nBCNF: For every non-trivial functional dependency X -> Y, X must be a superkey.',
        important: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `note_seed_2_${uid}`,
        userId: uid,
        title: 'OOP 4 Pillars & Runtime Polymorphism',
        subject: 'OOP',
        topic: 'Polymorphism & Encapsulation',
        content:
          'Encapsulation: Bundling data + methods with access modifiers.\nCompile-time Polymorphism: Method Overloading.\nRuntime Polymorphism: Method Overriding resolved via dynamic method dispatch (vtable).',
        important: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `note_seed_3_${uid}`,
        userId: uid,
        title: 'Java JVM Memory Areas & Garbage Collection',
        subject: 'Java',
        topic: 'JVM Internals',
        content:
          'Heap Memory: Stores objects (Young Generation: Eden + Survivor S0/S1, Old Generation).\nStack Memory: Stores thread-specific method frames and local primitives.\nMetaspace: Stores class metadata and static definitions.',
        important: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: `note_seed_4_${uid}`,
        userId: uid,
        title: 'OS Process Scheduling & Deadlock Conditions',
        subject: 'OS',
        topic: 'CPU Scheduling & Synchronization',
        content:
          '4 Coffman Deadlock Conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.\nCPU Scheduling: FCFS, SJF (optimal average waiting time), Round Robin (time quantum for responsiveness).',
        important: false,
        createdAt: now,
        updatedAt: now,
      }
    );
  }
}

function getUserStore(userId: string): UserMemoryStore {
  if (!memoryStore.has(userId)) {
    memoryStore.set(userId, {
      profile: null,
      quizResults: [],
      aptitudeResults: [],
      notes: [],
      bookmarks: [],
      resumes: [],
      interviews: [],
    });
  }
  return memoryStore.get(userId)!;
}

function getUserId(req: Request): string {
  const headerUid = req.headers['x-user-id'];
  if (typeof headerUid === 'string' && headerUid.trim()) {
    return headerUid.trim();
  }
  if (typeof req.query.userId === 'string' && req.query.userId.trim()) {
    return req.query.userId.trim();
  }
  if (req.body && typeof req.body.userId === 'string' && req.body.userId.trim()) {
    return req.body.userId.trim();
  }
  return '';
}

async function connectMongoDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('MY_MONGODB') || uri.includes('<password>')) return;
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    isMongoConnected = true;
    console.log('Connected to MongoDB Atlas successfully.');
  } catch {
    isMongoConnected = false;
    console.log('Using Express + Firebase Firestore storage.');
  }
}

async function startServer() {
  void connectMongoDB();

  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // ================= END-TO-END AUTHENTICATION API =================
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const name = String(req.body.name || email.split('@')[0] || 'B.Tech Student').trim();

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const existingUid = emailToUidMap.get(email);
    const uid =
      existingUid ||
      `user_${email.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)}_${Date.now().toString().slice(-5)}`;
    emailToUidMap.set(email, uid);

    const now = new Date().toISOString();
    const knownSubjects: string[] = Array.isArray(req.body.knownSubjects)
      ? req.body.knownSubjects.map(String)
      : ['Java', 'DBMS', 'OOP'];
    const interests: string[] = Array.isArray(req.body.interests)
      ? req.body.interests.map(String)
      : ['Full Stack Web Development'];
    const skills: string[] = Array.isArray(req.body.skills) && req.body.skills.length > 0
      ? req.body.skills.map(String)
      : [...knownSubjects];

    const profile: StudentProfileRecord = {
      firebaseUid: uid,
      name: name.slice(0, 120),
      email: email.slice(0, 200),
      college: String(req.body.college || 'B.Tech Engineering College').slice(0, 200),
      degree: String(req.body.degree || 'B.Tech').slice(0, 100),
      department: String(req.body.department || 'Computer Science & Engineering (CSE)').slice(0, 100),
      year: (req.body.year || '4th Year') as StudentProfileRecord['year'],
      cgpa: String(req.body.cgpa || '8.5').slice(0, 20),
      targetRole: String(req.body.targetRole || 'Software Developer').slice(0, 100),
      preferredDomain: String(req.body.preferredDomain || interests[0] || 'Full Stack Development').slice(0, 100),
      skills,
      interests,
      knownSubjects,
      createdAt: now,
      updatedAt: now,
    };

    const store = getUserStore(uid);
    store.password = password;
    store.profile = profile;
    seedDefaultNotesForUser(store, uid);

    if (isMongoConnected) {
      await UserModel.findOneAndUpdate({ firebaseUid: uid }, profile, { upsert: true, new: true }).catch(() => null);
    }

    return res.json({
      user: {
        uid,
        email: profile.email,
        displayName: profile.name,
        emailVerified: true,
      },
      profile,
    });
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter your email and password.' });
    }

    let uid = emailToUidMap.get(email);
    if (!uid) {
      // Allow immediate login and create student workspace if first time logging in with this email
      uid = `user_${email.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)}`;
      emailToUidMap.set(email, uid);
    }

    const store = getUserStore(uid);
    if (store.password && store.password !== password) {
      return res.status(401).json({ error: 'Invalid password for this student account.' });
    }
    store.password = password;

    const now = new Date().toISOString();
    if (!store.profile) {
      const knownSubjects: string[] = Array.isArray(req.body.knownSubjects) && req.body.knownSubjects.length > 0
        ? req.body.knownSubjects.map(String)
        : ['Java', 'Python', 'DBMS', 'OOP'];
      const interests: string[] = Array.isArray(req.body.interests) && req.body.interests.length > 0
        ? req.body.interests.map(String)
        : ['Full Stack Web Development'];

      store.profile = {
        firebaseUid: uid,
        name: String(req.body.name || email.split('@')[0] || 'B.Tech Student').slice(0, 120),
        email: email.slice(0, 200),
        college: 'National Institute of Technology',
        degree: 'B.Tech',
        department: 'Computer Science & Engineering (CSE)',
        year: '4th Year',
        cgpa: '8.5',
        targetRole: String(req.body.targetRole || 'Software Developer'),
        preferredDomain: interests[0] || 'Full Stack Web Development',
        skills: [...knownSubjects],
        interests,
        knownSubjects,
        createdAt: now,
        updatedAt: now,
      };
    }
    seedDefaultNotesForUser(store, uid);

    return res.json({
      user: {
        uid,
        email: store.profile.email,
        displayName: store.profile.name,
        emailVerified: true,
      },
      profile: store.profile,
    });
  });

  app.get('/api/user/bootstrap', (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Missing user ID' });
    const store = getUserStore(userId);
    return res.json({
      profile: store.profile,
      quizResults: store.quizResults,
      aptitudeResults: store.aptitudeResults,
      notes: store.notes,
      bookmarks: store.bookmarks,
      resumes: store.resumes,
      interviews: store.interviews,
    });
  });

  // ================= PROFILE API =================
  app.get('/api/profile', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    if (isMongoConnected) {
      const doc = await UserModel.findOne({ firebaseUid: userId }).lean();
      if (doc) return res.json({ profile: doc });
    }
    const store = getUserStore(userId);
    return res.json({ profile: store.profile });
  });

  app.put('/api/profile', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    const now = new Date().toISOString();
    const store = getUserStore(userId);
    const updated: StudentProfileRecord = {
      firebaseUid: userId,
      name: String(req.body.name || store.profile?.name || 'Student').slice(0, 120),
      email: String(req.body.email || store.profile?.email || '').slice(0, 200),
      college: String(req.body.college ?? store.profile?.college ?? '').slice(0, 200),
      degree: String(req.body.degree ?? store.profile?.degree ?? 'B.Tech').slice(0, 100),
      department: String(req.body.department ?? store.profile?.department ?? 'CSE').slice(0, 100),
      year: (req.body.year || store.profile?.year || '4th Year') as StudentProfileRecord['year'],
      cgpa: String(req.body.cgpa ?? store.profile?.cgpa ?? '').slice(0, 20),
      targetRole: String(req.body.targetRole || store.profile?.targetRole || 'Software Developer').slice(0, 100),
      preferredDomain: String(req.body.preferredDomain ?? store.profile?.preferredDomain ?? 'Full Stack Development').slice(0, 100),
      skills: Array.isArray(req.body.skills)
        ? req.body.skills.slice(0, 30).map((s: unknown) => String(s).slice(0, 80))
        : store.profile?.skills || [],
      interests: Array.isArray(req.body.interests)
        ? req.body.interests.slice(0, 15).map((s: unknown) => String(s).slice(0, 100))
        : store.profile?.interests || [],
      knownSubjects: Array.isArray(req.body.knownSubjects)
        ? req.body.knownSubjects.slice(0, 20).map((s: unknown) => String(s).slice(0, 80))
        : store.profile?.knownSubjects || [],
      createdAt: store.profile?.createdAt || now,
      updatedAt: now,
    };

    store.profile = updated;
    if (isMongoConnected) {
      await UserModel.findOneAndUpdate({ firebaseUid: userId }, updated, { upsert: true, new: true }).catch(() => null);
    }
    return res.json({ profile: updated });
  });

  // ================= TECHNICAL QUIZ API =================
  app.get('/api/quiz/questions', (req: Request, res: Response) => {
    const category = String(req.query.category || 'Java');
    const difficulty = String(req.query.difficulty || 'Medium');
    const count = Math.min(20, Math.max(1, Number(req.query.count) || 5));

    const questions = selectPracticeQuestions(TECHNICAL_QUESTIONS, category, difficulty, count);
    return res.json({ questions });
  });

  app.post('/api/quiz/result', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    const record: QuizResultRecord = {
      id: String(req.body.id || `quiz_${Date.now()}`),
      userId,
      category: String(req.body.category || 'Java'),
      difficulty: (req.body.difficulty || 'Medium') as QuizResultRecord['difficulty'],
      totalQuestions: Number(req.body.totalQuestions) || 5,
      correctAnswers: Number(req.body.correctAnswers) || 0,
      wrongAnswers: Number(req.body.wrongAnswers) || 0,
      score: Number(req.body.score) || 0,
      percentage: Number(req.body.percentage) || 0,
      createdAt: new Date().toISOString(),
    };

    const store = getUserStore(userId);
    store.quizResults.unshift(record);

    if (isMongoConnected) {
      await QuizResultModel.create(record).catch(() => null);
      await ProgressModel.findOneAndUpdate(
        { userId },
        { $inc: { completedQuizzes: 1 }, $addToSet: { topics: record.category } },
        { upsert: true }
      ).catch(() => null);
    }

    return res.json({ result: record });
  });

  app.get('/api/quiz/results', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    if (isMongoConnected) {
      const results = await QuizResultModel.find({ userId }).sort({ date: -1 }).lean();
      return res.json({ results });
    }
    const store = getUserStore(userId);
    return res.json({ results: store.quizResults });
  });

  // ================= APTITUDE API =================
  app.get('/api/aptitude/questions', (req: Request, res: Response) => {
    const category = String(req.query.category || 'Quantitative Aptitude');
    const difficulty = String(req.query.difficulty || 'Medium');
    const count = Math.min(20, Math.max(1, Number(req.query.count) || 6));

    const questions = selectPracticeQuestions(APTITUDE_QUESTIONS, category, difficulty, count);
    return res.json({ questions });
  });

  app.post('/api/aptitude/result', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    const record: AptitudeResultRecord = {
      id: String(req.body.id || `apt_${Date.now()}`),
      userId,
      category: String(req.body.category || 'Quantitative Aptitude'),
      difficulty: (req.body.difficulty || 'Medium') as AptitudeResultRecord['difficulty'],
      totalQuestions: Number(req.body.totalQuestions) || 6,
      correctAnswers: Number(req.body.correctAnswers) || 0,
      wrongAnswers: Number(req.body.wrongAnswers) || 0,
      score: Number(req.body.score) || 0,
      percentage: Number(req.body.percentage) || 0,
      createdAt: new Date().toISOString(),
    };

    const store = getUserStore(userId);
    store.aptitudeResults.unshift(record);

    if (isMongoConnected) {
      await AptitudeResultModel.create(record).catch(() => null);
      await ProgressModel.findOneAndUpdate(
        { userId },
        { $inc: { completedAptitude: 1 }, $addToSet: { topics: record.category } },
        { upsert: true }
      ).catch(() => null);
    }

    return res.json({ result: record });
  });

  app.get('/api/aptitude/results', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    if (isMongoConnected) {
      const results = await AptitudeResultModel.find({ userId }).sort({ date: -1 }).lean();
      return res.json({ results });
    }
    const store = getUserStore(userId);
    return res.json({ results: store.aptitudeResults });
  });

  // ================= STUDY NOTES API =================
  app.get('/api/notes', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    if (isMongoConnected) {
      const notes = await NoteModel.find({ userId }).sort({ updatedAt: -1 }).lean();
      return res.json({ notes });
    }
    const store = getUserStore(userId);
    return res.json({ notes: store.notes });
  });

  app.post('/api/notes', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    const now = new Date().toISOString();
    const note: StudyNoteRecord = {
      id: String(req.body.id || `note_${Date.now()}`),
      userId,
      title: String(req.body.title || '').slice(0, 150),
      subject: String(req.body.subject || 'DBMS').slice(0, 60),
      topic: String(req.body.topic || 'General').slice(0, 100),
      content: String(req.body.content || '').slice(0, 10000),
      important: Boolean(req.body.important),
      createdAt: now,
      updatedAt: now,
    };

    const store = getUserStore(userId);
    store.notes.unshift(note);

    if (isMongoConnected) {
      await NoteModel.create(note).catch(() => null);
    }
    return res.json({ note });
  });

  app.put('/api/notes/:id', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    const noteId = req.params.id;
    const store = getUserStore(userId);
    const idx = store.notes.findIndex((n) => n.id === noteId);
    const now = new Date().toISOString();

    if (idx !== -1) {
      store.notes[idx] = {
        ...store.notes[idx],
        title: String(req.body.title ?? store.notes[idx].title).slice(0, 150),
        subject: String(req.body.subject ?? store.notes[idx].subject).slice(0, 60),
        topic: String(req.body.topic ?? store.notes[idx].topic).slice(0, 100),
        content: String(req.body.content ?? store.notes[idx].content).slice(0, 10000),
        important:
          req.body.important !== undefined
            ? Boolean(req.body.important)
            : store.notes[idx].important,
        updatedAt: now,
      };
    } else if (req.body && req.body.title) {
      const upserted: StudyNoteRecord = {
        id: noteId,
        userId,
        title: String(req.body.title).slice(0, 150),
        subject: String(req.body.subject || 'DBMS').slice(0, 60),
        topic: String(req.body.topic || 'General').slice(0, 100),
        content: String(req.body.content || '').slice(0, 10000),
        important: Boolean(req.body.important),
        createdAt: String(req.body.createdAt || now),
        updatedAt: now,
      };
      store.notes.unshift(upserted);
    }

    if (isMongoConnected) {
      await NoteModel.findOneAndUpdate({ _id: noteId, userId }, req.body, { new: true }).catch(() => null);
    }
    const currentNote = store.notes.find((n) => n.id === noteId) || req.body;
    return res.json({ note: currentNote });
  });

  app.delete('/api/notes/:id', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    const noteId = req.params.id;
    const store = getUserStore(userId);
    store.notes = store.notes.filter((n) => n.id !== noteId);

    if (isMongoConnected) {
      await NoteModel.findOneAndDelete({ _id: noteId, userId }).catch(() => null);
    }
    return res.json({ deleted: true });
  });

  // ================= BOOKMARKS API =================
  app.get('/api/bookmarks', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    if (isMongoConnected) {
      const bookmarks = await BookmarkModel.find({ userId }).sort({ createdAt: -1 }).lean();
      return res.json({ bookmarks });
    }
    const store = getUserStore(userId);
    return res.json({ bookmarks: store.bookmarks });
  });

  app.post('/api/bookmarks', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    const bookmark: BookmarkRecord = {
      id: String(req.body.id || `bm_${Date.now()}`),
      userId,
      itemType: (req.body.itemType || 'quiz') as BookmarkRecord['itemType'],
      title: String(req.body.title || '').slice(0, 500),
      category: String(req.body.category || 'General').slice(0, 80),
      content: String(req.body.content || '').slice(0, 4000),
      explanation: String(req.body.explanation || '').slice(0, 2000),
      referenceId: String(req.body.referenceId || '').slice(0, 128),
      createdAt: new Date().toISOString(),
    };

    const store = getUserStore(userId);
    store.bookmarks.unshift(bookmark);

    if (isMongoConnected) {
      await BookmarkModel.create(bookmark).catch(() => null);
    }
    return res.json({ bookmark });
  });

  app.delete('/api/bookmarks/:id', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    const bookmarkId = req.params.id;
    const store = getUserStore(userId);
    store.bookmarks = store.bookmarks.filter((b) => b.id !== bookmarkId);

    if (isMongoConnected) {
      await BookmarkModel.findOneAndDelete({ _id: bookmarkId, userId }).catch(() => null);
    }
    return res.json({ deleted: true });
  });

  // ================= AI RESUME ANALYZER API =================
  app.post('/api/resume/analyze', upload.single('resumeFile'), async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

      const targetRole = String(req.body.targetRole || 'Software Developer').slice(0, 100);
      let studentSkills: string[] = [];
      if (typeof req.body.studentSkills === 'string') {
        try {
          studentSkills = JSON.parse(req.body.studentSkills);
        } catch {
          studentSkills = req.body.studentSkills.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      } else if (Array.isArray(req.body.studentSkills)) {
        studentSkills = req.body.studentSkills;
      }

      let resumeText = String(req.body.resumeText || '').trim();
      let pdfBase64: string | undefined;
      let fileName = String(req.body.fileName || 'Student_Resume.pdf').slice(0, 200);

      if (req.file) {
        fileName = req.file.originalname.slice(0, 200);
        const lowerName = fileName.toLowerCase();
        const isPdf =
          req.file.mimetype === 'application/pdf' || lowerName.endsWith('.pdf');
        const isDocx =
          req.file.mimetype ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          lowerName.endsWith('.docx');
        const isDocOrTxt =
          req.file.mimetype === 'text/plain' ||
          req.file.mimetype === 'application/msword' ||
          lowerName.endsWith('.txt') ||
          lowerName.endsWith('.doc');

        if (!isPdf && !isDocx && !isDocOrTxt) {
          return res.status(400).json({
            error: `Invalid file type ("${fileName}"). Please upload a valid Resume document in .PDF, .DOCX, .DOC, or .TXT format.`,
            isNotResume: true,
          });
        }

        if (isPdf) {
          pdfBase64 = req.file.buffer.toString('base64');
          const extractedFromPdf = extractRawTextFromPdfBuffer(req.file.buffer);
          if (extractedFromPdf) {
            resumeText = `${resumeText}\n${extractedFromPdf}`.trim();
          }
        } else if (isDocx) {
          const extractedFromDocx = extractTextFromDocxBuffer(req.file.buffer);
          if (extractedFromDocx) {
            resumeText = `${resumeText}\n${extractedFromDocx}`.trim();
          }
        } else {
          const textFromBuffer = req.file.buffer
            .toString('utf-8')
            .replace(/[^\x20-\x7E\n\r\t]/g, ' ');
          resumeText = `${resumeText}\n${textFromBuffer}`.trim();
        }
      }

      if (!resumeText && !pdfBase64) {
        return res.status(400).json({
          error: 'Please upload a resume file (.pdf, .docx, .txt) or paste your resume text.',
        });
      }

      const evaluation = await analyzeResumeWithGemini({
        resumeText,
        pdfBase64,
        targetRole,
        fileName,
        studentSkills,
      });

      if (!evaluation.isValidResume) {
        return res.status(400).json({
          error:
            evaluation.validationMessage ||
            `The uploaded file "${fileName}" does not appear to be a valid Resume/CV. Please upload a proper Resume containing your Education, Technical Skills, and Projects.`,
          isNotResume: true,
        });
      }

      const record: ResumeAnalysisRecord = {
        id: `res_${Date.now()}`,
        userId,
        fileName,
        targetRole,
        ...evaluation,
        createdAt: new Date().toISOString(),
      };

      const store = getUserStore(userId);
      store.resumes.unshift(record);

      if (isMongoConnected) {
        await ResumeModel.create(record).catch(() => null);
      }

      return res.json({ analysis: record });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to analyze resume';
      return res.status(500).json({ error: message });
    }
  });

  app.get('/api/resume/latest', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    if (isMongoConnected) {
      const latest = await ResumeModel.findOne({ userId }).sort({ createdAt: -1 }).lean();
      return res.json({ latest });
    }
    const store = getUserStore(userId);
    return res.json({ latest: store.resumes[0] || null });
  });

  // ================= AI MOCK INTERVIEW API =================
  app.post('/api/interview/start', async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

      const role = String(req.body.role || 'Software Developer');
      const type = (req.body.type || 'Technical') as 'Technical' | 'HR' | 'Mixed';
      const difficulty = (req.body.difficulty || 'Medium') as 'Easy' | 'Medium' | 'Hard';
      const experienceLevel = String(req.body.experienceLevel || 'Fresher / Final Year B.Tech');

      const generated = await generateInterviewQuestionWithGemini({
        role,
        type,
        difficulty,
        experienceLevel,
        questionNumber: 1,
        previousQuestions: [],
      });

      return res.json(generated);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start interview';
      return res.status(500).json({ error: message });
    }
  });

  app.post('/api/interview/evaluate', async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

      const role = String(req.body.role || 'Software Developer');
      const type = (req.body.type || 'Technical') as 'Technical' | 'HR' | 'Mixed';
      const difficulty = (req.body.difficulty || 'Medium') as 'Easy' | 'Medium' | 'Hard';
      const experienceLevel = String(req.body.experienceLevel || 'Fresher / Final Year B.Tech');
      const question = String(req.body.question || '');
      const answer = String(req.body.answer || '');
      const isLastQuestion = Boolean(req.body.isLastQuestion);
      const nextQuestionNumber = Number(req.body.nextQuestionNumber) || 2;
      const previousQuestions: string[] = Array.isArray(req.body.previousQuestions)
        ? req.body.previousQuestions.map(String)
        : [question];

      if (!answer.trim()) {
        return res.status(400).json({ error: 'Please provide an answer before submitting.' });
      }

      const evaluation = await evaluateInterviewAnswerWithGemini({
        role,
        type,
        difficulty,
        experienceLevel,
        question,
        answer,
        isLastQuestion,
        nextQuestionNumber,
        previousQuestions,
      });

      return res.json({ evaluation });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to evaluate answer';
      return res.status(500).json({ error: message });
    }
  });

  app.post('/api/interview/complete', async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

      const role = String(req.body.role || 'Software Developer').slice(0, 100);
      const type = (req.body.type || 'Technical') as 'Technical' | 'HR' | 'Mixed';
      const difficulty = (req.body.difficulty || 'Medium') as 'Easy' | 'Medium' | 'Hard';
      const experienceLevel = String(req.body.experienceLevel || 'Fresher / Final Year B.Tech').slice(0, 50);
      const qaList = Array.isArray(req.body.qaList) ? req.body.qaList : [];

      const summary = await summarizeInterviewWithGemini({
        role,
        type,
        difficulty,
        qaList,
      });

      const record: MockInterviewRecord = {
        id: `int_${Date.now()}`,
        userId,
        role,
        type,
        difficulty,
        experienceLevel,
        totalQuestions: Math.max(1, qaList.length),
        overallScore: summary.overallScore,
        performanceBand: summary.performanceBand,
        dimensionAverages: summary.dimensionAverages,
        strongAreas: summary.strongAreas,
        weakAreas: summary.weakAreas,
        suggestions: summary.suggestions,
        transcriptSummary: JSON.stringify(qaList).slice(0, 14500),
        createdAt: new Date().toISOString(),
      };

      const store = getUserStore(userId);
      store.interviews.unshift(record);

      if (isMongoConnected) {
        await InterviewModel.create(record).catch(() => null);
        await ProgressModel.findOneAndUpdate(
          { userId },
          { $inc: { completedInterviews: 1 } },
          { upsert: true }
        ).catch(() => null);
      }

      return res.json({ interview: record });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete interview';
      return res.status(500).json({ error: message });
    }
  });

  app.get('/api/interview/history', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    if (isMongoConnected) {
      const history = await InterviewModel.find({ userId }).sort({ date: -1 }).lean();
      return res.json({ history });
    }
    const store = getUserStore(userId);
    return res.json({ history: store.interviews });
  });

  // ================= RECOMMENDATIONS, PROGRESS & READINESS API =================
  app.get('/api/recommendations', (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    const store = getUserStore(userId);
    const recommendations = computeRuleBasedRecommendations({
      profile: store.profile,
      quizResults: store.quizResults,
      aptitudeResults: store.aptitudeResults,
      interviews: store.interviews,
      latestResume: store.resumes[0] || null,
      notes: store.notes,
    });
    return res.json({ recommendations });
  });

  app.get('/api/progress', (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    const store = getUserStore(userId);
    const topics = Array.from(
      new Set([
        ...store.quizResults.map((q) => q.category),
        ...store.aptitudeResults.map((a) => a.category),
        ...store.notes.map((n) => n.subject),
        ...(store.profile?.knownSubjects || []),
      ])
    );

    return res.json({
      progress: {
        userId,
        topics,
        completedQuizzes: store.quizResults.length,
        completedAptitude: store.aptitudeResults.length,
        completedInterviews: store.interviews.length,
        notesCreated: store.notes.length,
        resumesAnalyzed: store.resumes.length,
      },
    });
  });

  app.get('/api/readiness', (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing user ID' });

    const store = getUserStore(userId);
    const readiness = computeInterviewReadiness({
      profile: store.profile,
      quizResults: store.quizResults,
      aptitudeResults: store.aptitudeResults,
      interviews: store.interviews,
      latestResume: store.resumes[0] || null,
      notes: store.notes,
    });
    return res.json({ readiness });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`InterviewPrep Tracker full-stack server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
