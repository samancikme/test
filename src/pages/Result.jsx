import React, { useEffect, useState } from 'react';
import { calculateScore } from '../utils/quizUtils';
import { CheckCircle, XCircle, RefreshCw, Eye, TrendingUp, TrendingDown, Minus, History } from 'lucide-react';
import QuestionCard from '../components/QuestionCard';

const HISTORY_KEY = 'quiz_history';

function loadHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch { return []; }
}

function saveToHistory(entry) {
    const history = loadHistory();
    history.unshift(entry); // newest first
    // Keep last 20 attempts
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
}

export default function Result({ questions, answers, onRestart, isReviewMode, setReviewMode }) {
    const result = calculateScore(questions, answers);
    const [prevResult, setPrevResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        if (!isReviewMode) {
            const hist = loadHistory();
            setHistory(hist);
            // Get previous attempt (if any, before saving this one)
            if (hist.length > 0) {
                setPrevResult(hist[0]);
            }
            // Save current result
            const entry = {
                date: new Date().toLocaleString('uz-UZ'),
                correct: result.correct,
                total: result.total,
                percentage: result.percentage,
            };
            saveToHistory(entry);
        }
    }, []);

    const diff = prevResult ? result.percentage - prevResult.percentage : null;

    if (isReviewMode) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10 px-4">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 sticky top-4 z-10">
                        <h2 className="text-xl font-bold dark:text-white">Review Answers</h2>
                        <button onClick={onRestart} className="btn btn-outline">Back to Home</button>
                    </div>
                    {questions.map((q, idx) => {
                        const isCorrect = validateAnswer(q, answers[q.id]);
                        return (
                            <div key={q.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                                <div className="absolute top-4 right-4 text-sm font-semibold flex items-center gap-1">
                                    {isCorrect
                                        ? <span className="text-green-600 flex items-center gap-1"><CheckCircle size={16} /> Correct</span>
                                        : <span className="text-red-500 flex items-center gap-1"><XCircle size={16} /> Incorrect</span>
                                    }
                                </div>
                                <QuestionCard
                                    question={q}
                                    index={idx}
                                    total={questions.length}
                                    answer={answers[q.id]}
                                    isReview={true}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-slate-50 dark:bg-slate-900">
            <div className="card w-full max-w-lg text-center space-y-6 py-10">
                {/* Score Circle */}
                <div className="flex justify-center">
                    <div className="relative">
                        <svg className="w-32 h-32 transform -rotate-90">
                            <circle cx="64" cy="64" r="56" className="text-slate-200 dark:text-slate-700 stroke-current" strokeWidth="12" fill="transparent" />
                            <circle cx="64" cy="64" r="56"
                                className={`stroke-current transition-all duration-1000 ${result.percentage >= 70 ? 'text-green-500' : result.percentage >= 40 ? 'text-yellow-500' : 'text-red-500'}`}
                                strokeWidth="12" fill="transparent"
                                strokeDasharray="351.858" strokeDashoffset={351.858 - (351.858 * result.percentage) / 100}
                                strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold">{result.percentage}%</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h1 className="text-2xl font-bold mb-2">Test yakunlandi!</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {result.correct} ta to'g'ri / {result.total} ta savol
                    </p>
                </div>

                {/* Progress comparison */}
                {diff !== null && (
                    <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${diff > 0 ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            diff < 0 ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                        {diff > 0 ? <TrendingUp size={18} /> : diff < 0 ? <TrendingDown size={18} /> : <Minus size={18} />}
                        {diff > 0
                            ? `Oldingi natijadan +${diff}% yuqori! (${prevResult.percentage}% → ${result.percentage}%)`
                            : diff < 0
                                ? `Oldingi natijadan ${diff}% past (${prevResult.percentage}% → ${result.percentage}%)`
                                : `Oldingi natija bilan bir xil: ${result.percentage}%`
                        }
                    </div>
                )}

                {/* Correct / Wrong counts */}
                <div className="flex gap-4 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl justify-center text-sm">
                    <div className="flex flex-col items-center">
                        <CheckCircle className="text-green-500 mb-1" />
                        <span className="font-semibold">{result.correct} To'g'ri</span>
                    </div>
                    <div className="w-px bg-slate-300 dark:bg-slate-700" />
                    <div className="flex flex-col items-center">
                        <XCircle className="text-red-500 mb-1" />
                        <span className="font-semibold">{result.total - result.correct} Noto'g'ri</span>
                    </div>
                </div>

                {/* History toggle */}
                {history.length > 1 && (
                    <div>
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="flex items-center gap-2 mx-auto text-sm text-primary-600 dark:text-primary-400 hover:underline"
                        >
                            <History size={15} />
                            {showHistory ? "Tarixni yashir" : `Barcha natijalarni ko'rish (${history.length} ta)`}
                        </button>

                        {showHistory && (
                            <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden text-left text-sm">
                                <div className="bg-slate-100 dark:bg-slate-700 px-4 py-2 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Natijalar tarixi
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-48 overflow-y-auto">
                                    {history.map((h, i) => (
                                        <div key={i} className={`flex justify-between items-center px-4 py-2 ${i === 0 ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-white dark:bg-slate-800'}`}>
                                            <span className="text-slate-500 dark:text-slate-400">{h.date}</span>
                                            <span className={`font-bold ${h.percentage >= 70 ? 'text-green-600' : h.percentage >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>
                                                {h.percentage}% ({h.correct}/{h.total})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button onClick={setReviewMode} className="btn btn-outline flex-1">
                        <Eye size={18} /> Javoblarni ko'rish
                    </button>
                    <button onClick={onRestart} className="btn btn-primary flex-1">
                        <RefreshCw size={18} /> Qayta boshlash
                    </button>
                </div>
            </div>
        </div>
    );
}

function validateAnswer(q, userAnswer) {
    try {
        if (userAnswer === undefined || userAnswer === null || userAnswer === '') return false;
        if (q.type === 'single' || q.type === 'boolean' || q.type === 'image-choice') {
            return userAnswer === q.correctAnswer;
        }
        if (q.type === 'multi') {
            if (!q.correctAnswers || !Array.isArray(userAnswer)) return false;
            if (userAnswer.length !== q.correctAnswers.length) return false;
            return userAnswer.every(ans => q.correctAnswers.includes(ans));
        }
        if (q.type === 'statement-grid') {
            if (!q.statements || typeof userAnswer !== 'object') return false;
            return q.statements.every(st => userAnswer[st.id] === st.correctAnswer);
        }
        if (q.type === 'matching') {
            if (!q.pairs || typeof userAnswer !== 'object') return false;
            if (q._correctMatchIndices) {
                return q.pairs.every((_, idx) => userAnswer[idx] === q._correctMatchIndices[idx]);
            }
            return q.pairs.every((_, idx) => userAnswer[idx] === idx);
        }
        if (q.type === 'ordering') {
            if (!q.correctOrder || !Array.isArray(userAnswer)) return false;
            return userAnswer.every((item, idx) => item === q.correctOrder[idx]);
        }
        if (q.type === 'short-answer') {
            if (!q.correctAnswerText) return false;
            return String(userAnswer).toLowerCase().trim() === String(q.correctAnswerText).toLowerCase().trim();
        }
    } catch (e) {
        return false;
    }
    return false;
}
