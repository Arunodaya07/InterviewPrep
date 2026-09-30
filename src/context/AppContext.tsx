import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  deleteFirestoreNote,
  ensureAndLoadUserProfile,
  fetchUserCollectionRecords,
  logoutUser,
  saveFirestoreAptitudeResult,
  saveFirestoreInterview,
  saveFirestoreNote,
  saveFirestoreQuizResult,
  saveFirestoreResume,
  updateFirestoreProfile,
} from '../firebase.ts';
import {
  AptitudeResultRecord,
  computeInterviewReadiness,
  MockInterviewRecord,
  QuizResultRecord,
  ReadinessBreakdown,
  ResumeAnalysisRecord,
  StudentProfileRecord,
  StudyNoteRecord,
} from '../utils/recommendationEngine.ts';

export type NavigationTab =
  | 'dashboard'
  | 'profile'
  | 'quiz'
  | 'aptitude'
  | 'notes'
  | 'resume'
  | 'interview'
  | 'progress';

export interface AuthSessionUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  isFirebaseUser?: boolean;
}

interface RegisterOrLoginPayload {
  mode: 'login' | 'register';
  name?: string;
  email: string;
  password?: string;
  targetRole?: string;
  college?: string;
  department?: string;
  year?: StudentProfileRecord['year'];
  cgpa?: string;
  interests?: string[];
  knownSubjects?: string[];
  initialTab?: NavigationTab;
}

