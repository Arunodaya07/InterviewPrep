/**
 * Firestore Security Rules Verification Specification (Dirty Dozen Test Suite)
 * Verifies that all 12 adversarial payloads in security_spec.md return PERMISSION_DENIED.
 */

export interface AdversarialTestCase {
  id: number;
  name: string;
  collection: string;
  docId: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED' | 'ALLOWED';
}

export const DIRTY_DOZEN_TESTS: AdversarialTestCase[] = [
  {
    id: 1,
    name: 'Shadow Field Injection on Profile Create',
    collection: 'users',
    docId: 'user_alpha',
    operation: 'create',
    auth: { uid: 'user_alpha', email_verified: true },
    payload: {
      firebaseUid: 'user_alpha',
      name: 'Aarav Sharma',
      email: 'aarav@cse.edu',
      college: 'NIT Trichy',
      degree: 'B.Tech',
      department: 'CSE',
      year: '4th Year',
      cgpa: '8.7',
      targetRole: 'Software Developer',
      preferredDomain: 'Backend Engineering',
      skills: ['Java', 'DBMS'],
      isAdmin: true, // Ghost field
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Identity Spoofing on QuizResult Create',
    collection: 'quizResults',
    docId: 'quiz_1',
    operation: 'create',
    auth: { uid: 'user_alpha', email_verified: true },
    payload: {
      userId: 'user_victim',
      category: 'Java',
      difficulty: 'Medium',
      totalQuestions: 5,
      correctAnswers: 4,
      wrongAnswers: 1,
      score: 4,
      percentage: 80,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified Email Write Attempt',
    collection: 'users',
    docId: 'user_unverified',
    operation: 'create',
    auth: { uid: 'user_unverified', email_verified: false },
    payload: {
      firebaseUid: 'user_unverified',
      name: 'Unverified User',
      email: 'spoof@cse.edu',
      college: 'IIT',
      degree: 'B.Tech',
      department: 'CSE',
      year: '3rd Year',
      cgpa: '8.0',
      targetRole: 'Software Developer',
      preferredDomain: 'Full Stack',
      skills: ['Python'],
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'PII Blanket Read Attack on Another User Profile',
    collection: 'users',
    docId: 'user_victim',
    operation: 'get',
    auth: { uid: 'user_alpha', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Unscoped List Scraping on Study Notes',
    collection: 'notes',
    docId: '*',
    operation: 'list',
    auth: { uid: 'user_alpha', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Orphaned Record Creation Without Parent Profile',
    collection: 'notes',
    docId: 'note_orphan',
    operation: 'create',
    auth: { uid: 'user_without_profile', email_verified: true },
    payload: {
      userId: 'user_without_profile',
      title: 'DBMS Normalization',
      subject: 'DBMS',
      topic: 'BCNF',
      content: 'Every determinant is a candidate key.',
      important: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'ID Poisoning with Invalid Characters',
    collection: 'notes',
    docId: 'invalid$id#with!spaces',
    operation: 'create',
    auth: { uid: 'user_alpha', email_verified: true },
    payload: {
      userId: 'user_alpha',
      title: 'OS Deadlocks',
      subject: 'OS',
      topic: 'Banker Algorithm',
      content: 'Deadlock avoidance algorithm.',
      important: false,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Denial of Wallet Oversized String Payload',
    collection: 'notes',
    docId: 'note_oversized',
    operation: 'create',
    auth: { uid: 'user_alpha', email_verified: true },
    payload: {
      userId: 'user_alpha',
      title: 'Oversized Note',
      subject: 'DSA',
      topic: 'Graphs',
      content: 'A'.repeat(20000),
      important: false,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Timestamp Forgery on Create',
    collection: 'bookmarks',
    docId: 'bm_forged_time',
    operation: 'create',
    auth: { uid: 'user_alpha', email_verified: true },
    payload: {
      userId: 'user_alpha',
      itemType: 'quiz',
      title: 'What is polymorphism?',
      category: 'OOP',
      content: 'Method overriding and overloading',
      explanation: 'Compile-time vs runtime polymorphism',
      referenceId: 'q_oop_1',
      createdAt: '1999-01-01T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Immutable Field Mutation on Note Update',
    collection: 'notes',
    docId: 'note_1',
    operation: 'update',
    auth: { uid: 'user_alpha', email_verified: true },
    payload: {
      userId: 'user_other',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Value Poisoning on Whitelisted Key During Update',
    collection: 'notes',
    docId: 'note_1',
    operation: 'update',
    auth: { uid: 'user_alpha', email_verified: true },
    payload: {
      title: true as unknown as string,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Unbounded Array Injection on Profile Skills',
    collection: 'users',
    docId: 'user_alpha',
    operation: 'update',
    auth: { uid: 'user_alpha', email_verified: true },
    payload: {
      skills: Array.from({ length: 50 }, (_, i) => `Skill_${i}`),
    },
    expectedResult: 'PERMISSION_DENIED',
  },
];
