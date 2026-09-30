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
  PracticeQuestion,
  selectPracticeQuestions,
  TECHNICAL_CATEGORIES,
  TECHNICAL_QUESTIONS,
} from '../data/questionBank.ts';

export function TechnicalQuizPage() {
  const {
    quizResults,
    recordQuizResult,
    selectedQuizCategory,
    setSelectedQuizCategory,
  } = useApp();

  const initialCat =
    selectedQuizCategory && TECHNICAL_CATEGORIES.includes(selectedQuizCategory as any)
      ? selectedQuizCategory
      : 'Java';

  const [category, setCategory] = useState<string>(initialCat);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(5);

  const [questions, setQuestions] = useState<PracticeQuestion[]>(() =>
    selectPracticeQuestions(TECHNICAL_QUESTIONS, initialCat, 'Medium', 5)
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<number, boolean>>({});
  const [timer, setTimer] = useState<number>(5 * 60);
  const [quizStarted, setQuizStarted] = useState<boolean>(true);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<{
    score: number;
    correctAnswers: number;
    wrongAnswers: number;
    percentage: number;
  } | null>(null);

  const loadQuizQuestions = useCallback(
    async (cat: string, diff: 'Easy' | 'Medium' | 'Hard', cnt: number) => {
      // Immediately set deterministic local questions so the user never waits on an empty screen
      const localSet = selectPracticeQuestions(TECHNICAL_QUESTIONS, cat, diff, cnt);
      setQuestions(localSet);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setRevealedExplanations({});
      setFinalScore(null);
      setTimer(cnt * 60);
      setQuizCompleted(false);
      setQuizStarted(true);

      try {
        const res = await fetch(
          `/api/quiz/questions?category=${encodeURIComponent(cat)}&difficulty=${encodeURIComponent(
            diff
          )}&count=${cnt}`
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

  // Sync if user navigated here from a recommendation card
  useEffect(() => {
    if (selectedQuizCategory && TECHNICAL_CATEGORIES.includes(selectedQuizCategory as any)) {
      const target = selectedQuizCategory;
      setCategory(target);
      setSelectedQuizCategory(null);
      loadQuizQuestions(target, difficulty, questionCount);
    }
  }, [selectedQuizCategory, setSelectedQuizCategory, difficulty, questionCount, loadQuizQuestions]);

  // Countdown timer
  useEffect(() => {
    if (!quizStarted || quizCompleted) return;
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
  }, [quizStarted, quizCompleted]);

  // Auto-submit when timer reaches 0
  useEffect(() => {
    if (quizStarted && !quizCompleted && timer === 0 && questions.length > 0) {
      handleSubmitQuiz();
    }
  }, [timer, quizStarted, quizCompleted, questions.length]);

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    loadQuizQuestions(newCat, difficulty, questionCount);
  };

  const handleDifficultyChange = (newDiff: 'Easy' | 'Medium' | 'Hard') => {
    setDifficulty(newDiff);
    loadQuizQuestions(category, newDiff, questionCount);
  };

  const handleCountChange = (newCnt: number) => {
    setQuestionCount(newCnt);
    loadQuizQuestions(category, difficulty, newCnt);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (quizCompleted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const toggleExplanation = (idx: number) => {
    setRevealedExplanations((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleSubmitQuiz = async () => {
    if (quizCompleted || questions.length === 0) return;

    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correct += 1;
      }
    });

    const total = questions.length;
    const wrong = total - correct;
    const percentage = Math.round((correct / total) * 100);

    setQuizCompleted(true);
    setQuizStarted(false);
    setFinalScore({
      score: correct,
      correctAnswers: correct,
      wrongAnswers: wrong,
      percentage,
    });

    await recordQuizResult({
      category,
      difficulty,
      totalQuestions: total,
      correctAnswers: correct,
      wrongAnswers: wrong,
      score: correct,
      percentage,
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentQ = questions[currentQuestionIndex];
  const currentUserChoice = selectedAnswers[currentQuestionIndex];
  const isCurrentRevealed = Boolean(revealedExplanations[currentQuestionIndex]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-blue-600">
            Module 2A · Core Computer Science Assessment
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Technical Quiz Practice</h1>
          <p className="text-sm text-slate-600">
            Select any CSE subject below to immediately practice technical interview questions with explanations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadQuizQuestions(category, difficulty, questionCount)}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg inline-flex items-center gap-1.5 self-start cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart / New Question Set</span>
        </button>
      </div>

      {/* Interactive Subject, Difficulty & Count Control Bar */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700">1. Choose Subject Category:</span>
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
            {[5, 6, 8, 10].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => handleCountChange(cnt)}
                className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-md border transition-colors cursor-pointer ${
                  questionCount === cnt
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cnt}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {TECHNICAL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border text-center transition-colors truncate cursor-pointer ${
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

      {/* Main Layout: Active Question Runner on Left + Recent Quiz Scores on Right */}
      {!quizCompleted && currentQ && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-xl border border-slate-200 bg-white space-y-6">
            {/* Top Bar: Category, Progress, Timer */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-blue-600">{category}</span>
                  <span className="mx-1.5">·</span>
                  <span>{currentQ.difficulty} Difficulty</span>
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

            {/* Question Text */}
            <div className="py-1">
              <h2 className="text-lg font-bold text-slate-900 leading-relaxed">
                {currentQuestionIndex + 1}. {currentQ.question}
              </h2>
            </div>

            {/* 4 Options */}
            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = currentUserChoice === idx;
                const isCorrectOption = idx === currentQ.correctAnswer;

                let optionStyle =
                  'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';
                if (isCurrentRevealed) {
                  if (isCorrectOption) {
                    optionStyle =
                      'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
                  } else if (isSelected) {
                    optionStyle = 'bg-red-50 border-red-400 text-red-900 font-semibold';
                  }
                } else if (isSelected) {
                  optionStyle =
                    'bg-blue-50/80 border-blue-600 text-slate-900 font-semibold';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-4 rounded-xl border text-left text-sm transition-colors flex items-start gap-3 cursor-pointer ${optionStyle}`}
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

            {/* Instant Answer Check / Explanation Toggle */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => toggleExplanation(currentQuestionIndex)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>
                  {isCurrentRevealed
                    ? 'Hide Answer & Explanation'
                    : 'Check Answer & Explanation'}
                </span>
              </button>

              <span className="text-xs text-slate-500 font-mono">
                Answered: {Object.keys(selectedAnswers).length} / {questions.length}
              </span>
            </div>

            {isCurrentRevealed && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                <div className="font-bold text-emerald-700">
                  Correct Option: {String.fromCharCode(65 + currentQ.correctAnswer)} —{' '}
                  {currentQ.options[currentQ.correctAnswer]}
                </div>
                <p className="leading-relaxed">
                  <strong className="text-slate-900">Explanation:</strong> {currentQ.explanation}
                </p>
              </div>
            )}

            {/* Question Navigation Palette & Previous/Next/Submit Controls */}
            <div className="pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1.5 flex-wrap">
                {questions.map((q, idx) => {
                  const answered = selectedAnswers[idx] !== undefined;
                  const active = idx === currentQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-7 h-7 rounded-md text-xs font-mono font-semibold cursor-pointer ${
                        active
                          ? 'bg-blue-600 text-white'
                          : answered
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
                    onClick={() =>
                      setCurrentQuestionIndex((i) => Math.min(questions.length - 1, i + 1))
                    }
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Quiz</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Recent Technical Quiz History */}
          <div className="lg:col-span-4 p-5 rounded-xl border border-slate-200 bg-white space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Quiz Score History</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every submitted quiz updates your Profile Progress & Recommendations.
              </p>
            </div>

            {quizResults.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {quizResults.slice(0, 6).map((res) => (
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
                Answer the questions on the left and click <strong>Submit Quiz</strong> to record your first technical score!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quiz Result & Detailed Answer Review Screen */}
      {quizCompleted && finalScore && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-xl border border-slate-200 bg-white space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <div className="text-xs font-medium text-blue-600">
                  Quiz Completed · {category} ({difficulty})
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                  Your Score: {finalScore.score} / {questions.length} ({finalScore.percentage}%)
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {finalScore.percentage < 50
                    ? 'Priority = HIGH: Focus on this topic. Review the explanations below and revise your study notes.'
                    : finalScore.percentage < 70
                    ? 'Priority = MEDIUM: Practice more to push your accuracy above 70%.'
                    : 'Priority = LOW: Great performance! Maintain your mastery with periodic practice.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadQuizQuestions(category, difficulty, questionCount)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2 self-start cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Practice Another Quiz</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Percentage</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                  {finalScore.percentage}%
                </div>
              </div>
              <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200">
                <div className="text-xs text-emerald-700">Correct Answers</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-emerald-800 mt-1">
                  {finalScore.correctAnswers}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-red-50/60 border border-red-200">
                <div className="text-xs text-red-700">Wrong / Unanswered</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-red-800 mt-1">
                  {finalScore.wrongAnswers}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500">Topic Performance</div>
                <div className="text-sm font-bold text-slate-900 mt-2">
                  {finalScore.percentage >= 70
                    ? 'Strong (>=70%)'
                    : finalScore.percentage >= 50
                    ? 'Moderate (50-69%)'
                    : 'Needs Focus (<50%)'}
                </div>
              </div>
            </div>
          </div>

          {/* Question-by-Question Explanation Review */}
          <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-4">
            <h3 className="text-base font-bold text-slate-900">Detailed Answer Explanations</h3>
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns === q.correctAnswer;
                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm font-semibold text-slate-900">
                        {idx + 1}. {q.question}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          isCorrect ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        Your Answer:{' '}
                        {userAns !== undefined ? q.options[userAns] : 'Not Answered'}
                      </span>
                      {!isCorrect && (
                        <span className="font-semibold text-emerald-700">
                          Correct Answer: {q.options[q.correctAnswer]}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 bg-white p-3 rounded border border-slate-200/80 leading-relaxed">
                      <strong className="text-slate-800">Explanation:</strong> {q.explanation}
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
