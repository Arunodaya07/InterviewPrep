import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  Compass,
  FileText,
  Info,
  Lock,
  Mail,
  MessageSquare,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import { NavigationTab, useApp } from '../context/AppContext.tsx';
import { loginWithGoogle, resetUserPassword } from '../firebase.ts';
import {
  ALL_CSE_SUBJECTS,
  CAREER_INTEREST_OPTIONS,
} from '../utils/recommendationEngine.ts';
import heroImg from '../assets/images/hero_interview_prep_1790747026201.jpg';

const TARGET_ROLES = [
  'Software Developer',
  'Java Developer',
  'Python Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Analyst',
  'QA Engineer',
];

export function LandingPage() {
  const { authenticateStudent } = useApp();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [pendingTab, setPendingTab] = useState<NavigationTab>('dashboard');

  const [name, setName] = useState('Aarav Sharma');
  const [email, setEmail] = useState('student@cse.edu');
  const [password, setPassword] = useState('student123');
  const [targetRole, setTargetRole] = useState('Software Developer');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Full Stack Web Development',
    'Software Engineering (SDE)',
  ]);
  const [selectedKnownSubjects, setSelectedKnownSubjects] = useState<string[]>([
    'Java',
    'DBMS',
    'OOP',
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const openModal = (mode: 'login' | 'register', targetModule: NavigationTab = 'dashboard') => {
    setAuthMode(mode);
    setPendingTab(targetModule);
    setErrorMsg(null);
    setStatusMsg(null);
    setAuthModalOpen(true);
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleKnownSubject = (subject: string) => {
    setSelectedKnownSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleQuickDemoLogin = async (targetModule: NavigationTab = pendingTab) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await authenticateStudent({
        mode: 'login',
        name: name.trim() || 'Aarav Sharma',
        email: email.trim() || 'student@cse.edu',
        password: password || 'student123',
        targetRole,
        interests:
          selectedInterests.length > 0 ? selectedInterests : ['Full Stack Web Development'],
        knownSubjects:
          selectedKnownSubjects.length > 0 ? selectedKnownSubjects : ['Java', 'DBMS', 'OOP'],
        initialTab: targetModule,
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not complete login.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setStatusMsg(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch {
      // Fallback to end-to-end student authentication if popup is blocked in iframe
      await handleQuickDemoLogin(pendingTab);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStatusMsg(null);
    setLoading(true);

    try {
      if (authMode === 'forgot') {
        if (!email.trim()) {
          setErrorMsg('Please enter your registered email address.');
          setLoading(false);
          return;
        }
        await resetUserPassword(email.trim()).catch(() => null);
        setStatusMsg('Password reset instructions have been sent to your email address.');
        setLoading(false);
        return;
      }

      if (!email.trim() || !password) {
        setErrorMsg('Please enter both your email address and password.');
        setLoading(false);
        return;
      }

      await authenticateStudent({
        mode: authMode === 'register' ? 'register' : 'login',
        name: name.trim() || email.split('@')[0] || 'B.Tech Student',
        email: email.trim(),
        password,
        targetRole,
        interests:
          selectedInterests.length > 0 ? selectedInterests : ['Full Stack Web Development'],
        knownSubjects:
          selectedKnownSubjects.length > 0 ? selectedKnownSubjects : ['Java', 'DBMS', 'OOP'],
        initialTab: pendingTab,
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const modulesList: Array<{
    index: string;
    title: string;
    tab: NavigationTab;
    description: string;
    metrics: string;
  }> = [
    {
      index: '01. Technical Practice',
      title: 'Core CSE Subject Quizzes',
      tab: 'quiz',
      description:
        'Interactive MCQ quizzes across Java, Python, C, Data Structures, DBMS, Operating Systems, Computer Networks, and OOP with instant explanations.',
      metrics: '8 CSE subjects · 3 difficulty levels · Ask questions immediately',
    },
    {
      index: '02. Aptitude Practice',
      title: 'Quantitative, Logical & Verbal Tests',
      tab: 'aptitude',
      description:
        'Timed online placement screening rounds with step-by-step question navigation, countdown timer, and detailed solution breakdowns.',
      metrics: 'Quantitative · Logical Reasoning · Verbal Ability',
    },
    {
      index: '03. AI Resume Analyzer',
      title: 'Resume Upload & Gemini Evaluation',
      tab: 'resume',
      description:
        'Upload your resume (.PDF, .DOCX, .TXT) and benchmark your extracted skills against your target role using Google Gemini AI.',
      metrics: 'Direct file upload · Missing skill gaps · Actionable improvements',
    },
    {
      index: '04. AI Mock Interview',
      title: 'Interactive Technical & HR Interviews',
      tab: 'interview',
      description:
        'Practice realistic role-specific interview questions one by one and receive structured 10-point evaluation on technical accuracy and clarity.',
      metrics: 'Technical, HR & Mixed modes · Real-time Gemini feedback',
    },
    {
      index: '05. Study Notes',
      title: 'Subject Revision & Important Notes',
      tab: 'notes',
      description:
        'Create, edit, search, and filter CSE subject revision notes with a dedicated Important Only filter for last-minute interview prep.',
      metrics: 'Subject tags · Important Only filter · Instant search',
    },
    {
      index: '06. Progress Tracker',
      title: 'Visual Analytics & Profile Progress',
      tab: 'progress',
      description:
        'Maintain your academic profile, known subjects, Recharts subject accuracy bars, aptitude breakdowns, and interview performance history.',
      metrics: 'Visual Recharts graphs · Subject mastery · Session history',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar Contract: 3 Zones (Single-element Brand Wordmark | 4 Nav Links | 2 Actions) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-6 lg:px-12 py-4 flex items-center justify-between">
        <a
          href="#top"
          className="text-lg font-bold tracking-tight text-slate-900 font-display whitespace-nowrap"
        >
          InterviewPrep Tracker
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-slate-900 transition-colors whitespace-nowrap">
            Modules
          </a>
          <button
            type="button"
            onClick={() => openModal('login', 'quiz')}
            className="hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer"
          >
            Technical Quiz
          </button>
          <button
            type="button"
            onClick={() => openModal('login', 'aptitude')}
            className="hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer"
          >
            Aptitude Practice
          </button>
          <button
            type="button"
            onClick={() => openModal('login', 'interview')}
            className="hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer"
          >
            AI Mock Interview
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => openModal('login', 'dashboard')}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer"
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => openModal('register', 'dashboard')}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main id="top" className="flex-1">
        <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-20 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>B.Tech CSE Placement Readiness Platform</span>
              <span aria-hidden="true">·</span>
              <span>Personalized by Interests & Known Subjects</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Prepare Smarter. Interview Better.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              An AI-powered interview preparation and placement readiness platform for B.Tech students. Sign in with your career interests and already known subjects to unlock interactive technical quizzes, aptitude practice, resume upload analysis, and AI mock interviews.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => openModal('register', 'dashboard')}
                className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>Get Started (Set Interests & Subjects)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => openModal('login', 'dashboard')}
                className="px-6 py-3 text-sm font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                Login to Dashboard
              </button>
            </div>

            <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-6 max-w-xl">
              <div>
                <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                  8 Modules
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Click Any Module to Open</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                  110+ MCQs
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Technical & Aptitude Bank</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                  End-to-End
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Profile & Progress Tracking</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video lg:aspect-[4/3]">
              {!imgError ? (
                <img
                  src={heroImg}
                  alt="University computer science lab workspace with laptop and study notebooks"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900 text-white">
                  <Brain className="w-12 h-12 text-blue-400 mb-3" />
                  <p className="text-base font-semibold">InterviewPrep Tracker Workspace</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Technical Practice · Aptitude · AI Resume & Mock Interviews
                  </p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-end p-6">
                <div className="text-xs text-blue-300 font-mono">PERSONALIZED GUIDANCE</div>
                <div className="text-lg font-semibold text-white mt-1">
                  "What Should I Prepare Next?"
                </div>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                  Tailors your study plan from your career interests, already known CSE subjects, quiz accuracy, and resume skill gaps.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Feature Modules Section (Clicking opens the module!) */}
        <section id="features" className="bg-white border-y border-slate-200 py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="max-w-2xl">
                <div className="text-xs font-medium text-blue-600">Interactive Platform Modules</div>
                <h2 className="text-3xl font-bold text-slate-900 mt-1">
                  Click Any Module Below to Launch Practice
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Every module is connected to your student profile, personalized recommendations, and progress tracker.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('dashboard')}
                className="px-4 py-2.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg inline-flex items-center gap-1.5 self-start cursor-pointer"
              >
                <span>Instant Demo Student Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {modulesList.map((item) => (
                <div
                  key={item.index}
                  onClick={() => openModal('login', item.tab)}
                  className="p-6 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between hover:border-blue-600 hover:bg-white transition-all cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-blue-600 font-semibold">
                        {item.index}
                      </span>
                      <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                        Open Module <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mt-2">{item.title}</h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="pt-4 mt-6 border-t border-slate-200/80 text-xs text-slate-500">
                    {item.metrics}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            InterviewPrep Tracker — AI-Powered Interview Preparation & Placement Readiness Platform
          </div>
          <div>Built for B.Tech / CSE Placement Readiness</div>
        </div>
      </footer>

      {/* End-to-End Login & Registration Modal with Interests & Already Known Subjects */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full p-6 shadow-xl my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {authMode === 'login' && 'Student Login & Personalized Setup'}
                  {authMode === 'register' && 'Create B.Tech Student Account'}
                  {authMode === 'forgot' && 'Reset Your Password'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {pendingTab !== 'dashboard'
                    ? `Sign in to open the ${pendingTab.toUpperCase()} module directly`
                    : 'Sign in with your interests and known subjects for personalized recommendations'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed">
                  {errorMsg}
                </div>
              )}

              {statusMsg && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 leading-relaxed">
                  {statusMsg}
                </div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Student Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Aarav Sharma"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target Placement Role
                    </label>
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-600"
                    >
                      {TARGET_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@college.edu"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  {authMode !== 'forgot' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {authMode !== 'forgot' && (
                  <>
                    {/* Career Interests Selection for Personalized Recommendations */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-800">
                          1. Select Your Career Interests ({selectedInterests.length} selected)
                        </label>
                        <span className="text-[11px] text-slate-500">
                          Drives personalized recommendations
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {CAREER_INTEREST_OPTIONS.map((interest) => {
                          const active = selectedInterests.includes(interest);
                          return (
                            <button
                              key={interest}
                              type="button"
                              onClick={() => toggleInterest(interest)}
                              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                                active
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {interest}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Already Known Subjects Selection */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-800">
                          2. Select Already Known CSE Subjects ({selectedKnownSubjects.length} selected)
                        </label>
                        <span className="text-[11px] text-slate-500">
                          Saved to your Profile & Progress
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {ALL_CSE_SUBJECTS.map((subj) => {
                          const active = selectedKnownSubjects.includes(subj);
                          return (
                            <button
                              key={subj}
                              type="button"
                              onClick={() => toggleKnownSubject(subj)}
                              className={`px-2.5 py-1.5 rounded-md text-xs font-medium border text-left transition-colors flex items-center justify-between cursor-pointer ${
                                active
                                  ? 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <span className="truncate">{subj}</span>
                              {active && <CheckCircle2 className="w-3 h-3 text-blue-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer"
                >
                  {loading
                    ? 'Signing in to Workspace...'
                    : authMode === 'login'
                    ? 'Login & Load Personalized Workspace'
                    : authMode === 'register'
                    ? 'Register & Save Profile Preferences'
                    : 'Send Password Reset Email'}
                </button>
              </form>

              {authMode !== 'forgot' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin(pendingTab)}
                    disabled={loading}
                    className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>1-Click Instant Student Login</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 disabled:opacity-50 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Continue with Google</span>
                  </button>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                {authMode === 'login' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setErrorMsg(null);
                      }}
                      className="text-blue-600 hover:underline font-medium cursor-pointer"
                    >
                      New student? Create account
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot');
                        setErrorMsg(null);
                      }}
                      className="text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMsg(null);
                    }}
                    className="text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    Already have an account? Back to Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
