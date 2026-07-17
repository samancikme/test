import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import level2Questions from './data/Level_2_1_127.json';
import level1Questions from './data/Level_1_80_complete.json';
import level3Questions from './data/Level_3_1_132.json';
import level3NewQuestions from './data/Level_3_New.json';
import level3ExtraQuestions from './data/Level_3_Extra.json';
import level3_15Questions from './data/Level_3_15_Questions.json';
import taza134Questions from './data/Taza134_Converted.json';
import level2_80Questions from './data/Level_2_80_Questions.json';
import reportQuestions from './data/Report_questions.json';
import { useTheme } from './hooks/useTheme';

const availableTests = [
    { id: 'level-1', title: 'Level 1 (80 So\'raw)', data: level1Questions },
    { id: 'level-2', title: 'Level 2 (1-127 So\'raw)', data: level2Questions },
    { id: 'level-2-80q', title: 'Level 2 (80 So\'raw)', data: level2_80Questions },
    { id: 'level-3', title: 'Level 3 (131 So\'raw)', data: level3Questions },
    { id: 'level-3-new', title: 'Level 3 (New) (74 So\'raw)', data: level3NewQuestions },
    { id: 'level-3-extra', title: 'Level 3 (Extra) (8 So\'raw)', data: level3ExtraQuestions },
    { id: 'level-3-15q', title: 'Level 3 (15 So\'raw)', data: level3_15Questions },
    { id: 'taza-134', title: 'Taza 134 (132 So\'raw)', data: taza134Questions },
    { id: 'report', title: 'Report (108 So\'raw)', data: reportQuestions },
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
