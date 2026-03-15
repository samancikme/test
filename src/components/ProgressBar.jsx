export default function ProgressBar({ progress }) {
    return (
        <div className="fixed top-16 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 z-20">
            <div
                className="h-full bg-primary-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
