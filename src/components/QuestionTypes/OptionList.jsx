import React from 'react';
import { Check, X } from 'lucide-react';

export default function OptionList({ type, options, value, onChange, isReview, correctAnswer, correctAnswers }) {
    const handleChange = (optId) => {
        if (isReview) return;
        if (type === 'radio') {
            onChange(optId);
        } else {
            const current = Array.isArray(value) ? value : [];
            if (current.includes(optId)) {
                onChange(current.filter(id => id !== optId));
            } else {
                onChange([...current, optId]);
            }
        }
    };

    const isChecked = (optId) => {
        if (type === 'radio') return value === optId;
        return Array.isArray(value) && value.includes(optId);
    };

    return (
        <div className="space-y-3">
            {(options || []).map((opt) => {
                const checked = isChecked(opt.id);

                let reviewClass = "";
                let ReviewIcon = null;
                if (isReview) {
                    const isCorrectOpt = type === 'radio' ? opt.id === correctAnswer : correctAnswers?.includes(opt.id);
                    if (isCorrectOpt) {
                        reviewClass = "bg-green-50/50 dark:bg-green-900/20 border-green-500 dark:border-green-500 shadow-[0_0_0_1px_rgba(34,197,94,1)]";
                        ReviewIcon = <Check className="text-green-500 ml-auto" size={20} />;
                    } else if (checked && !isCorrectOpt) {
                        reviewClass = "bg-red-50/50 dark:bg-red-900/20 border-red-300 dark:border-red-800";
                        ReviewIcon = <X className="text-red-500 ml-auto" size={20} />;
                    } else {
                        reviewClass = "opacity-50 grayscale border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800";
                    }
                }

                const activeClass = checked && !isReview
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-[0_0_0_1px_rgba(34,197,94,0.3)]"
                    : "border-slate-200 dark:border-slate-700 hover:border-primary-300 hover:bg-slate-50 dark:hover:bg-slate-800";

                return (
                    <div
                        key={opt.id}
                        onClick={() => handleChange(opt.id)}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-${isReview ? 'default' : 'pointer'} ${isReview ? reviewClass : activeClass}`}
                    >
                        <div className={`flex-shrink-0 w-5 h-5 flex items-center justify-center border transition-colors rounded-${type === 'radio' ? 'full' : 'md'} ${checked ? 'border-primary-500 bg-primary-500' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'}`}>
                            {checked && type === 'radio' && <div className="w-2 h-2 bg-white rounded-full" />}
                            {checked && type === 'checkbox' && !isReview && <Check size={14} className="text-white" />}
                            {isReview && (checked || (type === 'radio' && opt.id === correctAnswer) || (type === 'checkbox' && correctAnswers?.includes(opt.id))) && type === 'checkbox' && <Check size={14} className="text-white" />}
                        </div>
                        <span className={`text-base flex-1 select-none ${checked && !isReview ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-700 dark:text-slate-200'}`}>
                            {opt.text}
                        </span>
                        {ReviewIcon}
                    </div>
                );
            })}
        </div>
    );
}
