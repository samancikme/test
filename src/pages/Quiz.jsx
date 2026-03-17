import React, { useState, useEffect } from 'react';
import QuizHeader from '../components/QuizHeader';
import QuestionPalette from '../components/QuestionPalette';
import QuestionCard from '../components/QuestionCard';
import ProgressBar from '../components/ProgressBar';
import { Check, X, ChevronRight, Send } from 'lucide-react';

export default function Quiz({ questions, answers, setAnswers, flagged, setFlagged, timeRemaining, setTimeRemaining, onSubmit, onBack }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showPalette, setShowPalette] = useState(false);
    // Track which questions have been submitted (answered and reviewed)
    const [submitted, setSubmitted] = useState({});

    useEffect(() => {
        if (timeRemaining <= 0) {
            onSubmit();
            return;
        }
        const timer = setInterval(() => {
            setTimeRemaining(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeRemaining, onSubmit, setTimeRemaining]);

    const currentQuestion = questions[currentIndex];
    const currentAnswer = answers[currentQuestion.id];
    const isCurrentSubmitted = submitted[currentQuestion.id];
    const isLast = currentIndex === questions.length - 1;
    const allSubmitted = questions.every(q => submitted[q.id]);

    const handleAnswerChange = (value) => {
        if (isCurrentSubmitted) return; // lock answer after submit
        setAnswers({ ...answers, [currentQuestion.id]: value });
    };

    const handleSubmitAnswer = () => {
        setSubmitted({ ...submitted, [currentQuestion.id]: true });
    };

    const toggleFlag = () => {
        setFlagged({ ...flagged, [currentQuestion.id]: !flagged[currentQuestion.id] });
    };

    const goNext = () => {
        if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
    };

    const goPrev = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    // Determine if answer is correct (for inline feedback)
    const isCorrect = isCurrentSubmitted ? validateAnswer(currentQuestion, currentAnswer) : null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 md:pb-0 pt-16">
            <QuizHeader
                timeRemaining={timeRemaining}
                togglePalette={() => setShowPalette(!showPalette)}
                onSubmit={onSubmit}
                onBack={onBack}
                progress={(Object.keys(submitted).length / questions.length) * 100}
            />

            <ProgressBar progress={(Object.keys(submitted).length / questions.length) * 100} />

            <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6 mt-4">
                {/* Main Content */}
                <div className="flex-1 max-w-3xl border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-800 shadow-sm overflow-hidden flex flex-col">
                    <QuestionCard
                        question={currentQuestion}
                        index={currentIndex}
                        total={questions.length}
                        answer={currentAnswer}
                        onChange={handleAnswerChange}
                        isFlagged={flagged[currentQuestion.id]}
                        onFlag={toggleFlag}
                        isReview={isCurrentSubmitted}
                    />

                    {/* Inline Feedback after submit */}
                    {isCurrentSubmitted && (
                        <div className={`mx-4 mb-4 p-4 rounded-xl border flex items-center gap-3 ${isCorrect
                            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
                            : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isCorrect ? 'bg-green-100 dark:bg-green-800' : 'bg-red-100 dark:bg-red-800'}`}>
                                {isCorrect
                                    ? <Check className="text-green-600 dark:text-green-400" size={22} />
                                    : <X className="text-red-600 dark:text-red-400" size={22} />}
                            </div>
                            <div>
                                <p className={`font-bold text-lg ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                    {isCorrect ? "To'g'ri!" : "Noto'g'ri!"}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {isCorrect ? "Ajoyib! Keyingi savolga o'ting." : "To'g'ri javob yuqorida belgilangan."}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Footer */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center gap-3">
                        <button
                            onClick={goPrev}
                            disabled={currentIndex === 0}
                            className="btn btn-outline"
                        >
                            ← Oldingi
                        </button>

                        <div className="flex gap-2 flex-1 justify-end">
                            {!isCurrentSubmitted ? (
                                <button
                                    onClick={handleSubmitAnswer}
                                    disabled={currentAnswer === undefined || currentAnswer === null || currentAnswer === '' || (Array.isArray(currentAnswer) && currentAnswer.length === 0)}
                                    className="btn btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Send size={16} /> Javobni tekshir
                                </button>
                            ) : isLast ? (
                                <button
                                    onClick={onSubmit}
                                    className="btn btn-primary px-8"
                                >
                                    Testni yakunla ✓
                                </button>
                            ) : (
                                <button
                                    onClick={goNext}
                                    className="btn btn-primary flex items-center gap-2"
                                >
                                    Keyingi <ChevronRight size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar / Palette */}
                <div className={`fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity ${showPalette ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowPalette(false)} />
                <div className={`fixed md:relative top-0 right-0 h-full w-80 bg-white dark:bg-slate-800 md:bg-transparent md:block transform transition-transform z-50 md:z-auto ${showPalette ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0`}>
                    <QuestionPalette
                        questions={questions}
                        answers={answers}
                        flagged={flagged}
                        currentIndex={currentIndex}
                        setCurrentIndex={(idx) => { setCurrentIndex(idx); setShowPalette(false); }}
                        onClose={() => setShowPalette(false)}
                        results={Object.fromEntries(
                            Object.keys(submitted).map(qId => {
                                const q = questions.find(q => q.id === qId);
                                return [qId, q ? validateAnswer(q, answers[qId]) : false];
                            })
                        )}
                    />
                </div>
            </div>
        </div>
    );
}

// Validates if a user's answer is correct for a given question
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
