import React from 'react';
import { Clock, Menu, Sun, Moon, ArrowLeft } from 'lucide-react';
import { formatTime } from '../utils/quizUtils';
import { useTheme } from '../hooks/useTheme';

export default function QuizHeader({ timeRemaining, togglePalette, onSubmit, onBack }) {
    const { isDark, toggleTheme } = useTheme();

    return (
        <header className="fixed top-0 inset-x-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-30 flex items-center justify-between px-4 lg:px-8 shadow-sm">
            <div className="flex items-center gap-2 md:gap-4">
                {onBack && (
                    <button onClick={onBack} title="Ortga qaytish" className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition flex items-center justify-center">
                        <ArrowLeft size={20} />
                    </button>
                )}
                <span className="font-bold text-lg hidden sm:block text-primary-600 dark:text-primary-400">ExamPlatform</span>
            </div>

            <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 font-mono font-bold text-lg px-3 py-1 rounded-md ${timeRemaining < 60 ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    <Clock size={18} />
                    {formatTime(timeRemaining)}
                </div>

                <button onClick={toggleTheme} className="p-2 lg:block rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <button onClick={onSubmit} className="btn btn-primary hidden md:flex text-sm py-1.5">
                    Submit
                </button>

                <button onClick={togglePalette} className="p-2 md:hidden bg-slate-100 dark:bg-slate-700 rounded-md xl:hidden">
                    <Menu size={20} />
                </button>
            </div>
        </header>
    );
}
