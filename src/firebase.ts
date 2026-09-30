import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  AptitudeResultRecord,
  BookmarkRecord,
  MockInterviewRecord,
  QuizResultRecord,
  ResumeAnalysisRecord,
  StudentProfileRecord,
  StudyNoteRecord,
} from './utils/recommendationEngine.ts';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Mandatory connection validation on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validation & Sanitization Constants Synchronized with firebase-blueprint.json
const ID_REGEX = /^[a-zA-Z0-9_\-]+$/;

export function sanitizeId(rawId: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
  return cleaned && ID_REGEX.test(cleaned) ? cleaned : `id_${Date.now()}`;
}

function toIsoString(val: unknown): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string' && val) {
    return val;
  }
  return new Date().toISOString();
}

// Auth wrappers
export async function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function loginWithEmail(email: string, pass: string) {
  return signInWithEmailAndPassword(auth, email, pass);
}

export async function registerWithEmail(name: string, email: string, pass: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (cred.user && name.trim()) {
    await updateProfile(cred.user, { displayName: name.trim().slice(0, 120) });
  }
  return cred;
}

export async function resetUserPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function logoutUser() {
  return signOut(auth);
}

// Firestore CRUD Operations with Defensive Payload Sanitization
export async function ensureAndLoadUserProfile(user: {
  uid: string;
  displayName: string | null;
  email: string | null;
  emailVerified: boolean;
}): Promise<StudentProfileRecord> {
  const uid = sanitizeId(user.uid);
  const path = `users/${uid}`;
  const defaultProfile: StudentProfileRecord = {
    firebaseUid: uid,
    name: (user.displayName || user.email?.split('@')[0] || 'B.Tech Student').slice(0, 120),
    email: (user.email || 'student@cse.edu').slice(0, 200),
    college: 'National Institute of Technology',
    degree: 'B.Tech',
    department: 'Computer Science & Engineering (CSE)',
    year: '4th Year',
    cgpa: '8.4',
    targetRole: 'Software Developer',
    preferredDomain: 'Full Stack & Backend Engineering',
    skills: ['Java', 'Python', 'Data Structures', 'DBMS', 'OOP', 'SQL'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!user.emailVerified) {
    return defaultProfile;
  }

  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      const data = snap.data();
      return {
        firebaseUid: uid,
        name: String(data.name || defaultProfile.name),
        email: String(data.email || defaultProfile.email),
        college: String(data.college ?? ''),
        degree: String(data.degree ?? 'B.Tech'),
        department: String(data.department ?? 'CSE'),
        year: (data.year || '4th Year') as StudentProfileRecord['year'],
        cgpa: String(data.cgpa ?? ''),
        targetRole: String(data.targetRole || 'Software Developer'),
        preferredDomain: String(data.preferredDomain ?? ''),
        skills: Array.isArray(data.skills) ? data.skills.map(String) : [],
        createdAt: toIsoString(data.createdAt),
        updatedAt: toIsoString(data.updatedAt),
      };
    }

    // Create initial profile document in Firestore
    await setDoc(doc(db, 'users', uid), {
      firebaseUid: uid,
      name: defaultProfile.name.slice(0, 120),
      email: defaultProfile.email.slice(0, 200),
      college: defaultProfile.college.slice(0, 200),
      degree: defaultProfile.degree.slice(0, 100),
      department: defaultProfile.department.slice(0, 100),
      year: defaultProfile.year,
      cgpa: defaultProfile.cgpa.slice(0, 20),
      targetRole: defaultProfile.targetRole.slice(0, 100),
      preferredDomain: defaultProfile.preferredDomain.slice(0, 100),
      skills: defaultProfile.skills.slice(0, 30).map((s) => s.slice(0, 80)),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return defaultProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function updateFirestoreProfile(
  uid: string,
  updates: Omit<StudentProfileRecord, 'firebaseUid' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const cleanUid = sanitizeId(uid);
  const path = `users/${cleanUid}`;
  const validYears = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduated'];
  const safeYear = validYears.includes(updates.year) ? updates.year : '4th Year';

  try {
    await updateDoc(doc(db, 'users', cleanUid), {
      name: (updates.name.trim() || 'Student').slice(0, 120),
      email: (updates.email.trim() || 'student@cse.edu').slice(0, 200),
      college: updates.college.trim().slice(0, 200),
      degree: updates.degree.trim().slice(0, 100),
      department: updates.department.trim().slice(0, 100),
      year: safeYear,
      cgpa: updates.cgpa.trim().slice(0, 20),
      targetRole: (updates.targetRole.trim() || 'Software Developer').slice(0, 100),
      preferredDomain: updates.preferredDomain.trim().slice(0, 100),
      skills: updates.skills
        .map((s) => s.trim().slice(0, 80))
        .filter(Boolean)
        .slice(0, 30),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function fetchUserCollectionRecords(uid: string) {
  const cleanUid = sanitizeId(uid);

  const loadCol = async <T>(colName: string, mapper: (id: string, d: Record<string, any>) => T): Promise<T[]> => {
    try {
      const q = query(collection(db, colName), where('userId', '==', cleanUid));
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => mapper(docSnap.id, docSnap.data()));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, colName);
    }
  };

  const [quizResults, aptitudeResults, notes, bookmarks, resumes, interviews] = await Promise.all([
    loadCol<QuizResultRecord>('quizResults', (id, d) => ({
      id,
      userId: String(d.userId),
      category: String(d.category),
      difficulty: d.difficulty,
      totalQuestions: Number(d.totalQuestions),
      correctAnswers: Number(d.correctAnswers),
      wrongAnswers: Number(d.wrongAnswers),
      score: Number(d.score),
      percentage: Number(d.percentage),
      createdAt: toIsoString(d.createdAt),
    })),
    loadCol<AptitudeResultRecord>('aptitudeResults', (id, d) => ({
      id,
      userId: String(d.userId),
      category: String(d.category),
      difficulty: d.difficulty,
      totalQuestions: Number(d.totalQuestions),
      correctAnswers: Number(d.correctAnswers),
      wrongAnswers: Number(d.wrongAnswers),
      score: Number(d.score),
      percentage: Number(d.percentage),
      createdAt: toIsoString(d.createdAt),
    })),
    loadCol<StudyNoteRecord>('notes', (id, d) => ({
      id,
      userId: String(d.userId),
      title: String(d.title),
      subject: String(d.subject),
      topic: String(d.topic),
      content: String(d.content),
      important: Boolean(d.important),
      createdAt: toIsoString(d.createdAt),
      updatedAt: toIsoString(d.updatedAt),
    })),
    loadCol<BookmarkRecord>('bookmarks', (id, d) => ({
      id,
      userId: String(d.userId),
      itemType: d.itemType,
      title: String(d.title),
      category: String(d.category),
      content: String(d.content || ''),
      explanation: String(d.explanation || ''),
      referenceId: String(d.referenceId || ''),
      createdAt: toIsoString(d.createdAt),
    })),
    loadCol<ResumeAnalysisRecord>('resumes', (id, d) => ({
      id,
      userId: String(d.userId),
      fileName: String(d.fileName),
      targetRole: String(d.targetRole),
      resumeScore: Number(d.resumeScore),
      skillsFound: Array.isArray(d.skillsFound) ? d.skillsFound.map(String) : [],
      missingSkills: Array.isArray(d.missingSkills) ? d.missingSkills.map(String) : [],
      strengths: Array.isArray(d.strengths) ? d.strengths.map(String) : [],
      areasToImprove: Array.isArray(d.areasToImprove) ? d.areasToImprove.map(String) : [],
      suggestedSkills: Array.isArray(d.suggestedSkills) ? d.suggestedSkills.map(String) : [],
      suggestedImprovements: Array.isArray(d.suggestedImprovements) ? d.suggestedImprovements.map(String) : [],
      summary: String(d.summary || ''),
      createdAt: toIsoString(d.createdAt),
    })),
    loadCol<MockInterviewRecord>('interviews', (id, d) => ({
      id,
      userId: String(d.userId),
      role: String(d.role),
      type: d.type,
      difficulty: d.difficulty,
      experienceLevel: String(d.experienceLevel),
      totalQuestions: Number(d.totalQuestions),
      overallScore: Number(d.overallScore),
      strongAreas: Array.isArray(d.strongAreas) ? d.strongAreas.map(String) : [],
      weakAreas: Array.isArray(d.weakAreas) ? d.weakAreas.map(String) : [],
      suggestions: Array.isArray(d.suggestions) ? d.suggestions.map(String) : [],
      transcriptSummary: String(d.transcriptSummary || ''),
      createdAt: toIsoString(d.createdAt),
    })),
  ]);

  const sortDesc = <T extends { createdAt: string }>(arr: T[]) =>
    arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    quizResults: sortDesc(quizResults),
    aptitudeResults: sortDesc(aptitudeResults),
    notes: sortDesc(notes),
    bookmarks: sortDesc(bookmarks),
    resumes: sortDesc(resumes),
    interviews: sortDesc(interviews),
  };
}

export async function saveFirestoreQuizResult(record: QuizResultRecord): Promise<void> {
  const docId = sanitizeId(record.id);
  const path = `quizResults/${docId}`;
  try {
    await setDoc(doc(db, 'quizResults', docId), {
      userId: sanitizeId(record.userId),
      category: record.category.slice(0, 60),
      difficulty: record.difficulty,
      totalQuestions: Math.round(record.totalQuestions),
      correctAnswers: Math.round(record.correctAnswers),
      wrongAnswers: Math.round(record.wrongAnswers),
      score: Math.round(record.score),
      percentage: Math.min(100, Math.max(0, Math.round(record.percentage))),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function saveFirestoreAptitudeResult(record: AptitudeResultRecord): Promise<void> {
  const docId = sanitizeId(record.id);
  const path = `aptitudeResults/${docId}`;
  try {
    await setDoc(doc(db, 'aptitudeResults', docId), {
      userId: sanitizeId(record.userId),
      category: record.category.slice(0, 60),
      difficulty: record.difficulty,
      totalQuestions: Math.round(record.totalQuestions),
      correctAnswers: Math.round(record.correctAnswers),
      wrongAnswers: Math.round(record.wrongAnswers),
      score: Math.round(record.score),
      percentage: Math.min(100, Math.max(0, Math.round(record.percentage))),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function saveFirestoreNote(record: StudyNoteRecord, isUpdate = false): Promise<void> {
  const docId = sanitizeId(record.id);
  const path = `notes/${docId}`;
  try {
    if (isUpdate) {
      await updateDoc(doc(db, 'notes', docId), {
        title: record.title.trim().slice(0, 150) || 'Untitled Note',
        subject: record.subject.trim().slice(0, 60) || 'DBMS',
        topic: record.topic.trim().slice(0, 100) || 'General',
        content: record.content.trim().slice(0, 10000) || 'Note content',
        important: Boolean(record.important),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(doc(db, 'notes', docId), {
        userId: sanitizeId(record.userId),
        title: record.title.trim().slice(0, 150) || 'Untitled Note',
        subject: record.subject.trim().slice(0, 60) || 'DBMS',
        topic: record.topic.trim().slice(0, 100) || 'General',
        content: record.content.trim().slice(0, 10000) || 'Note content',
        important: Boolean(record.important),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, isUpdate ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function deleteFirestoreNote(noteId: string): Promise<void> {
  const docId = sanitizeId(noteId);
  const path = `notes/${docId}`;
  try {
    await deleteDoc(doc(db, 'notes', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveFirestoreBookmark(record: BookmarkRecord): Promise<void> {
  const docId = sanitizeId(record.id);
  const path = `bookmarks/${docId}`;
  try {
    await setDoc(doc(db, 'bookmarks', docId), {
      userId: sanitizeId(record.userId),
      itemType: record.itemType,
      title: (record.title.trim() || 'Bookmarked Item').slice(0, 500),
      category: (record.category.trim() || 'General').slice(0, 80),
      content: record.content.slice(0, 4000),
      explanation: record.explanation.slice(0, 2000),
      referenceId: record.referenceId.slice(0, 128),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteFirestoreBookmark(bookmarkId: string): Promise<void> {
  const docId = sanitizeId(bookmarkId);
  const path = `bookmarks/${docId}`;
  try {
    await deleteDoc(doc(db, 'bookmarks', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveFirestoreResume(record: ResumeAnalysisRecord): Promise<void> {
  const docId = sanitizeId(record.id);
  const path = `resumes/${docId}`;
  try {
    await setDoc(doc(db, 'resumes', docId), {
      userId: sanitizeId(record.userId),
      fileName: (record.fileName || 'Resume.pdf').slice(0, 200),
      targetRole: (record.targetRole || 'Software Developer').slice(0, 100),
      resumeScore: Math.min(100, Math.max(0, Math.round(record.resumeScore))),
      skillsFound: record.skillsFound.slice(0, 40).map((s) => s.slice(0, 450)),
      missingSkills: record.missingSkills.slice(0, 25).map((s) => s.slice(0, 450)),
      strengths: record.strengths.slice(0, 15).map((s) => s.slice(0, 450)),
      areasToImprove: record.areasToImprove.slice(0, 15).map((s) => s.slice(0, 450)),
      suggestedSkills: record.suggestedSkills.slice(0, 20).map((s) => s.slice(0, 450)),
      suggestedImprovements: record.suggestedImprovements.slice(0, 15).map((s) => s.slice(0, 450)),
      summary: (record.summary || 'Evaluated resume.').slice(0, 3000),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function saveFirestoreInterview(record: MockInterviewRecord): Promise<void> {
  const docId = sanitizeId(record.id);
  const path = `interviews/${docId}`;
  try {
    await setDoc(doc(db, 'interviews', docId), {
      userId: sanitizeId(record.userId),
      role: (record.role || 'Software Developer').slice(0, 100),
      type: record.type,
      difficulty: record.difficulty,
      experienceLevel: (record.experienceLevel || 'Fresher').slice(0, 50),
      totalQuestions: Math.min(20, Math.max(1, Math.round(record.totalQuestions))),
      overallScore: Math.min(100, Math.max(0, Math.round(record.overallScore))),
      strongAreas: record.strongAreas.slice(0, 15).map((s) => s.slice(0, 450)),
      weakAreas: record.weakAreas.slice(0, 15).map((s) => s.slice(0, 450)),
      suggestions: record.suggestions.slice(0, 15).map((s) => s.slice(0, 450)),
      transcriptSummary: (record.transcriptSummary || '').slice(0, 15000),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