interface AppContextValue {
  user: AuthSessionUser | null;
  authReady: boolean;
  dataLoading: boolean;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedQuizCategory: string | null;
  setSelectedQuizCategory: (cat: string | null) => void;
  profile: StudentProfileRecord | null;
  quizResults: QuizResultRecord[];
  aptitudeResults: AptitudeResultRecord[];
  notes: StudyNoteRecord[];
  resumes: ResumeAnalysisRecord[];
  interviews: MockInterviewRecord[];
  readiness: ReadinessBreakdown;
  authenticateStudent: (payload: RegisterOrLoginPayload) => Promise<void>;
  saveProfile: (
    updates: Omit<StudentProfileRecord, 'firebaseUid' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  recordQuizResult: (
    payload: Omit<QuizResultRecord, 'id' | 'userId' | 'createdAt'>
  ) => Promise<QuizResultRecord>;
  recordAptitudeResult: (
    payload: Omit<AptitudeResultRecord, 'id' | 'userId' | 'createdAt'>
  ) => Promise<AptitudeResultRecord>;
  createNote: (
    payload: Omit<StudyNoteRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateNote: (note: StudyNoteRecord) => Promise<void>;
  toggleNoteImportant: (noteId: string) => Promise<void>;
  removeNote: (noteId: string) => Promise<void>;
  recordResumeAnalysis: (record: ResumeAnalysisRecord) => Promise<void>;
  recordMockInterview: (record: MockInterviewRecord) => Promise<void>;
  signOutAccount: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const SESSION_KEY = 'ipt_active_student_session_v1';
const USER_DATA_PREFIX = 'ipt_student_store_';

function createStarterStudyNotes(uid: string): StudyNoteRecord[] {
  const now = new Date().toISOString();
  return [
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
    },
  ];
}

function normalizeNotesList(rawNotes: unknown, uid: string): StudyNoteRecord[] {
  if (!Array.isArray(rawNotes) || rawNotes.length === 0) {
    return createStarterStudyNotes(uid);
  }
  const normalized: StudyNoteRecord[] = rawNotes.map((n: any, idx: number) => ({
    id: String(n.id || n._id || `note_${idx}_${Date.now()}`),
    userId: String(n.userId || uid),
    title: String(n.title || 'Untitled Note'),
    subject: String(n.subject || 'DBMS'),
    topic: String(n.topic || 'General'),
    content: String(n.content || ''),
    important: Boolean(n.important ?? n.isImportant ?? false),
    createdAt: String(n.createdAt || new Date().toISOString()),
    updatedAt: String(n.updatedAt || new Date().toISOString()),
  }));

  // If the user only had the old 2 seed notes (both marked important), add the 2 non-important starter notes so the filter works clearly
  if (
    normalized.length === 2 &&
    normalized.every((n) => n.id.startsWith('note_seed_') && n.important)
  ) {
    const starters = createStarterStudyNotes(uid);
    return [...normalized, starters[2], starters[3]];
  }
  return normalized;
}

function loadLocalUserStore(uid: string) {
  try {
    const raw = localStorage.getItem(`${USER_DATA_PREFIX}${uid}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveLocalUserStore(
  uid: string,
  data: {
    profile: StudentProfileRecord | null;
    quizResults: QuizResultRecord[];
    aptitudeResults: AptitudeResultRecord[];
    notes: StudyNoteRecord[];
    resumes: ResumeAnalysisRecord[];
    interviews: MockInterviewRecord[];
  }
) {
  try {
    localStorage.setItem(`${USER_DATA_PREFIX}${uid}`, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthSessionUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [selectedQuizCategory, setSelectedQuizCategory] = useState<string | null>(null);

  const [profile, setProfile] = useState<StudentProfileRecord | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResultRecord[]>([]);
  const [aptitudeResults, setAptitudeResults] = useState<AptitudeResultRecord[]>([]);
  const [notes, setNotes] = useState<StudyNoteRecord[]>([]);
  const [resumes, setResumes] = useState<ResumeAnalysisRecord[]>([]);
  const [interviews, setInterviews] = useState<MockInterviewRecord[]>([]);

  // Persist user data to localStorage whenever state updates
  useEffect(() => {
    if (user && profile) {
      saveLocalUserStore(user.uid, {
        profile,
        quizResults,
        aptitudeResults,
        notes,
        resumes,
        interviews,
      });
    }
  }, [user, profile, quizResults, aptitudeResults, notes, resumes, interviews]);

  // Restore saved session or Firebase Auth listener
  useEffect(() => {
    const savedSessionRaw = localStorage.getItem(SESSION_KEY);
    if (savedSessionRaw) {
      try {
        const savedUser = JSON.parse(savedSessionRaw) as AuthSessionUser;
        if (savedUser?.uid) {
          setUser(savedUser);
          const localData = loadLocalUserStore(savedUser.uid);
          if (localData?.profile) {
            setProfile(localData.profile);
            setQuizResults(localData.quizResults || []);
            setAptitudeResults(localData.aptitudeResults || []);
            setNotes(normalizeNotesList(localData.notes, savedUser.uid));
            setResumes(localData.resumes || []);
            setInterviews(localData.interviews || []);
          } else {
            setNotes(createStarterStudyNotes(savedUser.uid));
          }
        }
      } catch {
        // Ignore parse error
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const sessionUser: AuthSessionUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified,
          isFirebaseUser: true,
        };
        setUser(sessionUser);
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
        setDataLoading(true);
        try {
          const localData = loadLocalUserStore(firebaseUser.uid);
          if (localData?.profile) {
            setProfile(localData.profile);
            setQuizResults(localData.quizResults || []);
            setAptitudeResults(localData.aptitudeResults || []);
            setNotes(normalizeNotesList(localData.notes, firebaseUser.uid));
            setResumes(localData.resumes || []);
            setInterviews(localData.interviews || []);
          } else {
            const loadedProfile = await ensureAndLoadUserProfile(firebaseUser).catch(() => null);
            if (loadedProfile) {
              setProfile({
                ...loadedProfile,
                interests: loadedProfile.interests || ['Full Stack Web Development'],
                knownSubjects:
                  loadedProfile.knownSubjects || loadedProfile.skills || ['Java', 'DBMS', 'OOP'],
              });
            }
            if (firebaseUser.emailVerified) {
              const records = await fetchUserCollectionRecords(firebaseUser.uid).catch(() => null);
              if (records) {
                setQuizResults(records.quizResults);
                setAptitudeResults(records.aptitudeResults);
                setNotes(normalizeNotesList(records.notes, firebaseUser.uid));
                setResumes(records.resumes);
                setInterviews(records.interviews);
              } else {
                setNotes(createStarterStudyNotes(firebaseUser.uid));
              }
            } else {
              setNotes(createStarterStudyNotes(firebaseUser.uid));
            }
          }
        } finally {
          setDataLoading(false);
        }
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const authenticateStudent = async (payload: RegisterOrLoginPayload) => {
    setDataLoading(true);
    try {
      const endpoint = payload.mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      const sessionUser: AuthSessionUser = {
        uid: data.user.uid,
        email: data.user.email,
        displayName: data.user.displayName,
        emailVerified: true,
        isFirebaseUser: false,
      };

      const existingLocal = loadLocalUserStore(sessionUser.uid);
      const mergedProfile: StudentProfileRecord = {
        ...(existingLocal?.profile || data.profile),
        name: payload.name?.trim() || existingLocal?.profile?.name || data.profile.name,
        targetRole:
          payload.targetRole || existingLocal?.profile?.targetRole || data.profile.targetRole,
        interests:
          payload.interests && payload.interests.length > 0
            ? payload.interests
            : existingLocal?.profile?.interests ||
              data.profile.interests || ['Full Stack Web Development'],
        knownSubjects:
          payload.knownSubjects && payload.knownSubjects.length > 0
            ? payload.knownSubjects
            : existingLocal?.profile?.knownSubjects ||
              data.profile.knownSubjects || ['Java', 'DBMS', 'OOP'],
        skills:
          payload.knownSubjects && payload.knownSubjects.length > 0
            ? Array.from(
                new Set([...(existingLocal?.profile?.skills || []), ...payload.knownSubjects])
              )
            : existingLocal?.profile?.skills || data.profile.skills || ['Java', 'DBMS', 'OOP'],
      };

      setUser(sessionUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      setProfile(mergedProfile);

      if (existingLocal) {
        setQuizResults(existingLocal.quizResults || []);
        setAptitudeResults(existingLocal.aptitudeResults || []);
        setNotes(normalizeNotesList(existingLocal.notes, sessionUser.uid));
        setResumes(existingLocal.resumes || []);
        setInterviews(existingLocal.interviews || []);
      } else {
        const bootRes = await fetch('/api/user/bootstrap', {
          headers: { 'x-user-id': sessionUser.uid },
        }).catch(() => null);
        if (bootRes && bootRes.ok) {
          const bootData = await bootRes.json();
          setQuizResults(bootData.quizResults || []);
          setAptitudeResults(bootData.aptitudeResults || []);
          setNotes(normalizeNotesList(bootData.notes, sessionUser.uid));
          setResumes(bootData.resumes || []);
          setInterviews(bootData.interviews || []);
        } else {
          setNotes(createStarterStudyNotes(sessionUser.uid));
        }
      }

      if (payload.initialTab) {
        setActiveTab(payload.initialTab);
      } else {
        setActiveTab('dashboard');
      }
    } finally {
      setDataLoading(false);
    }
  };

  const saveProfile = async (
    updates: Omit<StudentProfileRecord, 'firebaseUid' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) return;
    const now = new Date().toISOString();
    const updatedProfile: StudentProfileRecord = {
      firebaseUid: user.uid,
      ...updates,
      createdAt: profile?.createdAt || now,
      updatedAt: now,
    };
    setProfile(updatedProfile);

    if (user.isFirebaseUser && user.emailVerified) {
      await updateFirestoreProfile(user.uid, updates).catch(() => null);
    }
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
      body: JSON.stringify(updatedProfile),
    }).catch(() => null);
  };

  const recordQuizResult = async (
    payload: Omit<QuizResultRecord, 'id' | 'userId' | 'createdAt'>
  ): Promise<QuizResultRecord> => {
    const uid = user?.uid || 'guest';
    const record: QuizResultRecord = {
      ...payload,
      id: `quiz_${Date.now()}`,
      userId: uid,
      createdAt: new Date().toISOString(),
    };
    setQuizResults((prev) => [record, ...prev]);

    if (user?.isFirebaseUser && user.emailVerified) {
      await saveFirestoreQuizResult(record).catch(() => null);
    }
    await fetch('/api/quiz/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': uid },
      body: JSON.stringify(record),
    }).catch(() => null);

    return record;
  };

  const recordAptitudeResult = async (
    payload: Omit<AptitudeResultRecord, 'id' | 'userId' | 'createdAt'>
  ): Promise<AptitudeResultRecord> => {
    const uid = user?.uid || 'guest';
    const record: AptitudeResultRecord = {
      ...payload,
      id: `apt_${Date.now()}`,
      userId: uid,
      createdAt: new Date().toISOString(),
    };
    setAptitudeResults((prev) => [record, ...prev]);

    if (user?.isFirebaseUser && user.emailVerified) {
      await saveFirestoreAptitudeResult(record).catch(() => null);
    }
    await fetch('/api/aptitude/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': uid },
      body: JSON.stringify(record),
    }).catch(() => null);

    return record;
  };

  const createNote = async (
    payload: Omit<StudyNoteRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    const uid = user?.uid || 'guest';
    const now = new Date().toISOString();
    const record: StudyNoteRecord = {
      ...payload,
      important: Boolean(payload.important),
      id: `note_${Date.now()}`,
      userId: uid,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [record, ...prev]);

    if (user?.isFirebaseUser && user.emailVerified) {
      await saveFirestoreNote(record, false).catch(() => null);
    }
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': uid },
      body: JSON.stringify(record),
    }).catch(() => null);
  };

  const updateNote = async (note: StudyNoteRecord) => {
    const updated: StudyNoteRecord = {
      ...note,
      important: Boolean(note.important),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => prev.map((n) => (n.id === note.id ? updated : n)));

    if (user?.isFirebaseUser && user.emailVerified) {
      await saveFirestoreNote(updated, true).catch(() => null);
    }
    await fetch(`/api/notes/${encodeURIComponent(note.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-id': user?.uid || '' },
      body: JSON.stringify(updated),
    }).catch(() => null);
  };

  const toggleNoteImportant = async (noteId: string) => {
    let targetUpdated: StudyNoteRecord | null = null;
    const now = new Date().toISOString();

    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          targetUpdated = {
            ...n,
            important: !Boolean(n.important),
            updatedAt: now,
          };
          return targetUpdated;
        }
        return n;
      })
    );

