import React from 'react';
import { calculateScore } from '../utils/quizUtils';
import { CheckCircle, XCircle, RefreshCw, Eye } from 'lucide-react';
import QuestionCard from '../components/QuestionCard';

export default function Result({ questions, answers, onRestart, isReviewMode, setReviewMode }) {
    const result = calculateScore(questions, answers);

    if (isReviewMode) {
        return (
            <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
                <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 sticky top-4 z-10">
                    <h2 className="text-xl font-bold">Review Answers</h2>
                    <button onClick={onRestart} className="btn btn-outline">Back to Home</button>
                </div>
                {questions.map((q, idx) => (
                    <div key={q.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                        <div className="absolute top-4 right-4 text-sm font-semibold flex items-center gap-1">
                            {(() => {
                                const isCorrect = validateAnswer(q, answers[q.id]);
                                return isCorrect ? <span className="text-green-600 flex items-center gap-1"><CheckCircle size={16} /> Correct</span>
                                    : <span className="text-red-500 flex items-center gap-1"><XCircle size={16} /> Incorrect</span>
                            })()}
                        </div>
                        <QuestionCard
                            question={q}
                            index={idx}
                            total={questions.length}
                            answer={answers[q.id]}
                            isReview={true}
                        />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-slate-50 dark:bg-slate-900">
            <div className="card w-full max-w-lg text-center space-y-8 py-10">
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
                    <h1 className="text-2xl font-bold mb-2">Quiz Completed!</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        You scored {result.correct} out of {result.total} questions correctly.
                    </p>
                </div>

                <div className="flex gap-4 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl justify-center text-sm">
                    <div className="flex flex-col items-center">
                        <CheckCircle className="text-green-500 mb-1" />
                        <span className="font-semibold">{result.correct} Correct</span>
                    </div>
                    <div className="w-px bg-slate-300 dark:bg-slate-700" />
                    <div className="flex flex-col items-center">
                        <XCircle className="text-red-500 mb-1" />
                        <span className="font-semibold">{result.total - result.correct} Wrong</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button onClick={setReviewMode} className="btn btn-outline flex-1">
                        <Eye size={18} /> Review Answers
                    </button>
                    <button onClick={onRestart} className="btn btn-primary flex-1">
                        <RefreshCw size={18} /> Take Again
                    </button>
                </div>
            </div>
        </div>
    );
}

function validateAnswer(q, userAnswer) {
    if (!userAnswer) return false;
    if (q.type === 'single' || q.type === 'boolean' || q.type === 'image-choice') {
        return userAnswer === q.correctAnswer;
    }
    else if (q.type === 'multi') {
        if (userAnswer.length !== q.correctAnswers.length) return false;
        return userAnswer.every(ans => q.correctAnswers.includes(ans));
    }
    else if (q.type === 'statement-grid') {
        return q.statements.every(st => userAnswer[st.id] === st.correctAnswer);
    }
    return false;
}
