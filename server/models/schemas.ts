import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    college: { type: String, default: '' },
    degree: { type: String, default: 'B.Tech' },
    department: { type: String, default: 'CSE' },
    year: { type: String, default: '4th Year' },
    cgpa: { type: String, default: '' },
    targetRole: { type: String, default: 'Software Developer' },
    preferredDomain: { type: String, default: 'Full Stack Development' },
    skills: { type: [String], default: [] },
  },
  { timestamps: true }
);

const QuizQuestionSchema = new Schema({
  id: { type: String, required: true, unique: true },
  category: { type: String, required: true, index: true },
  difficulty: { type: String, required: true },
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
  explanation: { type: String, required: true },
});

const QuizResultSchema = new Schema({
  userId: { type: String, required: true, index: true },
  category: { type: String, required: true },
  difficulty: { type: String, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  wrongAnswers: { type: Number, required: true },
  score: { type: Number, required: true },
  percentage: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const AptitudeQuestionSchema = new Schema({
  id: { type: String, required: true, unique: true },
  category: { type: String, required: true, index: true },
  difficulty: { type: String, required: true },
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
  explanation: { type: String, required: true },
});

const AptitudeResultSchema = new Schema({
  userId: { type: String, required: true, index: true },
  category: { type: String, required: true },
  difficulty: { type: String, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  wrongAnswers: { type: Number, required: true },
  score: { type: Number, required: true },
  percentage: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const NoteSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    content: { type: String, required: true },
    important: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const BookmarkSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    itemType: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    content: { type: String, default: '' },
    explanation: { type: String, default: '' },
    referenceId: { type: String, default: '' },
  },
  { timestamps: true }
);

const ResumeSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    fileName: { type: String, required: true },
    targetRole: { type: String, required: true },
    resumeScore: { type: Number, required: true },
    skillsFound: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    strengths: { type: [String], default: [] },
    areasToImprove: { type: [String], default: [] },
    suggestedSkills: { type: [String], default: [] },
    suggestedImprovements: { type: [String], default: [] },
    summary: { type: String, default: '' },
  },
  { timestamps: true }
);

const InterviewSchema = new Schema({
  userId: { type: String, required: true, index: true },
  role: { type: String, required: true },
  type: { type: String, required: true },
  difficulty: { type: String, required: true },
  experienceLevel: { type: String, default: 'Fresher (B.Tech)' },
  totalQuestions: { type: Number, default: 3 },
  overallScore: { type: Number, required: true },
  strongAreas: { type: [String], default: [] },
  weakAreas: { type: [String], default: [] },
  suggestions: { type: [String], default: [] },
  transcriptSummary: { type: String, default: '' },
  date: { type: Date, default: Date.now },
});

const ProgressSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    topics: { type: [String], default: [] },
    completedQuizzes: { type: Number, default: 0 },
    completedAptitude: { type: Number, default: 0 },
    completedInterviews: { type: Number, default: 0 },
    overallProgress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.Users || mongoose.model('Users', UserSchema);
export const QuizQuestionModel = mongoose.models.QuizQuestions || mongoose.model('QuizQuestions', QuizQuestionSchema);
export const QuizResultModel = mongoose.models.QuizResults || mongoose.model('QuizResults', QuizResultSchema);
export const AptitudeQuestionModel = mongoose.models.AptitudeQuestions || mongoose.model('AptitudeQuestions', AptitudeQuestionSchema);
export const AptitudeResultModel = mongoose.models.AptitudeResults || mongoose.model('AptitudeResults', AptitudeResultSchema);
export const NoteModel = mongoose.models.Notes || mongoose.model('Notes', NoteSchema);
export const BookmarkModel = mongoose.models.Bookmarks || mongoose.model('Bookmarks', BookmarkSchema);
export const ResumeModel = mongoose.models.Resumes || mongoose.model('Resumes', ResumeSchema);
export const InterviewModel = mongoose.models.Interviews || mongoose.model('Interviews', InterviewSchema);
export const ProgressModel = mongoose.models.Progress || mongoose.model('Progress', ProgressSchema);
