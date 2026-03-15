import { X } from 'lucide-react';

export default function QuestionPalette({ questions, answers, flagged, currentIndex, setCurrentIndex, onClose }) {
    const answeredCount = Object.keys(answers).length;
    const flaggedCount = Object.keys(flagged).filter(k => flagged[k]).length;

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-800 md:rounded-2xl md:border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-bold">Summary</h3>
                <button onClick={onClose} className="md:hidden p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                    <X size={20} />
                </button>
            </div>

            <div className="flex gap-2 p-4 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <div className="flex-1 flex flex-col items-center p-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                    <span className="text-lg">{answeredCount}</span>
                    Answered
                </div>
                <div className="flex-1 flex flex-col items-center p-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg">
                    <span className="text-lg">{flaggedCount}</span>
                    Flagged
                </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 md:max-h-[60vh]">
                <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, idx) => {
                        const isAnswered = !!answers[q.id];
                        const isFlagged = flagged[q.id];
                        const isActive = currentIndex === idx;

                        let btnClass = "relative w-full aspect-square flex items-center justify-center rounded-lg font-medium text-sm transition-all ";

                        if (isActive) btnClass += "border-2 border-primary-500 shadow-inner ";
                        else btnClass += "border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 ";

                        if (isAnswered && !isActive) btnClass += "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800 ";
                        else if (!isAnswered && !isActive) btnClass += "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 ";

                        if (isActive) btnClass += isAnswered ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 " : "bg-white dark:bg-slate-800 ";

                        return (
                            <button key={q.id} onClick={() => setCurrentIndex(idx)} className={btnClass}>
                                {idx + 1}
                                {isFlagged && <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border border-white dark:border-slate-800 shadow-sm" />}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
