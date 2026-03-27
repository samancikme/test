import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import level2Questions from './data/Level_2_1_127.json';
import level1Questions from './data/Level_1_80_complete.json';
import { useTheme } from './hooks/useTheme';

const availableTests = [
    { id: 'level-1', title: 'Level 1 (80 So\'raw)', data: level1Questions },
    { id: 'level-2', title: 'Level 2 (1-127 So\'raw)', data: level2Questions },
];

function MainApp() {
    const [currentPage, setCurrentPage] = useState('home');
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [flagged, setFlagged] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(0);

    useTheme();

    useEffect(() => {
        const savedState = localStorage.getItem('quiz_progress');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            setQuestions(parsed.questions || []);
            setAnswers(parsed.answers || {});
            setFlagged(parsed.flagged || {});
            if (parsed.currentPage) setCurrentPage(parsed.currentPage);
            if (parsed.timeRemaining) setTimeRemaining(parsed.timeRemaining);
        }
    }, []);

    useEffect(() => {
        if (currentPage !== 'home') {
            localStorage.setItem('quiz_progress', JSON.stringify({
                questions, answers, flagged, currentPage, timeRemaining
            }));
        } else {
            localStorage.removeItem('quiz_progress');
        }
    }, [questions, answers, flagged, currentPage, timeRemaining]);

    const startQuiz = (shuffledQuestions) => {
        setQuestions(shuffledQuestions);
        setAnswers({});
        setFlagged({});
        setCurrentPage('quiz');
        setTimeRemaining(shuffledQuestions.length * 60);
    };

    const submitQuiz = () => {
        setCurrentPage('result');
    };

    const restartQuiz = () => {
        setCurrentPage('home');
        setAnswers({});
        setFlagged({});
        localStorage.removeItem('quiz_progress');
    };

    const handleBackToHome = () => {
        if (window.confirm("Haqiqatan ham testni to'xtatib bosh menyuga qaytishni xohlaysizmi? Barcha belgilagan javoblaringiz o'chib ketadi.")) {
            restartQuiz();
        }
    };

    return (
        <div className="min-h-screen font-sans">
            {currentPage === 'home' && (
                <Home
                    startQuiz={startQuiz}
                    availableTests={availableTests}
                />
            )}
            {currentPage === 'quiz' && (
                <Quiz
                    questions={questions}
                    answers={answers}
                    setAnswers={setAnswers}
                    flagged={flagged}
                    setFlagged={setFlagged}
                    timeRemaining={timeRemaining}
                    setTimeRemaining={setTimeRemaining}
                    onSubmit={submitQuiz}
                    onBack={handleBackToHome}
                />
            )}
            {(currentPage === 'result' || currentPage === 'review') && (
                <Result
                    questions={questions}
                    answers={answers}
                    onRestart={restartQuiz}
                    isReviewMode={currentPage === 'review'}
                    setReviewMode={() => setCurrentPage('review')}
                />
            )}
        </div>
    );
}

export default MainApp;
