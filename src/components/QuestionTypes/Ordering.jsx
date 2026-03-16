import React from 'react';
import { ArrowDown, ArrowUp, Check, X } from 'lucide-react';

export default function Ordering({ items, correctOrder, value, onChange, isReview }) {
    const currentOrder = value || items || [];

    const moveItem = (index, direction) => {
        if (isReview) return;
        const newOrder = [...currentOrder];
        if (direction === 'up' && index > 0) {
            [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
        } else if (direction === 'down' && index < newOrder.length - 1) {
            [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
        }
        onChange(newOrder);
    };

    return (
        <div className="space-y-3">
            {currentOrder.map((item, index) => {
                const isCorrectPos = isReview && correctOrder && item === correctOrder[index];

                return (
                    <div
                        key={item}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${isReview && isCorrectPos ? 'border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20' :
                                isReview && !isCorrectPos ? 'border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20' :
                                    'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
                            }`}
                    >
                        <div className="flex flex-col gap-1 items-center justify-center p-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500">
                            {!isReview && (
                                <>
                                    <button
                                        onClick={() => moveItem(index, 'up')}
                                        disabled={index === 0}
                                        className="hover:text-primary-600 disabled:opacity-30 disabled:hover:text-slate-500"
                                    >
                                        <ArrowUp size={16} />
                                    </button>
                                    <span className="text-xs font-bold leading-none">{index + 1}</span>
                                    <button
                                        onClick={() => moveItem(index, 'down')}
                                        disabled={index === currentOrder.length - 1}
                                        className="hover:text-primary-600 disabled:opacity-30 disabled:hover:text-slate-500"
                                    >
                                        <ArrowDown size={16} />
                                    </button>
                                </>
                            )}
                            {isReview && <span className="text-sm font-bold px-1">{index + 1}</span>}
                        </div>

                        <div className="flex-1 text-slate-800 dark:text-slate-200 text-sm md:text-base">
                            {item}
                        </div>

                        {isReview && (
                            <div className="flex-shrink-0">
                                {isCorrectPos ? <Check className="text-green-600" size={20} /> : <X className="text-red-600" size={20} />}
                            </div>
                        )}
                    </div>
                );
            })}

            {isReview && !currentOrder.every((val, index) => val === correctOrder[index]) && (
                <div className="mt-6 p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800/50">
                    <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-2">Expected Order:</h4>
                    <ol className="list-decimal list-inside text-sm text-slate-700 dark:text-slate-300 space-y-1">
                        {correctOrder.map((item, idx) => (
                            <li key={idx} className="pl-2">{item}</li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
}
