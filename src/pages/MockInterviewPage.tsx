import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Eye,
  MessageSquare,
  Play,
  RotateCcw,
  Send,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { MockInterviewRecord } from '../utils/recommendationEngine.ts';

const ROLES = [
  'Software Developer',
  'Java Developer',
  'Python Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Analyst',
  'QA Engineer',
];

interface QAEvaluationItem {
  question: string;
  answer: string;
  scoreOutOf10: number;
  technicalCorrectness: number;
  relevance: number;
  clarity: number;
  communication: number;
  completeness: number;
  wordCount: number;
  conceptsCovered: string[];
  conceptsMissed: string[];
  clarityAndCommunicationNote: string;
  feedback: string;
  improvementSuggestion: string;
  idealAnswerKeyPoints: string[];
  sampleIdealAnswer: string;
}

export function MockInterviewPage() {
  const { user, profile, interviews, recordMockInterview } = useApp();

  const [role, setRole] = useState<string>(profile?.targetRole || 'Software Developer');
  const [type, setType] = useState<'Technical' | 'HR' | 'Mixed'>('Technical');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [experienceLevel, setExperienceLevel] = useState<string>('Fresher / Final Year B.Tech');
  const [totalQuestions, setTotalQuestions] = useState<number>(3);

  const [stage, setStage] = useState<
    'idle' | 'starting' | 'answering' | 'evaluating' | 'feedback' | 'completing' | 'completed'
  >('idle');
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [currentHint, setCurrentHint] = useState<string>('');
  const [studentAnswer, setStudentAnswer] = useState<string>('');
  const [latestEvaluation, setLatestEvaluation] = useState<QAEvaluationItem | null>(null);
  const [pendingNextQuestion, setPendingNextQuestion] = useState<string>('');
  const [pendingNextTopic, setPendingNextTopic] = useState<string>('');
  const [pendingNextHint, setPendingNextHint] = useState<string>('');
  const [qaHistory, setQaHistory] = useState<QAEvaluationItem[]>([]);
  const [completedReport, setCompletedReport] = useState<MockInterviewRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartInterview = async () => {
    setErrorMsg(null);
    setStage('starting');
    setQaHistory([]);
    setCompletedReport(null);
    setCurrentQuestionNumber(1);
    setStudentAnswer('');

    try {
      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.uid || 'guest',
        },
        body: JSON.stringify({
          role,
          type,
          difficulty,
          experienceLevel,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.question) {
        throw new Error(data.error || 'Could not generate first question.');
      }

      setCurrentQuestion(data.question);
      setCurrentTopic(data.topic || type);
      setCurrentHint(data.hint || 'Structure your response with Concept, Mechanism, and Example.');
      setStage('answering');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to start AI mock interview.');
      setStage('idle');
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAnswer.trim()) {
      setErrorMsg('Please write your answer before submitting.');
      return;
    }

    setErrorMsg(null);
    setStage('evaluating');

    const isLast = currentQuestionNumber >= totalQuestions;
    const prevQs = [...qaHistory.map((item) => item.question), currentQuestion];
    const wordsCount = studentAnswer.trim().split(/\s+/).filter(Boolean).length;

    try {
      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.uid || 'guest',
        },
        body: JSON.stringify({
          role,
          type,
          difficulty,
          experienceLevel,
          question: currentQuestion,
          answer: studentAnswer.trim(),
          isLastQuestion: isLast,
          nextQuestionNumber: currentQuestionNumber + 1,
          previousQuestions: prevQs,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.evaluation) {
        throw new Error(data.error || 'Failed to evaluate your answer.');
      }

      const ev = data.evaluation;
      const evaluatedItem: QAEvaluationItem = {
        question: currentQuestion,
        answer: studentAnswer.trim(),
        scoreOutOf10: Number(ev.scoreOutOf10) || 1,
        technicalCorrectness: Number(ev.technicalCorrectness) || 1,
        relevance: Number(ev.relevance) || 1,
        clarity: Number(ev.clarity) || 1,
        communication: Number(ev.communication) || 1,
        completeness: Number(ev.completeness) || 1,
        wordCount: Number(ev.wordCount) || wordsCount,
        conceptsCovered: Array.isArray(ev.conceptsCovered)
          ? ev.conceptsCovered.map(String)
          : [],
        conceptsMissed: Array.isArray(ev.conceptsMissed)
          ? ev.conceptsMissed.map(String)
          : [],
        clarityAndCommunicationNote: String(ev.clarityAndCommunicationNote || ''),
        feedback: String(ev.feedback || ''),
        improvementSuggestion: String(ev.improvementSuggestion || ''),
        idealAnswerKeyPoints: Array.isArray(ev.idealAnswerKeyPoints)
          ? ev.idealAnswerKeyPoints.map(String)
          : [],
        sampleIdealAnswer: String(ev.sampleIdealAnswer || ''),
      };

      setLatestEvaluation(evaluatedItem);
      setQaHistory((prev) => [...prev, evaluatedItem]);
      setPendingNextQuestion(String(ev.nextQuestion || ''));
      setPendingNextTopic(String(ev.nextTopic || type));
      setPendingNextHint(
        String(ev.nextHint || 'Explain the core concept, internal working, and a practical example.')
      );
      setStage('feedback');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error evaluating answer.');
      setStage('answering');
    }
  };

  const handleProceedAfterFeedback = async () => {
    if (currentQuestionNumber < totalQuestions) {
      const nextNum = currentQuestionNumber + 1;
      setCurrentQuestionNumber(nextNum);
      setCurrentQuestion(
        pendingNextQuestion ||
          `Question #${nextNum}: Describe a core technical design trade-off relevant to ${role}.`
      );
      setCurrentTopic(pendingNextTopic || type);
      setCurrentHint(pendingNextHint || 'Cover Concept, Mechanism, and Example.');
      setStudentAnswer('');
      setLatestEvaluation(null);
      setStage('answering');
    } else {
      setStage('completing');
      try {
        const res = await fetch('/api/interview/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.uid || 'guest',
          },
          body: JSON.stringify({
            role,
            type,
            difficulty,
            experienceLevel,
            qaList: qaHistory,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.interview) {
          throw new Error(data.error || 'Failed to finalize interview report.');
        }

        const record: MockInterviewRecord = data.interview;
        setCompletedReport(record);
        await recordMockInterview(record);
        setStage('completed');
      } catch (err: any) {
        setErrorMsg(err?.message || 'Error generating final interview summary.');
        setStage('feedback');
      }
    }
  };

  const handleOpenPastReport = (item: MockInterviewRecord) => {
    setCompletedReport(item);
    try {
      const parsed = JSON.parse(item.transcriptSummary || '[]');
      if (Array.isArray(parsed)) {
        setQaHistory(parsed);
      } else {
        setQaHistory([]);
      }
    } catch {
      setQaHistory([]);
    }
    setStage('completed');
  };

  // Compute fallback dimension averages if viewing an older interview record
  const getReportDimensions = (report: MockInterviewRecord) => {
    if (report.dimensionAverages) return report.dimensionAverages;
    if (qaHistory.length > 0) {
      const n = qaHistory.length;
      const avg = (fn: (q: QAEvaluationItem) => number) =>
        Math.round((qaHistory.reduce((acc, q) => acc + fn(q), 0) / n) * 10);
      return {
        technicalAccuracy: avg((q) => q.technicalCorrectness || q.scoreOutOf10),
        relevance: avg((q) => q.relevance || q.scoreOutOf10),
        clarity: avg((q) => q.clarity || q.scoreOutOf10),
        communication: avg((q) => q.communication || q.scoreOutOf10),
        completeness: avg((q) => q.completeness || q.scoreOutOf10),
      };
    }
    const base = report.overallScore || 0;
    return {
      technicalAccuracy: base,
      relevance: base,
      clarity: base,
      communication: base,
      completeness: base,
    };
  };

  const liveWordCount = studentAnswer.trim()
    ? studentAnswer.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs font-medium text-blue-600">
          Module 5 · Multi-Dimensional Answer & Performance Analysis
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-0.5">AI Mock Interview</h1>
        <p className="text-sm text-slate-600">
          Practice role-specific Technical, HR, or Mixed interviews. Every answer is evaluated independently on Technical Accuracy, Relevance, Clarity, Communication, and Completeness based strictly on what you write.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Stage 1: Configuration & Past Reports */}
      {(stage === 'idle' || stage === 'starting') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-6 rounded-xl border border-slate-200 bg-white space-y-5">
            <h2 className="text-lg font-bold text-slate-900">Configure Mock Interview Session</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-600"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="Internship Candidate (3rd Year B.Tech)">
                    Internship Candidate (3rd Year B.Tech)
                  </option>
                  <option value="Fresher / Final Year B.Tech">
                    Fresher / Final Year B.Tech
                  </option>
                  <option value="0-1 Year Entry Level">0-1 Year Entry Level</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Interview Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Technical', 'HR', 'Mixed'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        type === t
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        difficulty === d
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Number of Interview Questions
              </label>
              <div className="flex items-center gap-3">
                {[3, 5].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setTotalQuestions(cnt)}
                    className={`px-4 py-2 text-xs font-mono font-semibold rounded-lg border cursor-pointer ${
                      totalQuestions === cnt
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cnt} Questions
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-900">
                How Performance Analysis Works:
              </div>
              <p className="leading-relaxed">
                Each response is analyzed for <strong>Technical Accuracy (35%)</strong>, <strong>Relevance (20%)</strong>, <strong>Clarity (15%)</strong>, <strong>Communication (15%)</strong>, and <strong>Completeness (15%)</strong> based on the concepts covered, sentence structure, transition connectors, and examples in your answer.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                <span>{role}</span>
                <span className="mx-1.5">·</span>
                <span>{type}</span>
                <span className="mx-1.5">·</span>
                <span>{difficulty}</span>
              </div>

              <button
                type="button"
                disabled={stage === 'starting'}
                onClick={handleStartInterview}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg inline-flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>
                  {stage === 'starting' ? 'Generating Question #1...' : 'Start AI Mock Interview'}
                </span>
              </button>
            </div>
          </div>

          {/* Past Interview Sessions (Click any to view full Performance Report) */}
          <div className="lg:col-span-5 p-6 rounded-xl border border-slate-200 bg-white">
            <h2 className="text-lg font-bold text-slate-900">Past Mock Interview Reports</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any completed session below to inspect its full performance breakdown.
            </p>

            {interviews.length > 0 ? (
              <div className="mt-4 space-y-2.5">
                {interviews.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleOpenPastReport(item)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50/20 transition-colors flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        {item.role} ({item.type})
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        {item.difficulty} · {item.totalQuestions} Questions ·{' '}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-sm font-mono font-bold tabular-nums ${
                          item.overallScore >= 75
                            ? 'text-emerald-600'
                            : item.overallScore >= 50
                            ? 'text-blue-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {item.overallScore}%
                      </span>
                      <Eye className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 p-6 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-center">
                <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600">
                  No mock interviews completed yet. Start a session on the left to get a full 5-dimension performance report.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stage 2: Answering Question */}
      {(stage === 'answering' || stage === 'evaluating') && (
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-xl border border-slate-200 bg-white space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <div className="text-xs text-slate-500">
                <span>{role}</span>
                <span className="mx-1.5">·</span>
                <span>{type} Interview</span>
                <span className="mx-1.5">·</span>
                <span>{difficulty}</span>
              </div>
              <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                Question {currentQuestionNumber} of {totalQuestions}
              </div>
            </div>

            <span className="text-xs font-mono text-slate-500">
              Live Word Count: <strong>{liveWordCount}</strong> words
            </span>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 text-white space-y-2">
            <div className="text-xs font-mono text-blue-300 uppercase">
              Interviewer Prompt · {currentTopic}
            </div>
            <h2 className="text-lg font-semibold leading-relaxed">{currentQuestion}</h2>
            {currentHint && (
              <p className="text-xs text-slate-300 pt-2 border-t border-slate-800">
                <strong>Expected Coverage Tip:</strong> {currentHint}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Your Interview Response
              </label>
              <textarea
                rows={7}
                required
                disabled={stage === 'evaluating'}
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                placeholder="Write your clear, structured response here (define the concept, explain how it works, and give a concrete example)..."
                className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 leading-relaxed"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-500">
                Tip: Aim for 35+ words with clear definitions, transition phrases, and a practical example.
              </span>

              <button
                type="submit"
                disabled={stage === 'evaluating'}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg inline-flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>
                  {stage === 'evaluating'
                    ? 'Analyzing Your Answer Performance...'
                    : 'Submit Answer for Analysis'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stage 3: Detailed Per-Question Performance Analysis */}
      {(stage === 'feedback' || stage === 'completing') && latestEvaluation && (
        <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-xl border border-slate-200 bg-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
            <div>
              <div className="text-xs font-medium text-blue-600">
                Detailed Performance Analysis · Question {currentQuestionNumber} of {totalQuestions}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                Answer Evaluation Breakdown
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated from your {latestEvaluation.wordCount}-word response against expected {role} concepts.
              </p>
            </div>

            <div className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-mono text-lg font-bold tabular-nums self-start">
              Overall Question Score: {latestEvaluation.scoreOutOf10} / 10
            </div>
          </div>

          {/* 5 Independent Evaluation Dimensions with Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              {
                label: 'Technical Accuracy',
                val: latestEvaluation.technicalCorrectness,
                weight: '35% weight',
              },
              {
                label: 'Question Relevance',
                val: latestEvaluation.relevance,
                weight: '20% weight',
              },
              {
                label: 'Answer Clarity',
                val: latestEvaluation.clarity,
                weight: '15% weight',
              },
              {
                label: 'Communication',
                val: latestEvaluation.communication,
                weight: '15% weight',
              },
              {
                label: 'Completeness',
                val: latestEvaluation.completeness,
                weight: '15% weight',
              },
            ].map((dim) => (
              <div
                key={dim.label}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">{dim.label}</span>
                  <span className="text-[10px] font-mono text-slate-400">{dim.weight}</span>
                </div>
                <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
                  {dim.val}/10
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      dim.val >= 8
                        ? 'bg-emerald-600'
                        : dim.val >= 5
                        ? 'bg-blue-600'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${dim.val * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Your Submitted Answer & Linguistic/Clarity Diagnostic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900">
                Your Submitted Response ({latestEvaluation.wordCount} words):
              </div>
              <p className="text-slate-600 italic leading-relaxed">
                "{latestEvaluation.answer}"
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900">
                Clarity & Communication Diagnostic:
              </div>
              <p className="text-slate-700 leading-relaxed">
                {latestEvaluation.clarityAndCommunicationNote ||
                  `Evaluated sentence structure and transition clarity across ${latestEvaluation.wordCount} words.`}
              </p>
            </div>
          </div>

          {/* Concepts Covered vs Concepts Missed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
              <div className="font-bold text-emerald-900 uppercase tracking-wider">
                Key Concepts Covered ({latestEvaluation.conceptsCovered.length})
              </div>
              {latestEvaluation.conceptsCovered.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {latestEvaluation.conceptsCovered.map((c, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-white border border-emerald-200 text-emerald-900 font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600">
                  No specific technical keywords from the prompt were detected in your answer.
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
              <div className="font-bold text-amber-900 uppercase tracking-wider">
                Expected Concepts Missed ({latestEvaluation.conceptsMissed.length})
              </div>
              {latestEvaluation.conceptsMissed.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {latestEvaluation.conceptsMissed.map((c, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-white border border-amber-200 text-amber-900 font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-emerald-700 font-medium">
                  You covered all primary expected keywords for this question!
                </p>
              )}
            </div>
          </div>

          {/* Detailed Feedback, Improvement & Sample 10/10 Answer */}
          <div className="space-y-4 text-xs leading-relaxed">
            <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200 text-slate-800">
              <strong className="block text-blue-900 mb-1">
                Technical & Behavioral Evaluation Feedback:
              </strong>
              {latestEvaluation.feedback}
            </div>

            <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-200 text-slate-800">
              <strong className="block text-amber-900 mb-1">
                How to Improve This Specific Answer:
              </strong>
              {latestEvaluation.improvementSuggestion}
            </div>

            {latestEvaluation.sampleIdealAnswer && (
              <div className="p-4 rounded-lg bg-emerald-50/40 border border-emerald-200 text-slate-800">
                <strong className="block text-emerald-900 mb-1">
                  Reference 10/10 Model Answer:
                </strong>
                {latestEvaluation.sampleIdealAnswer}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="button"
              disabled={stage === 'completing'}
              onClick={handleProceedAfterFeedback}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg inline-flex items-center gap-2 cursor-pointer"
            >
              <span>
                {stage === 'completing'
                  ? 'Compiling Full Interview Performance Report...'
                  : currentQuestionNumber < totalQuestions
                  ? `Proceed to Question ${currentQuestionNumber + 1}`
                  : 'Complete Interview & View Full Performance Report'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stage 4: Complete Interview Performance Analysis Report */}
      {stage === 'completed' && completedReport && (
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="p-6 sm:p-8 rounded-xl border border-slate-200 bg-white space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                  <BarChart3 className="w-4 h-4" />
                  <span>
                    Complete Interview Performance Report · {completedReport.role} (
                    {completedReport.type})
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  Overall Performance Score: {completedReport.overallScore}%
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Performance Band:{' '}
                  <strong className="text-slate-900">
                    {completedReport.performanceBand ||
                      (completedReport.overallScore >= 75
                        ? 'Excellent (Placement Ready)'
                        : completedReport.overallScore >= 55
                        ? 'Good (Solid Foundation)'
                        : 'Developing (Needs Practice)')}
                  </strong>{' '}
                  · Evaluated across {completedReport.totalQuestions} question(s)
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStage('idle')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2 self-start cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Start New Interview</span>
              </button>
            </div>

            {/* 5-Dimension Overall Performance Averages */}
            {(() => {
              const dims = getReportDimensions(completedReport);
              const items = [
                { label: 'Technical Accuracy', score: dims.technicalAccuracy },
                { label: 'Question Relevance', score: dims.relevance },
                { label: 'Answer Clarity', score: dims.clarity },
                { label: 'Communication Skills', score: dims.communication },
                { label: 'Depth & Completeness', score: dims.completeness },
              ];
              return (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Multi-Dimensional Performance Breakdown (Averaged Across All Answers)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {items.map((d) => (
                      <div
                        key={d.label}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                      >
                        <div className="text-xs font-semibold text-slate-700">{d.label}</div>
                        <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                          {d.score}%
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              d.score >= 75
                                ? 'bg-emerald-600'
                                : d.score >= 50
                                ? 'bg-blue-600'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${d.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Strong Areas vs Weak Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Demonstrated Strengths
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {completedReport.strongAreas.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Areas Requiring Improvement
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {completedReport.weakAreas.map((w, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actionable Suggestions */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">
                Actionable Recommendations to Improve Your Interview Score
              </h3>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
                {completedReport.suggestions.map((sug, i) => (
                  <li key={i} className="leading-relaxed">
                    {sug}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Question-by-Question Transcript & Score Breakdown */}
          {qaHistory.length > 0 && (
            <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Question-by-Question Transcript & Dimension Scores
              </h3>
              <div className="space-y-4">
                {qaHistory.map((qa, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
                      <div className="text-sm font-bold text-slate-900">
                        Q{index + 1}. {qa.question}
                      </div>
                      <span className="px-3 py-1 rounded-md bg-slate-900 text-white text-xs font-mono font-bold shrink-0 self-start">
                        Score: {qa.scoreOutOf10}/10
                      </span>
                    </div>

                    <div className="text-xs text-slate-700">
                      <strong className="text-slate-900">Your Answer:</strong> "{qa.answer}"
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      <span className="px-2.5 py-1 rounded bg-white border border-slate-200">
                        Technical: <strong>{qa.technicalCorrectness}/10</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded bg-white border border-slate-200">
                        Relevance: <strong>{qa.relevance}/10</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded bg-white border border-slate-200">
                        Clarity: <strong>{qa.clarity}/10</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded bg-white border border-slate-200">
                        Communication: <strong>{qa.communication}/10</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded bg-white border border-slate-200">
                        Completeness: <strong>{qa.completeness}/10</strong>
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed">
                      <strong className="text-slate-800">Evaluator Feedback:</strong> {qa.feedback}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
