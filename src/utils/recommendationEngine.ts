export interface QuizResultRecord {
  id: string;
  userId: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  percentage: number;
  createdAt: string;
}

export interface AptitudeResultRecord {
  id: string;
  userId: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  percentage: number;
  createdAt: string;
}

export interface StudyNoteRecord {
  id: string;
  userId: string;
  title: string;
  subject: string;
  topic: string;
  content: string;
  important: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookmarkRecord {
  id: string;
  userId: string;
  itemType: 'quiz' | 'aptitude' | 'note' | 'interview';
  title: string;
  category: string;
  content: string;
  explanation: string;
  referenceId: string;
  createdAt: string;
}

export interface ResumeSectionBreakdown {
  technicalSkillsScore: number;
  projectsScore: number;
  educationScore: number;
  structureAndAtsScore: number;
}

export interface ResumeAnalysisRecord {
  id: string;
  userId: string;
  fileName: string;
  targetRole: string;
  resumeScore: number;
  candidateName?: string;
  detectedEducation?: string;
  detectedProjects?: string[];
  roleMatchPercentage?: number;
  sectionBreakdown?: ResumeSectionBreakdown;
  skillsFound: string[];
  missingSkills: string[];
  strengths: string[];
  areasToImprove: string[];
  suggestedSkills: string[];
  suggestedImprovements: string[];
  summary: string;
  createdAt: string;
}

export interface InterviewDimensionAverages {
  technicalAccuracy: number; // 0-100
  relevance: number; // 0-100
  clarity: number; // 0-100
  communication: number; // 0-100
  completeness: number; // 0-100
}

export interface MockInterviewRecord {
  id: string;
  userId: string;
  role: string;
  type: 'Technical' | 'HR' | 'Mixed';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  experienceLevel: string;
  totalQuestions: number;
  overallScore: number; // 0 to 100
  performanceBand?: string;
  dimensionAverages?: InterviewDimensionAverages;
  strongAreas: string[];
  weakAreas: string[];
  suggestions: string[];
  transcriptSummary: string;
  createdAt: string;
}

export interface StudentProfileRecord {
  firebaseUid: string;
  name: string;
  email: string;
  college: string;
  degree: string;
  department: string;
  year: '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | 'Graduated';
  cgpa: string;
  targetRole: string;
  preferredDomain: string;
  skills: string[];
  interests?: string[];
  knownSubjects?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RecommendationItem {
  id: string;
  topic: string;
  module: 'Technical Quiz' | 'Aptitude' | 'Mock Interview' | 'Resume & Skills' | 'Study Notes';
  currentScore: number | null;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  recommendedAction: string;
  ruleApplied: string;
  targetTab: string;
}

export interface ReadinessBreakdown {
  technicalScore: number; // 0-100
  aptitudeScore: number; // 0-100
  resumeScore: number; // 0-100
  learningProgressScore: number; // 0-100
  mockInterviewScore: number; // 0-100
  weightedTechnical: number; // max 30
  weightedAptitude: number; // max 25
  weightedResume: number; // max 20
  weightedLearning: number; // max 15
  weightedInterview: number; // max 10
  totalReadinessScore: number; // 0-100
  readinessBand: 'Early Stage' | 'Developing' | 'Placement Ready' | 'Strong Contender';
}

export const ALL_CSE_SUBJECTS = [
  'Java',
  'Python',
  'C',
  'Data Structures',
  'DBMS',
  'Operating Systems',
  'Computer Networks',
  'OOP',
];

export const CAREER_INTEREST_OPTIONS = [
  'Full Stack Web Development',
  'Backend & Distributed Systems',
  'Software Engineering (SDE)',
  'Data Science & Analytics',
  'Cloud & DevOps Engineering',
  'Quality Assurance & Test Automation',
  'Core Java Enterprise Development',
  'Python & Backend APIs',
];

const INTEREST_TO_SUBJECTS: Record<string, string[]> = {
  'Full Stack Web Development': ['Java', 'Python', 'DBMS', 'Data Structures', 'Computer Networks'],
  'Backend & Distributed Systems': ['DBMS', 'Operating Systems', 'Computer Networks', 'Java', 'Data Structures'],
  'Software Engineering (SDE)': ['Data Structures', 'OOP', 'DBMS', 'Operating Systems', 'Java'],
  'Data Science & Analytics': ['Python', 'DBMS', 'Data Structures'],
  'Cloud & DevOps Engineering': ['Operating Systems', 'Computer Networks', 'Python', 'DBMS'],
  'Quality Assurance & Test Automation': ['Java', 'Python', 'OOP', 'DBMS'],
  'Core Java Enterprise Development': ['Java', 'OOP', 'DBMS', 'Data Structures'],
  'Python & Backend APIs': ['Python', 'DBMS', 'Data Structures', 'Computer Networks'],
};

/**
 * Simple Rule-Based Recommendation System ("What Should I Prepare Next?")
 * Incorporates:
 * 1. Quiz & Aptitude Scores (<50% High Priority, 50-70% Medium Priority, >=70% Low Priority)
 * 2. Student's Career Interests & Already Known Subjects from Profile/Login
 * 3. Resume Missing Skills & Mock Interview performance
 */
export function computeRuleBasedRecommendations(params: {
  profile: StudentProfileRecord | null;
  quizResults: QuizResultRecord[];
  aptitudeResults: AptitudeResultRecord[];
  interviews: MockInterviewRecord[];
  latestResume: ResumeAnalysisRecord | null;
  notes: StudyNoteRecord[];
}): RecommendationItem[] {
  const { profile, quizResults, aptitudeResults, interviews, latestResume, notes } = params;
  const recommendations: RecommendationItem[] = [];

  const knownSet = new Set(
    (profile?.knownSubjects || profile?.skills || []).map((s) => s.toLowerCase())
  );
  const userInterests = profile?.interests || [];

  // Determine priority subjects based on user's selected career interests
  const interestSubjects = new Set<string>();
  for (const interest of userInterests) {
    const mapped = INTEREST_TO_SUBJECTS[interest] || [];
    mapped.forEach((s) => interestSubjects.add(s));
  }
  if (interestSubjects.size === 0) {
    ['Data Structures', 'DBMS', 'OOP', 'Java', 'Python'].forEach((s) => interestSubjects.add(s));
  }

  // 1. Evaluate Technical Quiz topics by average percentage
  const topicStats = new Map<string, { sum: number; count: number; latest: number }>();
  for (const q of quizResults) {
    const existing = topicStats.get(q.category) || { sum: 0, count: 0, latest: q.percentage };
    existing.sum += q.percentage;
    existing.count += 1;
    topicStats.set(q.category, existing);
  }

  for (const [category, stats] of topicStats.entries()) {
    const avgScore = Math.round(stats.sum / stats.count);
    const hasNotes = notes.some((n) => n.subject.toLowerCase() === category.toLowerCase());
    const isKnown = knownSet.has(category.toLowerCase());

    if (avgScore < 50) {
      recommendations.push({
        id: `rec-tech-${category}`,
        topic: category,
        module: 'Technical Quiz',
        currentScore: avgScore,
        priority: 'HIGH',
        reason: isKnown
          ? `You marked ${category} as a known subject, but your recent quiz score is ${avgScore}% (< 50%).`
          : `Your average score in ${category} is ${avgScore}% (below the 50% threshold).`,
        recommendedAction: hasNotes
          ? `Focus on this topic: Review your ${category} study notes and retake a practice quiz.`
          : `Focus on this topic: Create revision notes for ${category} and practice a 5-question quiz.`,
        ruleApplied: 'If topic score < 50% → Priority = HIGH ("Focus on this topic")',
        targetTab: 'quiz',
      });
    } else if (avgScore < 70) {
      recommendations.push({
        id: `rec-tech-${category}`,
        topic: category,
        module: 'Technical Quiz',
        currentScore: avgScore,
        priority: 'MEDIUM',
        reason: `Your average score in ${category} is ${avgScore}% (between 50% and 70%).`,
        recommendedAction: `Practice more: Attempt a Medium/Hard ${category} quiz to push your accuracy above 70%.`,
        ruleApplied: 'If 50% ≤ score < 70% → Priority = MEDIUM ("Practice more")',
        targetTab: 'quiz',
      });
    } else {
      recommendations.push({
        id: `rec-tech-${category}`,
        topic: category,
        module: 'Technical Quiz',
        currentScore: avgScore,
        priority: 'LOW',
        reason: `Strong performance in ${category} with an average of ${avgScore}% (above 70%).`,
        recommendedAction: `Maintain your performance: Periodically review bookmarked ${category} questions.`,
        ruleApplied: 'If score ≥ 70% → Priority = LOW ("Maintain your performance")',
        targetTab: 'quiz',
      });
    }
  }

  // 2. Evaluate Aptitude categories
  const aptStats = new Map<string, { sum: number; count: number }>();
  for (const a of aptitudeResults) {
    const existing = aptStats.get(a.category) || { sum: 0, count: 0 };
    existing.sum += a.percentage;
    existing.count += 1;
    aptStats.set(a.category, existing);
  }

  for (const [category, stats] of aptStats.entries()) {
    const avgScore = Math.round(stats.sum / stats.count);
    if (avgScore < 50) {
      recommendations.push({
        id: `rec-apt-${category}`,
        topic: category,
        module: 'Aptitude',
        currentScore: avgScore,
        priority: 'HIGH',
        reason: `Your ${category} score is ${avgScore}% (below 50%).`,
        recommendedAction: `Focus on this topic: Practice a timed 6-question set in ${category}.`,
        ruleApplied: 'If topic score < 50% → Priority = HIGH ("Focus on this topic")',
        targetTab: 'aptitude',
      });
    } else if (avgScore < 70) {
      recommendations.push({
        id: `rec-apt-${category}`,
        topic: category,
        module: 'Aptitude',
        currentScore: avgScore,
        priority: 'MEDIUM',
        reason: `Your ${category} score is ${avgScore}% (between 50% and 70%).`,
        recommendedAction: `Practice more: Continue practicing ${category} to improve speed and accuracy.`,
        ruleApplied: 'If 50% ≤ score < 70% → Priority = MEDIUM ("Practice more")',
        targetTab: 'aptitude',
      });
    } else {
      recommendations.push({
        id: `rec-apt-${category}`,
        topic: category,
        module: 'Aptitude',
        currentScore: avgScore,
        priority: 'LOW',
        reason: `Good ${category} accuracy at ${avgScore}%.`,
        recommendedAction: `Maintain your performance: Take one timed ${category} test weekly.`,
        ruleApplied: 'If score ≥ 70% → Priority = LOW ("Maintain your performance")',
        targetTab: 'aptitude',
      });
    }
  }

  // 3. Personalized Recommendations based on User's Interests & Already Known Subjects
  const attemptedCategories = new Set(quizResults.map((q) => q.category));

  // 3a. Subjects required by user's Career Interests that are NOT yet known and NOT yet attempted -> HIGH PRIORITY
  for (const subject of interestSubjects) {
    if (!attemptedCategories.has(subject) && !knownSet.has(subject.toLowerCase())) {
      recommendations.push({
        id: `rec-interest-gap-${subject}`,
        topic: subject,
        module: 'Technical Quiz',
        currentScore: null,
        priority: 'HIGH',
        reason: `Required for your interest (${userInterests[0] || profile?.targetRole || 'Software Developer'}), and not yet in your known subjects.`,
        recommendedAction: `Focus on this topic: Start a foundational ${subject} quiz and create study notes.`,
        ruleApplied: 'Interest Skill Gap (Not in Known Subjects) → Priority = HIGH',
        targetTab: 'quiz',
      });
    }
  }

  // 3b. Subjects the user marked as "Already Known" at login/profile but hasn't verified with a quiz yet -> MEDIUM PRIORITY
  for (const subject of ALL_CSE_SUBJECTS) {
    if (!attemptedCategories.has(subject) && knownSet.has(subject.toLowerCase())) {
      recommendations.push({
        id: `rec-verify-known-${subject}`,
        topic: subject,
        module: 'Technical Quiz',
        currentScore: null,
        priority: 'MEDIUM',
        reason: `You selected ${subject} as an already known subject in your profile.`,
        recommendedAction: `Practice more: Take a quick 5-question ${subject} quiz to verify your mastery and boost your Readiness Score.`,
        ruleApplied: 'Known Subject Verification Pending → Priority = MEDIUM',
        targetTab: 'quiz',
      });
    }
  }

  // 4. Evaluate Aptitude if no aptitude test taken yet
  if (aptitudeResults.length === 0) {
    recommendations.push({
      id: 'rec-apt-initial',
      topic: 'Quantitative Aptitude',
      module: 'Aptitude',
      currentScore: null,
      priority: 'HIGH',
      reason: 'Aptitude rounds are mandatory in campus placement screening.',
      recommendedAction: 'Focus on this topic: Complete a 6-question Quantitative Aptitude practice test.',
      ruleApplied: 'Unattempted Aptitude Screening → Priority = HIGH',
      targetTab: 'aptitude',
    });
  }

  // 5. Evaluate Resume Score & Missing Skills
  if (!latestResume) {
    recommendations.push({
      id: 'rec-resume-missing',
      topic: `Resume Analysis (${profile?.targetRole || 'Software Developer'})`,
      module: 'Resume & Skills',
      currentScore: null,
      priority: 'MEDIUM',
      reason: 'Upload your resume to compare your skills with your target role.',
      recommendedAction: `Practice more: Upload your resume in the AI Resume Analyzer for ${profile?.targetRole || 'Software Developer'}.`,
      ruleApplied: 'Resume Evaluation Pending → Priority = MEDIUM',
      targetTab: 'resume',
    });
  } else {
    const rScore = latestResume.resumeScore;
    const missingList = latestResume.missingSkills.slice(0, 3).join(', ');
    if (rScore < 50) {
      recommendations.push({
        id: 'rec-resume-score',
        topic: `Resume Alignment (${latestResume.targetRole})`,
        module: 'Resume & Skills',
        currentScore: rScore,
        priority: 'HIGH',
        reason: `Your resume score is ${rScore}%${missingList ? ` and is missing: ${missingList}` : ''}.`,
        recommendedAction: `Focus on this topic: Add projects covering ${missingList || 'core role skills'}.`,
        ruleApplied: 'If score < 50% → Priority = HIGH ("Focus on this topic")',
        targetTab: 'resume',
      });
    } else if (rScore < 70) {
      recommendations.push({
        id: 'rec-resume-score',
        topic: `Resume Skill Gaps (${latestResume.targetRole})`,
        module: 'Resume & Skills',
        currentScore: rScore,
        priority: 'MEDIUM',
        reason: `Your resume score is ${rScore}%${missingList ? `. Missing skills: ${missingList}` : ''}.`,
        recommendedAction: `Practice more: Incorporate ${missingList || 'suggested keywords'} and measurable outcomes.`,
        ruleApplied: 'If 50% ≤ score < 70% → Priority = MEDIUM ("Practice more")',
        targetTab: 'resume',
      });
    } else {
      recommendations.push({
        id: 'rec-resume-score',
        topic: `Resume Quality (${latestResume.targetRole})`,
        module: 'Resume & Skills',
        currentScore: rScore,
        priority: 'LOW',
        reason: `Your resume score is ${rScore}% with strong alignment to ${latestResume.targetRole}.`,
        recommendedAction: 'Maintain your performance: Keep updating your resume with new projects.',
        ruleApplied: 'If score ≥ 70% → Priority = LOW ("Maintain your performance")',
        targetTab: 'resume',
      });
    }
  }

  // 6. Evaluate Mock Interview performance
  if (interviews.length === 0) {
    recommendations.push({
      id: 'rec-interview-unstarted',
      topic: `AI Mock Interview (${profile?.targetRole || 'Software Developer'})`,
      module: 'Mock Interview',
      currentScore: null,
      priority: 'MEDIUM',
      reason: 'Practice explaining your technical knowledge in a simulated interview.',
      recommendedAction: `Practice more: Start a 3-question Technical Mock Interview for ${profile?.targetRole || 'Software Developer'}.`,
      ruleApplied: 'Mock Interview Pending → Priority = MEDIUM',
      targetTab: 'interview',
    });
  } else {
    const avgInterview = Math.round(
      interviews.reduce((acc, item) => acc + item.overallScore, 0) / interviews.length
    );
    if (avgInterview < 50) {
      recommendations.push({
        id: 'rec-interview-score',
        topic: 'AI Mock Interview Communication',
        module: 'Mock Interview',
        currentScore: avgInterview,
        priority: 'HIGH',
        reason: `Your average mock interview score is ${avgInterview}% (< 50%).`,
        recommendedAction: 'Focus on this topic: Practice structuring technical explanations using examples.',
        ruleApplied: 'If score < 50% → Priority = HIGH ("Focus on this topic")',
        targetTab: 'interview',
      });
    } else if (avgInterview < 70) {
      recommendations.push({
        id: 'rec-interview-score',
        topic: 'AI Mock Interview Readiness',
        module: 'Mock Interview',
        currentScore: avgInterview,
        priority: 'MEDIUM',
        reason: `Your mock interview score is ${avgInterview}% (between 50% and 70%).`,
        recommendedAction: 'Practice more: Attempt a Mixed (Technical + HR) mock interview.',
        ruleApplied: 'If 50% ≤ score < 70% → Priority = MEDIUM ("Practice more")',
        targetTab: 'interview',
      });
    } else {
      recommendations.push({
        id: 'rec-interview-score',
        topic: 'AI Mock Interview Readiness',
        module: 'Mock Interview',
        currentScore: avgInterview,
        priority: 'LOW',
        reason: `Strong mock interview score of ${avgInterview}%.`,
        recommendedAction: 'Maintain your performance: Practice Hard difficulty scenario questions.',
        ruleApplied: 'If score ≥ 70% → Priority = LOW ("Maintain your performance")',
        targetTab: 'interview',
      });
    }
  }

  // Sort HIGH -> MEDIUM -> LOW, with scored items prioritized clearly
  const priorityRank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  recommendations.sort((a, b) => {
    const pDiff = priorityRank[a.priority] - priorityRank[b.priority];
    if (pDiff !== 0) return pDiff;
    const scoreA = a.currentScore ?? 45;
    const scoreB = b.currentScore ?? 45;
    return scoreA - scoreB;
  });

  return recommendations;
}

/**
 * Transparent Interview Readiness Score Calculator
 * Formula:
 * Readiness Score =
 *   Technical × 0.30
 * + Aptitude × 0.25
 * + Resume × 0.20
 * + Learning Progress × 0.15
 * + Mock Interview × 0.10
 */
export function computeInterviewReadiness(params: {
  profile: StudentProfileRecord | null;
  quizResults: QuizResultRecord[];
  aptitudeResults: AptitudeResultRecord[];
  interviews: MockInterviewRecord[];
  latestResume: ResumeAnalysisRecord | null;
  notes: StudyNoteRecord[];
}): ReadinessBreakdown {
  const { profile, quizResults, aptitudeResults, interviews, latestResume, notes } = params;

  const technicalScore =
    quizResults.length > 0
      ? Math.round(quizResults.reduce((acc, q) => acc + q.percentage, 0) / quizResults.length)
      : 0;

  const aptitudeScore =
    aptitudeResults.length > 0
      ? Math.round(aptitudeResults.reduce((acc, a) => acc + a.percentage, 0) / aptitudeResults.length)
      : 0;

  const resumeScore = latestResume ? Math.min(100, Math.max(0, latestResume.resumeScore)) : 0;

  // Learning Progress combines practiced topics, known subjects, study notes, and profile setup
  const distinctQuizTopics = new Set(quizResults.map((q) => q.category)).size;
  const distinctAptTopics = new Set(aptitudeResults.map((a) => a.category)).size;
  const knownCount = (profile?.knownSubjects || []).length;
  const topicCoveragePts = Math.min(
    40,
    Math.round(((distinctQuizTopics + distinctAptTopics + Math.min(3, knownCount)) / 8) * 40)
  );
  const notesPts = Math.min(35, Math.round((Math.min(notes.length, 4) / 4) * 35));
  const profileCompletedFields = profile
    ? [
        profile.name,
        profile.college,
        profile.department,
        profile.cgpa,
        profile.targetRole,
        (profile.skills?.length || 0) > 0 || (profile.knownSubjects?.length || 0) > 0 ? 'skills' : '',
      ].filter(Boolean).length
    : 0;
  const profilePts = Math.round((profileCompletedFields / 6) * 25);
  const learningProgressScore = Math.min(100, topicCoveragePts + notesPts + profilePts);

  const mockInterviewScore =
    interviews.length > 0
      ? Math.round(interviews.reduce((acc, i) => acc + i.overallScore, 0) / interviews.length)
      : 0;

  const weightedTechnical = Number((technicalScore * 0.3).toFixed(1));
  const weightedAptitude = Number((aptitudeScore * 0.25).toFixed(1));
  const weightedResume = Number((resumeScore * 0.2).toFixed(1));
  const weightedLearning = Number((learningProgressScore * 0.15).toFixed(1));
  const weightedInterview = Number((mockInterviewScore * 0.1).toFixed(1));

  const totalReadinessScore = Math.round(
    weightedTechnical + weightedAptitude + weightedResume + weightedLearning + weightedInterview
  );

  let readinessBand: ReadinessBreakdown['readinessBand'] = 'Early Stage';
  if (totalReadinessScore >= 80) {
    readinessBand = 'Strong Contender';
  } else if (totalReadinessScore >= 65) {
    readinessBand = 'Placement Ready';
  } else if (totalReadinessScore >= 40) {
    readinessBand = 'Developing';
  }

  return {
    technicalScore,
    aptitudeScore,
    resumeScore,
    learningProgressScore,
    mockInterviewScore,
    weightedTechnical,
    weightedAptitude,
    weightedResume,
    weightedLearning,
    weightedInterview,
    totalReadinessScore,
    readinessBand,
  };
}