    if (targetUpdated) {
      const noteToSave: StudyNoteRecord = targetUpdated;
      if (user?.isFirebaseUser && user.emailVerified) {
        await saveFirestoreNote(noteToSave, true).catch(() => null);
      }
      await fetch(`/api/notes/${encodeURIComponent(noteId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.uid || '' },
        body: JSON.stringify(noteToSave),
      }).catch(() => null);
    }
  };

  const removeNote = async (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    if (user?.isFirebaseUser && user.emailVerified) {
      await deleteFirestoreNote(noteId).catch(() => null);
    }
    await fetch(`/api/notes/${encodeURIComponent(noteId)}`, {
      method: 'DELETE',
      headers: { 'x-user-id': user?.uid || '' },
    }).catch(() => null);
  };

  const recordResumeAnalysis = async (record: ResumeAnalysisRecord) => {
    setResumes((prev) => [record, ...prev]);
    if (user?.isFirebaseUser && user.emailVerified) {
      await saveFirestoreResume(record).catch(() => null);
    }
  };

  const recordMockInterview = async (record: MockInterviewRecord) => {
    setInterviews((prev) => [record, ...prev]);
    if (user?.isFirebaseUser && user.emailVerified) {
      await saveFirestoreInterview(record).catch(() => null);
    }
  };

  const signOutAccount = async () => {
    localStorage.removeItem(SESSION_KEY);
    await logoutUser().catch(() => null);
    setUser(null);
    setActiveTab('dashboard');
  };

  const readiness = computeInterviewReadiness({
    profile,
    quizResults,
    aptitudeResults,
    interviews,
    latestResume: resumes[0] || null,
    notes,
  });

  return (
    <AppContext.Provider
      value={{
        user,
        authReady,
        dataLoading,
        activeTab,
        setActiveTab,
        selectedQuizCategory,
        setSelectedQuizCategory,
        profile,
        quizResults,
        aptitudeResults,
        notes,
        resumes,
        interviews,
        readiness,
        authenticateStudent,
        saveProfile,
        recordQuizResult,
        recordAptitudeResult,
        createNote,
        updateNote,
        toggleNoteImportant,
        removeNote,
        recordResumeAnalysis,
        recordMockInterview,
        signOutAccount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
