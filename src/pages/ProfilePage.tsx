import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Compass,
  Plus,
  Save,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import {
  ALL_CSE_SUBJECTS,
  CAREER_INTEREST_OPTIONS,
  StudentProfileRecord,
} from '../utils/recommendationEngine.ts';

const TARGET_ROLES = [
  'Software Developer',
  'Java Developer',
  'Python Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Analyst',
  'QA Engineer',
];

const YEARS: StudentProfileRecord['year'][] = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Graduated',
];

export function ProfilePage() {
  const {
    profile,
    saveProfile,
    quizResults,
    aptitudeResults,
    interviews,
    resumes,
    notes,
    readiness,
    setActiveTab,
    setSelectedQuizCategory,
  } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [department, setDepartment] = useState('Computer Science & Engineering (CSE)');
  const [year, setYear] = useState<StudentProfileRecord['year']>('4th Year');
  const [cgpa, setCgpa] = useState('');
  const [targetRole, setTargetRole] = useState('Software Developer');
  const [preferredDomain, setPreferredDomain] = useState('');
  const [interests, setInterests] = useState<string[]>(['Full Stack Web Development']);
  const [knownSubjects, setKnownSubjects] = useState<string[]>(['Java', 'DBMS', 'OOP']);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
      setCollege(profile.college || '');
      setDegree(profile.degree || 'B.Tech');
      setDepartment(profile.department || 'CSE');
      setYear(profile.year || '4th Year');
      setCgpa(profile.cgpa || '');
      setTargetRole(profile.targetRole || 'Software Developer');
      setPreferredDomain(profile.preferredDomain || '');
      setInterests(
        profile.interests && profile.interests.length > 0
          ? profile.interests
          : ['Full Stack Web Development']
      );
      setKnownSubjects(
        profile.knownSubjects && profile.knownSubjects.length > 0
          ? profile.knownSubjects
          : ['Java', 'DBMS', 'OOP']
      );
      setSkills(profile.skills || []);
    }
  }, [profile]);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const toggleKnownSubject = (subject: string) => {
    setKnownSubjects((prev) => {
      const next = prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject];
      // Also keep skills synced with known subjects
      if (!prev.includes(subject) && !skills.includes(subject)) {
        setSkills((sPrev) => [...sPrev, subject]);
      }
      return next;
    });
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (skills.length >= 30) return;
    if (!skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, trimmed.slice(0, 60)]);
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedBanner(false);
    try {
      await saveProfile({
        name: name.trim() || 'B.Tech Student',
        email: email.trim() || 'student@cse.edu',
        college: college.trim(),
        degree: degree.trim(),
        department: department.trim(),
        year,
        cgpa: cgpa.trim(),
        targetRole,
        preferredDomain: preferredDomain.trim() || interests[0] || 'Full Stack Development',
        skills,
        interests,
        knownSubjects,
      });
      setSavedBanner(true);
      setTimeout(() => setSavedBanner(false), 4000);
    } finally {
      setSaving(false);
    }
  };

  // Compute subject mastery for known subjects
  const subjectAccuracyMap = new Map<string, { sum: number; count: number }>();
  for (const q of quizResults) {
    const cur = subjectAccuracyMap.get(q.category) || { sum: 0, count: 0 };
    cur.sum += q.percentage;
    cur.count += 1;
    subjectAccuracyMap.set(q.category, cur);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-blue-600">
            Module 1 · Academic Profile, Interests & Progress Tracking
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
            Student Profile & Preparation Tracker
          </h1>
          <p className="text-sm text-slate-600">
            Manage your B.Tech details, career interests, and already known subjects to drive personalized recommendations and track your progress.
          </p>
        </div>
      </div>

      {savedBanner && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Your profile, career interests, and known subjects have been saved! Personalized recommendations have been updated.
          </span>
        </div>
      )}

      {/* Profile Progress Tracking Summary Bar */}
      <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-semibold text-blue-600">
              Maintained Profile Progress Summary
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              End-to-End Preparation & Subject Mastery Status
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('progress')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Open Full Charts</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Practice Technical Quiz</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500">Readiness Score</div>
            <div className="text-xl font-bold font-mono tabular-nums text-blue-600 mt-1">
              {readiness.totalReadinessScore}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">{readiness.readinessBand}</div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500">Known Subjects</div>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {knownSubjects.length} / {ALL_CSE_SUBJECTS.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Selected in profile</div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500">Technical Quizzes</div>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {quizResults.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Avg: {readiness.technicalScore}%</div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500">Aptitude Tests</div>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {aptitudeResults.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Avg: {readiness.aptitudeScore}%</div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500">Resume Score</div>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {readiness.resumeScore}%
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">{resumes.length} uploaded</div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500">Study Notes</div>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {notes.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">{interviews.length} interviews</div>
          </div>
        </div>

        {/* Known Subjects Verification & Progress Grid */}
        <div className="pt-2">
          <div className="text-xs font-semibold text-slate-700 mb-2.5">
            Your Known Subjects & Quiz Verification Progress:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {ALL_CSE_SUBJECTS.map((subj) => {
              const isMarkedKnown = knownSubjects.includes(subj);
              const stats = subjectAccuracyMap.get(subj);
              const avgScore = stats ? Math.round(stats.sum / stats.count) : null;
              return (
                <div
                  key={subj}
                  className={`p-3 rounded-lg border flex flex-col justify-between gap-2 ${
                    isMarkedKnown
                      ? 'bg-blue-50/40 border-blue-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{subj}</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {isMarkedKnown ? 'Known' : 'To Learn'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/70">
                    <span
                      className={`font-mono font-semibold ${
                        avgScore === null
                          ? 'text-slate-400'
                          : avgScore >= 70
                          ? 'text-emerald-700'
                          : avgScore >= 50
                          ? 'text-amber-700'
                          : 'text-red-700'
                      }`}
                    >
                      {avgScore !== null ? `Quiz: ${avgScore}%` : 'Unverified'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedQuizCategory(subj);
                        setActiveTab('quiz');
                      }}
                      className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Test</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Editable Profile Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-xl border border-slate-200 bg-white space-y-6">
        <h2 className="text-lg font-bold text-slate-900">Academic & Career Profile Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name *</label>
            <input
              type="text"
              required
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Aarav Sharma"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address *</label>
            <input
              type="email"
              required
              maxLength={200}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@college.edu"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              College / University
            </label>
            <input
              type="text"
              maxLength={200}
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g., NIT Tiruchirappalli"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Degree Program</label>
            <input
              type="text"
              maxLength={100}
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              placeholder="e.g., B.Tech / B.E."
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Department / Branch
            </label>
            <input
              type="text"
              maxLength={100}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g., Computer Science & Engineering (CSE)"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Year of Study
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value as StudentProfileRecord['year'])}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-600"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current CGPA</label>
              <input
                type="text"
                maxLength={20}
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                placeholder="e.g., 8.65"
                className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Role *</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-600"
            >
              {TARGET_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Preferred Job Domain
            </label>
            <input
              type="text"
              maxLength={100}
              value={preferredDomain}
              onChange={(e) => setPreferredDomain(e.target.value)}
              placeholder="e.g., Backend Systems, Cloud & Distributed Computing"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Career Interests for Personalized Recommendations */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-800">
              Career Interests ({interests.length} selected)
            </label>
            <span className="text-xs text-slate-500">
              Used by "What Should I Prepare Next?" to identify high-priority subjects
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CAREER_INTEREST_OPTIONS.map((item) => {
              const active = interests.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleInterest(item)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Already Known Subjects */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-800">
              Already Known CSE Subjects ({knownSubjects.length} selected)
            </label>
            <span className="text-xs text-slate-500">
              Toggle subjects you have already studied
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {ALL_CSE_SUBJECTS.map((subj) => {
              const active = knownSubjects.includes(subj);
              return (
                <button
                  key={subj}
                  type="button"
                  onClick={() => toggleKnownSubject(subj)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border text-left transition-colors flex items-center justify-between cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{subj}</span>
                  {active && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Technical Skills */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700">
              Additional Technical Skills & Tools ({skills.length}/30)
            </label>
            <span className="text-xs text-slate-500">Used for Resume & Role alignment</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="Add a skill (e.g., Spring Boot, React, SQL, Docker)"
              className="flex-1 px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill</span>
            </button>
          </div>

          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map((skill) => (
                <div
                  key={skill}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 flex items-center gap-2"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-red-600 cursor-pointer"
                    aria-label={`Remove ${skill}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              No skills added yet. Add your core programming languages and tools above.
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg inline-flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Profile...' : 'Save Profile & Update Recommendations'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
