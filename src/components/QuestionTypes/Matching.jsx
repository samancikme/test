import React, { useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';

export default function Matching({ pairs, value, onChange, isReview }) {
    // Current answers map: { [leftIndex]: rightIndex }
    const selections = value || {};

    const handleSelect = (leftIndex, rightIndex) => {
        if (isReview) return;
        onChange({ ...selections, [leftIndex]: rightIndex });
    };

    const isMatchCorrect = (leftIndex, rightIndex) => {
        // Pairs are passed in correctly matched order: index matches.
        return leftIndex === rightIndex;
    };

    return (
        <div className="space-y-4">
            {pairs.map((pair, leftIdx) => {
                const selectedRightIdx = selections[leftIdx];
                const isAnswered = selectedRightIdx !== undefined;
                const isCorrect = isReview && isAnswered && isMatchCorrect(leftIdx, selectedRightIdx);
                const isIncorrect = isReview && isAnswered && !isCorrect;

                return (
                    <div
                        key={leftIdx}
                        className={`flex flex-col md:flex-row gap-4 p-4 rounded-xl border-2 transition-all ${isCorrect ? 'border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20' :
                                isIncorrect ? 'border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20' :
                                    'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
                            }`}
                    >
                        <div className="flex-1 font-medium text-slate-800 dark:text-slate-200">
                            {pair.left}
                        </div>

                        <div className="hidden md:flex items-center text-slate-400">
                            <ArrowRight size={20} />
                        </div>

                        <div className="flex-1">
                            {isReview && isIncorrect ? (
                                <div className="space-y-2">
                                    <div className="p-3 text-sm rounded bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 flex items-start gap-2">
                                        <X size={16} className="mt-0.5 shrink-0" />
                                        <span>{pairs[selectedRightIdx]?.right}</span>
                                    </div>
                                    <div className="p-3 text-sm rounded bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800/50 flex items-start gap-2">
                                        <Check size={16} className="mt-0.5 shrink-0" />
                                        <span>{pair.right}</span>
                                    </div>
                                </div>
                            ) : isReview && isCorrect ? (
                                <div className="p-3 text-sm rounded bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 flex items-start gap-2">
                                    <Check size={16} className="mt-0.5 shrink-0" />
                                    <span>{pair.right}</span>
                                </div>
                            ) : isReview && !isAnswered ? (
                                <div className="p-3 text-sm rounded bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2">
                                    <span className="font-semibold text-xs uppercase tracking-wider mb-1 block">Expected Match:</span>
                                    <span>{pair.right}</span>
                                </div>
                            ) : (
                                <select
                                    className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm focus:border-primary-500 outline-none text-slate-800 dark:text-slate-200"
                                    value={selectedRightIdx !== undefined ? selectedRightIdx : ''}
                                    onChange={(e) => handleSelect(leftIdx, parseInt(e.target.value))}
                                >
                                    <option value="" disabled>Select match...</option>
                                    {pairs.map((p, idx) => (
                                        <option key={idx} value={idx}>{p.right}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
