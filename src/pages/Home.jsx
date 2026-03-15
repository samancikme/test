import React, { useState } from 'react';
import { Play, Settings, Moon, Sun } from 'lucide-react';
import { shuffleArray } from '../utils/quizUtils';
import { useTheme } from '../hooks/useTheme';

export default function Home({ startQuiz, availableTests }) {
    const { isDark, toggleTheme } = useTheme();
    const [selectedTestId, setSelectedTestId] = useState(availableTests[0].id);
    const [shuffleQuestions, setShuffleQuestions] = useState(true);
    const [shuffleOpts, setShuffleOpts] = useState(false);

    const handleStart = () => {
        const testData = availableTests.find(t => t.id === selectedTestId)?.data || [];
        let qList = [...testData];

        if (shuffleOpts) {
            qList = qList.map(q => ({
                ...q,
                options: q.options ? shuffleArray(q.options) : q.options
            }));
        }

        if (shuffleQuestions) {
            qList = shuffleArray(qList);
        }

        startQuiz(qList);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 px-4">
            <div className="absolute top-4 right-4">
                <button onClick={toggleTheme} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm text-slate-600 dark:text-slate-300">
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            <div className="max-w-md w-full max-h-full card flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center mb-2">
                    <Play className="text-primary-600 dark:text-primary-400" size={40} />
                </div>
                <h1 className="text-3xl font-bold">Exam Platform</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Select a test below to begin your examination.
                </p>

                <div className="w-full text-left space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                        <Settings size={18} /> Select Test
                    </h3>
                    <div className="space-y-2 mb-4">
                        {availableTests.map((test) => (
                            <label key={test.id} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedTestId === test.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm' : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'}`}>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedTestId === test.id ? 'border-primary-500 bg-primary-500' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'}`}>
                                    {selectedTestId === test.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <div className="flex-1 text-sm font-medium">{test.title} <span className="text-slate-400 text-xs font-normal">({test.data.length} Qs)</span></div>
                            </label>
                        ))}
                    </div>

                    <h3 className="font-semibold flex items-center gap-2 mb-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Settings size={18} /> Options
                    </h3>
                    <label className="flex items-center justify-between cursor-pointer">
                        <span>Shuffle Questions</span>
                        <input type="checkbox" checked={shuffleQuestions} onChange={() => setShuffleQuestions(!shuffleQuestions)} className="accent-primary-600 w-5 h-5 rounded" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                        <span>Shuffle Options</span>
                        <input type="checkbox" checked={shuffleOpts} onChange={() => setShuffleOpts(!shuffleOpts)} className="accent-primary-600 w-5 h-5 rounded" />
                    </label>
                </div>

                <button onClick={handleStart} className="btn btn-primary w-full text-lg py-3">
                    Start Quiz
                </button>
            </div>
        </div>
    );
}
