import React from 'react';
import { Check, X } from 'lucide-react';

export default function ShortAnswer({ value, onChange, isReview, correctAnswerText }) {
    const isCorrect = isReview && value && correctAnswerText && value.toLowerCase().trim() === correctAnswerText.toLowerCase().trim();

    return (
        <div className="space-y-4">
            <textarea
                value={value || ''}
                onChange={(e) => !isReview && onChange(e.target.value)}
                placeholder="Type your answer here..."
                disabled={isReview}
                className={`w-full p-4 rounded-xl border-2 transition-all outline-none resize-y min-h-[120px] ${isReview
                        ? (isCorrect ? 'border-green-500 bg-green-50/50 dark:bg-green-900/20 text-slate-800 dark:text-slate-200' : 'border-red-300 bg-red-50/50 dark:bg-red-900/20 text-slate-800 dark:text-slate-200')
                        : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
            />

            {isReview && (
                <div className={`flex items-start gap-3 p-4 rounded-xl border ${isCorrect ? 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800'}`}>
                    {isCorrect ? <Check className="text-green-600 mt-0.5" size={20} /> : <X className="text-red-600 mt-0.5" size={20} />}
                    <div>
                        <p className={`font-semibold ${isCorrect ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                            {isCorrect ? 'Correct!' : 'Incorrect'}
                        </p>
                        {!isCorrect && (
                            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                                <strong>Expected Answer:</strong> {correctAnswerText}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
