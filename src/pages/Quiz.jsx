import React, { useState, useEffect } from 'react';
import QuizHeader from '../components/QuizHeader';
import QuestionPalette from '../components/QuestionPalette';
import QuestionCard from '../components/QuestionCard';
import ProgressBar from '../components/ProgressBar';

export default function Quiz({ questions, answers, setAnswers, flagged, setFlagged, timeRemaining, setTimeRemaining, onSubmit, onBack }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showPalette, setShowPalette] = useState(false);

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

    const handleAnswerChange = (value) => {
        setAnswers({ ...answers, [currentQuestion.id]: value });
    };

    const toggleFlag = () => {
        setFlagged({ ...flagged, [currentQuestion.id]: !flagged[currentQuestion.id] });
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
    };

    const prevQuestion = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 md:pb-0 pt-16">
            <QuizHeader
                timeRemaining={timeRemaining}
                togglePalette={() => setShowPalette(!showPalette)}
                onSubmit={onSubmit}
                onBack={onBack}
                progress={(Object.keys(answers).length / questions.length) * 100}
            />

            <ProgressBar progress={(Object.keys(answers).length / questions.length) * 100} />

            <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6 mt-4">
                {/* Main Content */}
                <div className="flex-1 max-w-3xl border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-800 shadow-sm overflow-hidden flex flex-col">
                    <QuestionCard
                        question={currentQuestion}
                        index={currentIndex}
                        total={questions.length}
                        answer={answers[currentQuestion.id]}
                        onChange={handleAnswerChange}
                        isFlagged={flagged[currentQuestion.id]}
                        onFlag={toggleFlag}
                    />

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                        <button onClick={prevQuestion} disabled={currentIndex === 0} className="btn btn-outline">Previous</button>
                        {currentIndex === questions.length - 1 ? (
                            <button onClick={onSubmit} className="btn btn-primary px-8">Finish Test</button>
                        ) : (
                            <button onClick={nextQuestion} className="btn btn-primary">Next</button>
                        )}
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
                    />
                </div>
            </div>
        </div>
    );
}
