import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import {
  APTITUDE_CATEGORIES,
  APTITUDE_QUESTIONS,
  PracticeQuestion,
  selectPracticeQuestions,
} from '../data/questionBank.ts';

export function AptitudePage() {
  const { aptitudeResults, recordAptitudeResult } = useApp();

  const [category, setCategory] = useState<string>('Quantitative Aptitude');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(6);

  // Separate states for aptitude questions & navigation (immediately populated on open)
  const [questions, setQuestions] = useState<PracticeQuestion[]>(() =>
    selectPracticeQuestions(APTITUDE_QUESTIONS, 'Quantitative Aptitude', 'Medium', 6)
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answersRecord, setAnswersRecord] = useState<Record<number, number>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState<number>(0);
  const [timer, setTimer] = useState<number>(6 * 75);
  const [testStarted, setTestStarted] = useState<boolean>(true);
  const [testCompleted, setTestCompleted] = useState<boolean>(false);

  const loadAptitudeQuestions = useCallback(
    async (cat: string, diff: 'Easy' | 'Medium' | 'Hard', cnt: number) => {
      const localSet = selectPracticeQuestions(APTITUDE_QUESTIONS, cat, diff, cnt);
      setQuestions(localSet);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setAnswersRecord({});
      setRevealedSolutions({});
      setScore(0);
      setTimer(cnt * 75);
      setTestCompleted(false);
      setTestStarted(true);

      try {
        const res = await fetch(
          `/api/aptitude/questions?category=${encodeURIComponent(
            cat
          )}&difficulty=${encodeURIComponent(diff)}&count=${cnt}`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.questions) && data.questions.length === cnt) {
            setQuestions(data.questions);
          }
        }
      } catch {
        // Keep localSet already loaded
      }
    },
    []
  );

  // Timer countdown
  useEffect(() => {
    if (!testStarted || testCompleted) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [testStarted, testCompleted]);

  // Auto-evaluate when timer reaches 0
  useEffect(() => {
    if (testStarted && !testCompleted && timer === 0 && questions.length > 0) {
      finalizeTest(answersRecord);
    }
  }, [timer, testStarted, testCompleted, questions.length]);

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    loadAptitudeQuestions(newCat, difficulty, numberOfQuestions);
  };

  const handleDifficultyChange = (newDiff: 'Easy' | 'Medium' | 'Hard') => {
    setDifficulty(newDiff);
    loadAptitudeQuestions(category, newDiff, numberOfQuestions);
  };

  const handleCountChange = (newCnt: number) => {
    setNumberOfQuestions(newCnt);
    loadAptitudeQuestions(category, difficulty, newCnt);
  };

  const handleChooseOption = (optionIdx: number) => {
    if (testCompleted) return;
    setSelectedAnswer(optionIdx);
    setAnswersRecord((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIdx,
    }));
  };

  const toggleSolution = (idx: number) => {
    setRevealedSolutions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      setSelectedAnswer(answersRecord[nextIdx] !== undefined ? answersRecord[nextIdx] : null);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIdx = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIdx);
      setSelectedAnswer(answersRecord[prevIdx] !== undefined ? answersRecord[prevIdx] : null);
    }
  };

  const finalizeTest = async (finalAnswers: Record<number, number>) => {
    if (testCompleted || questions.length === 0) return;

    let computedScore = 0;
    questions.forEach((q, idx) => {
      if (finalAnswers[idx] === q.correctAnswer) {
        computedScore += 1;
      }
    });

    const total = questions.length;
    const wrong = total - computedScore;
    const percentage = Math.round((computedScore / total) * 100);

    setScore(computedScore);
    setTestCompleted(true);
    setTestStarted(false);

    await recordAptitudeResult({
      category,
      difficulty,
      totalQuestions: total,
      correctAnswers: computedScore,
      wrongAnswers: wrong,
      score: computedScore,
      percentage,
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isCurrentSolutionShown = Boolean(revealedSolutions[currentQuestionIndex]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-blue-600">
            Module 2B · Placement Screening Simulator
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Aptitude Practice</h1>
          <p className="text-sm text-slate-600">
            Practice Quantitative Aptitude, Logical Reasoning, and Verbal Ability questions with step-by-step solutions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadAptitudeQuestions(category, difficulty, numberOfQuestions)}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg inline-flex items-center gap-1.5 self-start cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Load New Aptitude Set</span>
        </button>
      </div>

      {/* Interactive Category, Difficulty & Question Count Bar */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700">
            1. Select Aptitude Category:
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Difficulty:</span>
            {(['Easy', 'Medium', 'Hard'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => handleDifficultyChange(lvl)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                  difficulty === lvl
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {lvl}
              </button>
            ))}

            <span className="text-xs font-semibold text-slate-700 ml-2">Questions:</span>
            {[4, 6, 8, 10].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => handleCountChange(cnt)}
                className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-md border transition-colors cursor-pointer ${
                  numberOfQuestions === cnt
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cnt}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {APTITUDE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2.5 text-xs font-semibold rounded-lg border text-left transition-colors cursor-pointer ${
                category === cat
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Active Aptitude Question Runner on Left + Recent History on Right */}
      {!testCompleted && currentQuestion && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-xl border border-slate-200 bg-white space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-blue-600">{category}</span>
                  <span className="mx-1.5">·</span>
                  <span>{currentQuestion.difficulty} Difficulty</span>
                </div>
                <div className="text-base font-bold text-slate-900 mt-0.5 font-mono tabular-nums">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-mono font-semibold tabular-nums inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>{formatTime(timer)}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-transform duration-150 origin-left"
                style={{
                  transform: `scaleX(${(currentQuestionIndex + 1) / questions.length})`,
                }}
              />
            </div>

            {/* Question Display */}
            <div className="py-1">
              <h2 className="text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-line">
                {currentQuestionIndex + 1}. {currentQuestion.question}
              </h2>
            </div>

            {/* 4 Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrectOpt = idx === currentQuestion.correctAnswer;

                let optClass =
                  'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';
                if (isCurrentSolutionShown) {
                  if (isCorrectOpt) {
                    optClass =
                      'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
                  } else if (isSelected) {
                    optClass = 'bg-red-50 border-red-400 text-red-900 font-semibold';
                  }
                } else if (isSelected) {
                  optClass =
                    'bg-blue-50/80 border-blue-600 text-slate-900 font-semibold';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChooseOption(idx)}
                    className={`w-full p-4 rounded-xl border text-left text-sm transition-colors flex items-start gap-3 cursor-pointer ${optClass}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-relaxed flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Instant Step-by-Step Solution Toggle */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => toggleSolution(currentQuestionIndex)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>
                  {isCurrentSolutionShown
                    ? 'Hide Step-by-Step Solution'
                    : 'Show Step-by-Step Solution'}
                </span>
              </button>

              <span className="text-xs text-slate-500 font-mono">
                Answered: {Object.keys(answersRecord).length} / {questions.length}
              </span>
            </div>

            {isCurrentSolutionShown && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                <div className="font-bold text-emerald-700">
                  Correct Answer: {String.fromCharCode(65 + currentQuestion.correctAnswer)} —{' '}
                  {currentQuestion.options[currentQuestion.correctAnswer]}
                </div>
                <p className="leading-relaxed">
                  <strong className="text-slate-900">Step-by-Step Solution:</strong>{' '}
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* Step-by-Step Navigation */}
            <div className="pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={handlePreviousQuestion}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1.5 flex-wrap">
                {questions.map((q, idx) => {
                  const isAnswered = answersRecord[idx] !== undefined;
                  const isCurrent = idx === currentQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setCurrentQuestionIndex(idx);
                        setSelectedAnswer(
                          answersRecord[idx] !== undefined ? answersRecord[idx] : null
                        );
                      }}
                      className={`w-7 h-7 rounded-md text-xs font-mono font-semibold cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : isAnswered
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                {currentQuestionIndex < questions.length - 1 && (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => finalizeTest(answersRecord)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Aptitude Test</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Recent Aptitude Results */}
          <div className="lg:col-span-4 p-5 rounded-xl border border-slate-200 bg-white space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Aptitude History</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Contributes 25% weight toward your overall Interview Readiness Score.
              </p>
            </div>

            {aptitudeResults.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {aptitudeResults.slice(0, 6).map((res) => (
                  <div key={res.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{res.category}</div>
                      <div className="text-slate-500 mt-0.5">
                        {res.difficulty} · {res.correctAnswers}/{res.totalQuestions} Correct
                      </div>
                    </div>
                    <div
                      className={`text-sm font-mono font-bold tabular-nums ${
                        res.percentage < 50
                          ? 'text-red-600'
                          : res.percentage < 70
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {res.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-600 text-center">
                Answer the aptitude questions on the left and click <strong>Submit Aptitude Test</strong> to record your score!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Result Page */}
      {testCompleted && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-xl border border-slate-200 bg-white space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <div className="text-xs font-medium text-blue-600">
                  Aptitude Test Result · {category} ({difficulty})
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  Score: {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  All {questions.length} selected questions have been evaluated. Review the step-by-step solutions below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadAptitudeQuestions(category, difficulty, numberOfQuestions)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2 self-start cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Practice Another Set</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Accuracy</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                  {Math.round((score / questions.length) * 100)}%
                </div>
              </div>
              <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200">
                <div className="text-xs text-emerald-700">Correct</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-emerald-800 mt-1">
                  {score}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-red-50/60 border border-red-200">
                <div className="text-xs text-red-700">Incorrect / Skipped</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-red-800 mt-1">
                  {questions.length - score}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Questions Evaluated</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                  {questions.length}
                </div>
              </div>
            </div>
          </div>

          {/* Step-by-Step Solution Breakdown */}
          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-4">
            <h3 className="text-base font-bold text-slate-900">Step-by-Step Aptitude Solutions</h3>
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const chosen = answersRecord[idx];
                const correct = chosen === q.correctAnswer;
                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm font-semibold text-slate-900 whitespace-pre-line">
                        {idx + 1}. {q.question}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          correct ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {correct ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        Your Choice: {chosen !== undefined ? q.options[chosen] : 'Unanswered'}
                      </span>
                      {!correct && (
                        <span className="font-semibold text-emerald-700">
                          Correct Answer: {q.options[q.correctAnswer]}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 bg-white p-3 rounded border border-slate-200/80 leading-relaxed">
                      <strong className="text-slate-800">Solution:</strong> {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
