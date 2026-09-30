import React, { useState } from 'react';
import {
  BookOpen,
  Brain,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import { AppProvider, NavigationTab, useApp } from './context/AppContext.tsx';
import { AptitudePage } from './pages/AptitudePage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { MockInterviewPage } from './pages/MockInterviewPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { ProgressTrackerPage } from './pages/ProgressTrackerPage.tsx';
import { ResumeAnalyzerPage } from './pages/ResumeAnalyzerPage.tsx';
import { StudyNotesPage } from './pages/StudyNotesPage.tsx';
import { TechnicalQuizPage } from './pages/TechnicalQuizPage.tsx';

const NAV_ITEMS: Array<{
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile & Interests', icon: User },
  { id: 'quiz', label: 'Technical Quiz', icon: Brain },
  { id: 'aptitude', label: 'Aptitude Practice', icon: BookOpen },
  { id: 'notes', label: 'Study Notes', icon: FileText },
  { id: 'resume', label: 'AI Resume Analyzer', icon: FileText },
  { id: 'interview', label: 'AI Mock Interview', icon: MessageSquare },
  { id: 'progress', label: 'Progress Tracker', icon: TrendingUp },
];

function AuthenticatedWorkspace() {
  const { user, profile, activeTab, setActiveTab, signOutAccount } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-slate-900 text-slate-100 border-r border-slate-800">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="text-base font-bold tracking-tight text-white font-display text-left cursor-pointer"
          >
            InterviewPrep Tracker
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="px-2">
            <div className="text-xs font-semibold text-white truncate">
              {profile?.name || user.displayName || 'B.Tech Student'}
            </div>
            <div className="text-xs text-slate-400 truncate">
              {profile?.targetRole || 'Software Developer'}
            </div>
          </div>

          <button
            type="button"
            onClick={signOutAccount}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="text-base font-bold tracking-tight font-display"
        >
          InterviewPrep Tracker
        </button>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs flex">
          <div className="w-64 bg-slate-900 text-white h-full flex flex-col justify-between p-4">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-sm font-bold">Navigation</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <button
              type="button"
              onClick={signOutAccount}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 border-t border-slate-800 pt-4"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-800">
              {NAV_ITEMS.find((n) => n.id === activeTab)?.label || 'Dashboard'}
            </span>
            <span>·</span>
            <span>Target Role: {profile?.targetRole || 'Software Developer'}</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className="font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Take Quiz
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('interview')}
              className="font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Mock Interview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer"
            >
              {profile?.name || user.email || 'Student'}
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'profile' && <ProfilePage />}
          {activeTab === 'quiz' && <TechnicalQuizPage />}
          {activeTab === 'aptitude' && <AptitudePage />}
          {activeTab === 'notes' && <StudyNotesPage />}
          {activeTab === 'resume' && <ResumeAnalyzerPage />}
          {activeTab === 'interview' && <MockInterviewPage />}
          {activeTab === 'progress' && <ProgressTrackerPage />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AuthenticatedWorkspace />
    </AppProvider>
  );
}
