import { X } from 'lucide-react';

export default function QuestionPalette({ questions, answers, flagged, currentIndex, setCurrentIndex, onClose, results }) {
    const submittedCount = results ? Object.keys(results).length : 0;
    const correctCount = results ? Object.values(results).filter(Boolean).length : 0;
    const wrongCount = submittedCount - correctCount;

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
                    <span className="text-lg">{correctCount}</span>
                    To'g'ri
                </div>
                <div className="flex-1 flex flex-col items-center p-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
                    <span className="text-lg">{wrongCount}</span>
                    Xato
                </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 md:max-h-[60vh]">
                <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, idx) => {
                        const isSubmitted = results && results[q.id] !== undefined;
                        const isCorrect = results && results[q.id] === true;
                        const isWrong = isSubmitted && !isCorrect;
                        const isFlagged = flagged[q.id];
                        const isActive = currentIndex === idx;

                        let btnClass = "relative w-full aspect-square flex items-center justify-center rounded-lg font-medium text-sm transition-all ";

                        if (isActive) {
                            btnClass += "border-2 border-primary-500 shadow-inner ";
                            if (isCorrect) btnClass += "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 ";
                            else if (isWrong) btnClass += "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 ";
                            else btnClass += "bg-white dark:bg-slate-800 ";
                        } else if (isCorrect) {
                            btnClass += "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-800 ";
                        } else if (isWrong) {
                            btnClass += "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 ";
                        } else {
                            btnClass += "border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 ";
                        }

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
