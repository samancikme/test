import React from 'react';

export default function StatementGrid({ statements, options, value, onChange, isReview }) {
    const handleSelect = (stId, optId) => {
        if (isReview) return;
        onChange({ ...(value || {}), [stId]: optId });
    };

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800/80">
                    <tr>
                        <th className="p-3 font-semibold w-full min-w-[200px]">Statement</th>
                        {(options || []).map(opt => (
                            <th key={opt.id} className="p-3 font-semibold text-center whitespace-nowrap">{opt.text}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {(statements || []).map(st => (
                        <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors bg-white dark:bg-slate-800">
                            <td className="p-3 text-sm md:text-base text-slate-700 dark:text-slate-300">
                                {st.text}
                                {isReview && (
                                    <div className="text-xs mt-1">
                                        {value[st.id] === st.correctAnswer ? (
                                            <span className="text-green-600 font-medium">Correct</span>
                                        ) : (
                                            <span className="text-red-500 font-medium">Expected: {options.find(o => o.id === st.correctAnswer)?.text}</span>
                                        )}
                                    </div>
                                )}
                            </td>
                            {(options || []).map(opt => {
                                const checked = value[st.id] === opt.id;

                                let dotClass = checked ? 'border-primary-500 bg-primary-500' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-transparent';

                                if (isReview) {
                                    if (opt.id === st.correctAnswer) dotClass = 'border-green-500 bg-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.3)]';
                                    else if (checked) dotClass = 'border-red-500 bg-red-500';
                                    else dotClass = 'border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 grayscale text-transparent';
                                }

                                return (
                                    <td key={opt.id} className="p-3 text-center align-middle relative">
                                        <div
                                            onClick={() => handleSelect(st.id, opt.id)}
                                            className={`absolute inset-0 flex items-center justify-center cursor-${isReview ? 'default' : 'pointer'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${dotClass}`}>
                                                {((checked && !isReview) || (isReview && (checked || opt.id === st.correctAnswer))) && (
                                                    <div className="w-2 h-2 bg-white rounded-full" />
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
