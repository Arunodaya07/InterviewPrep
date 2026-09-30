import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../context/AppContext.tsx';

export function ProgressTrackerPage() {
  const {
    quizResults,
    aptitudeResults,
    interviews,
    notes,
    resumes,
    readiness,
  } = useApp();

  const distinctTopics = Array.from(
    new Set([
      ...quizResults.map((q) => q.category),
      ...aptitudeResults.map((a) => a.category),
      ...notes.map((n) => n.subject),
    ])
  );

  // Build chronological score trend data
  const combinedAttempts = [
    ...quizResults.map((q) => ({
      date: new Date(q.createdAt).getTime(),
      label: `${q.category} (${new Date(q.createdAt).toLocaleDateString()})`,
      shortLabel: q.category.slice(0, 8),
      score: q.percentage,
      type: 'Technical',
    })),
    ...aptitudeResults.map((a) => ({
      date: new Date(a.createdAt).getTime(),
      label: `${a.category} (${new Date(a.createdAt).toLocaleDateString()})`,
      shortLabel: a.category.slice(0, 8),
      score: a.percentage,
      type: 'Aptitude',
    })),
    ...interviews.map((i) => ({
      date: new Date(i.createdAt).getTime(),
      label: `Interview: ${i.role}`,
      shortLabel: 'Interview',
      score: i.overallScore,
      type: 'Interview',
    })),
  ].sort((a, b) => a.date - b.date);

  // Topic performance bar data
  const topicPerfMap = new Map<string, { sum: number; count: number }>();
  for (const q of quizResults) {
    const cur = topicPerfMap.get(q.category) || { sum: 0, count: 0 };
    cur.sum += q.percentage;
    cur.count += 1;
    topicPerfMap.set(q.category, cur);
  }
  for (const a of aptitudeResults) {
    const cur = topicPerfMap.get(a.category) || { sum: 0, count: 0 };
    cur.sum += a.percentage;
    cur.count += 1;
    topicPerfMap.set(a.category, cur);
  }

  const topicChartData = Array.from(topicPerfMap.entries()).map(([topic, stats]) => ({
    topic: topic.length > 14 ? `${topic.slice(0, 12)}…` : topic,
    average: Math.round(stats.sum / stats.count),
    attempts: stats.count,
  }));

  const activityData = [
    { name: 'Tech Quizzes', count: quizResults.length },
    { name: 'Aptitude Tests', count: aptitudeResults.length },
    { name: 'Mock Interviews', count: interviews.length },
    { name: 'Study Notes', count: notes.length },
    { name: 'Resumes Analyzed', count: resumes.length },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs font-medium text-blue-600">Module 7 · Placement Preparation Analytics</div>
        <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Progress Tracker</h1>
        <p className="text-sm text-slate-600">
          Visualize your score trends, subject-by-subject accuracy, and cumulative activity across all modules.
        </p>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-xs text-slate-500">Quizzes Completed</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {quizResults.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Avg: {readiness.technicalScore}%
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-xs text-slate-500">Aptitude Tests</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {aptitudeResults.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Avg: {readiness.aptitudeScore}%
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-xs text-slate-500">Mock Interviews</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {interviews.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Avg: {readiness.mockInterviewScore}%
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-xs text-slate-500">Notes Created</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {notes.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Revision items</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-xs text-slate-500">Topics Covered</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
            {distinctTopics.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Active subjects</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="text-xs text-slate-500">Latest Resume</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-600 mt-1">
            {readiness.resumeScore}%
          </div>
          <div className="text-xs text-slate-500 mt-1">{resumes.length} analyzed</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Score Trend */}
        <div className="p-6 rounded-xl border border-slate-200 bg-white">
          <h2 className="text-base font-bold text-slate-900">Score Trend Over Time</h2>
          <p className="text-xs text-slate-500 mb-4">
            Chronological progression of your quiz, aptitude, and interview scores
          </p>

          {combinedAttempts.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedAttempts} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="shortLabel" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip
                    formatter={(value: any) => [`${value}%`, 'Score']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#2563EB' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border border-dashed border-slate-200 rounded-lg bg-slate-50 text-xs text-slate-500">
              Complete at least one quiz or aptitude test to display your chronological score trend.
            </div>
          )}
        </div>

        {/* Chart 2: Topic Performance */}
        <div className="p-6 rounded-xl border border-slate-200 bg-white">
          <h2 className="text-base font-bold text-slate-900">Topic Performance Breakdown</h2>
          <p className="text-xs text-slate-500 mb-4">
            Average score percentage by technical and aptitude category
          </p>

          {topicChartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicChartData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="topic" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip
                    formatter={(value: any) => [`${value}%`, 'Average Accuracy']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="average" fill="#0F172A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border border-dashed border-slate-200 rounded-lg bg-slate-50 text-xs text-slate-500">
              Attempt technical or aptitude topics to compare subject accuracy here.
            </div>
          )}
        </div>

        {/* Chart 3: Practice Activity */}
        <div className="p-6 rounded-xl border border-slate-200 bg-white lg:col-span-2">
          <h2 className="text-base font-bold text-slate-900">Preparation Activity Distribution</h2>
          <p className="text-xs text-slate-500 mb-4">
            Total completed activities across Technical Quizzes, Aptitude Tests, Mock Interviews, Study Notes, and Resume Evaluations
          </p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#334155' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#334155' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
