import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  FileText,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import { NavigationTab, useApp } from '../context/AppContext.tsx';

export function DashboardPage() {
  const {
    profile,
    quizResults,
    aptitudeResults,
    resumes,
    interviews,
    notes,
    readiness,
    setActiveTab,
    setSelectedQuizCategory,
  } = useApp();

  const completedProfileFields = profile
    ? [
        profile.name,
        profile.college,
        profile.department,
        profile.cgpa,
        profile.targetRole,
        (profile.skills?.length || 0) > 0 || (profile.knownSubjects?.length || 0) > 0 ? 'skills' : '',
      ].filter(Boolean).length
    : 0;
  const profileCompletion = Math.round((completedProfileFields / 6) * 100);
  const importantNotesCount = notes.filter((n) => Boolean(n.important)).length;

  const quickModules: Array<{
    tab: NavigationTab;
    title: string;
    subtitle: string;
    metric: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      tab: 'quiz',
      title: 'Technical Quiz',
      subtitle: 'Java, Python, C, DSA, DBMS, OS, CN, OOP',
      metric: `${quizResults.length} Attempted · ${readiness.technicalScore}% Avg`,
      icon: Brain,
    },
    {
      tab: 'aptitude',
      title: 'Aptitude Practice',
      subtitle: 'Quantitative, Logical & Verbal Tests',
      metric: `${aptitudeResults.length} Attempted · ${readiness.aptitudeScore}% Avg`,
      icon: TrendingUp,
    },
    {
      tab: 'resume',
      title: 'AI Resume Analyzer',
      subtitle: 'Upload & verify resume (.PDF, .DOCX, .TXT)',
      metric: `${resumes.length} Analyzed · ${readiness.resumeScore}% Score`,
      icon: FileText,
    },
    {
      tab: 'interview',
      title: 'AI Mock Interview',
      subtitle: '5-Dimension Performance & Clarity Analysis',
      metric: `${interviews.length} Sessions · ${readiness.mockInterviewScore}% Avg`,
      icon: MessageSquare,
    },
    {
      tab: 'notes',
      title: 'Study Notes',
      subtitle: 'Topic revision notes & Important filter',
      metric: `${notes.length} Notes · ${importantNotesCount} Important`,
      icon: BookOpen,
    },
    {
      tab: 'progress',
      title: 'Progress Tracker',
      subtitle: 'Visual Recharts performance analytics',
      metric: `${readiness.learningProgressScore}% Learning Progress`,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header & Profile Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="text-xs font-medium text-blue-600">
            Student Workspace · Target Role: {profile?.targetRole || 'Software Developer'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Welcome back, {profile?.name || 'Student'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Launch any module below to practice technical & aptitude questions, manage study notes, upload your resume for verification, or take an AI mock interview.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            Profile ({profileCompletion}%)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Start Technical Quiz</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Quick-Launch Module Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">
            Quick Launch Preparation Modules (Click Any Card to Open)
          </h2>
          <span className="text-xs text-slate-500">
            Interests: {(profile?.interests || ['Full Stack Web Development']).join(', ')}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.tab}
                type="button"
                onClick={() => setActiveTab(mod.tab)}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-600 hover:shadow-xs text-left transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-3">{mod.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{mod.subtitle}</div>
                </div>
                <div className="text-[11px] font-mono font-semibold text-blue-600 mt-3 pt-2 border-t border-slate-100">
                  {mod.metric}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Core Performance KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('quiz')}
          className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-600 transition-colors cursor-pointer"
        >
          <div className="text-xs font-medium text-slate-500">Technical Quiz Accuracy</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tabular-nums text-slate-900">
              {readiness.technicalScore}%
            </span>
            <span className="text-xs text-blue-600 font-medium">
              {quizResults.length} {quizResults.length === 1 ? 'Quiz' : 'Quizzes'} →
            </span>
          </div>
          <div className="mt-3 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-transform duration-300 origin-left"
              style={{ transform: `scaleX(${readiness.technicalScore / 100})` }}
            />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('aptitude')}
          className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-600 transition-colors cursor-pointer"
        >
          <div className="text-xs font-medium text-slate-500">Aptitude Accuracy</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tabular-nums text-slate-900">
              {readiness.aptitudeScore}%
            </span>
            <span className="text-xs text-blue-600 font-medium">
              {aptitudeResults.length} {aptitudeResults.length === 1 ? 'Test' : 'Tests'} →
            </span>
          </div>
          <div className="mt-3 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-transform duration-300 origin-left"
              style={{ transform: `scaleX(${readiness.aptitudeScore / 100})` }}
            />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('resume')}
          className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-600 transition-colors cursor-pointer"
        >
          <div className="text-xs font-medium text-slate-500">AI Resume Score</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tabular-nums text-slate-900">
              {readiness.resumeScore}%
            </span>
            <span className="text-xs text-blue-600 font-medium">
              {resumes.length > 0 ? 'Latest Resume →' : 'Upload File →'}
            </span>
          </div>
          <div className="mt-3 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-transform duration-300 origin-left"
              style={{ transform: `scaleX(${readiness.resumeScore / 100})` }}
            />
          </div>
        </div>

        <div
          onClick={() => setActiveTab('interview')}
          className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-600 transition-colors cursor-pointer"
        >
          <div className="text-xs font-medium text-slate-500">AI Mock Interview Score</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tabular-nums text-slate-900">
              {readiness.mockInterviewScore}%
            </span>
            <span className="text-xs text-blue-600 font-medium">
              {interviews.length} {interviews.length === 1 ? 'Session' : 'Sessions'} →
            </span>
          </div>
          <div className="mt-3 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-transform duration-300 origin-left"
              style={{ transform: `scaleX(${readiness.mockInterviewScore / 100})` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Activity & Known Subjects Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 p-6 rounded-xl border border-slate-200 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Known Subjects & Technical Practice
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any CSE subject below to launch a technical quiz immediately
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              Edit Subjects
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {['Java', 'Python', 'C', 'Data Structures', 'DBMS', 'Operating Systems', 'Computer Networks', 'OOP'].map(
              (subj) => {
                const isKnown = (profile?.knownSubjects || []).includes(subj);
                const matchingQuizzes = quizResults.filter((q) => q.category === subj);
                const avg =
                  matchingQuizzes.length > 0
                    ? Math.round(
                        matchingQuizzes.reduce((s, q) => s + q.percentage, 0) /
                          matchingQuizzes.length
                      )
                    : null;

                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => {
                      setSelectedQuizCategory(subj);
                      setActiveTab('quiz');
                    }}
                    className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      isKnown
                        ? 'bg-blue-50/40 border-blue-200 hover:border-blue-600'
                        : 'bg-slate-50 border-slate-200 hover:border-blue-600'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900 truncate">{subj}</div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>{isKnown ? 'Known' : 'Practice'}</span>
                      <span className="font-mono font-semibold text-blue-600">
                        {avg !== null ? `${avg}%` : 'Start →'}
                      </span>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Right Column: Recent Activity Summary */}
        <div className="lg:col-span-5 p-6 rounded-xl border border-slate-200 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Recent Preparation Activity</h3>
            <button
              type="button"
              onClick={() => setActiveTab('progress')}
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              View Progress Charts
            </button>
          </div>

          {quizResults.length === 0 && aptitudeResults.length === 0 && interviews.length === 0 ? (
            <p className="text-xs text-slate-500">
              No practice tests recorded yet. Start a Technical Quiz or Aptitude Test to log your progress.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {quizResults.slice(0, 3).map((q) => (
                <div key={q.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">{q.category} Technical Quiz</div>
                    <div className="text-slate-500">{q.difficulty} Difficulty</div>
                  </div>
                  <span
                    className={`font-mono font-semibold tabular-nums ${
                      q.percentage < 50
                        ? 'text-red-600'
                        : q.percentage < 70
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {q.percentage}%
                  </span>
                </div>
              ))}
              {aptitudeResults.slice(0, 2).map((a) => (
                <div key={a.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">{a.category}</div>
                    <div className="text-slate-500">Aptitude Practice</div>
                  </div>
                  <span
                    className={`font-mono font-semibold tabular-nums ${
                      a.percentage < 50
                        ? 'text-red-600'
                        : a.percentage < 70
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {a.percentage}%
                  </span>
                </div>
              ))}
              {interviews.slice(0, 2).map((m) => (
                <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {m.role} ({m.type})
                    </div>
                    <div className="text-slate-500">AI Mock Interview</div>
                  </div>
                  <span className="font-mono font-semibold tabular-nums text-blue-600">
                    {m.overallScore}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
