import React, { useState, useEffect } from 'react';
import { Play, Settings, Moon, Sun } from 'lucide-react';
import { shuffleArray } from '../utils/quizUtils';
import { useTheme } from '../hooks/useTheme';
import { getApiUrl } from '../config';

export default function Home({ startQuiz, availableTests: localTests = [] }) {
    const { isDark, toggleTheme } = useTheme();
    // Initially display local tests before API finishes
    const [availableTests, setAvailableTests] = useState(localTests);
    // Select first local test if available
    const [selectedTestId, setSelectedTestId] = useState(localTests.length > 0 ? localTests[0].id : '');
    const [shuffleQuestions, setShuffleQuestions] = useState(true);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const res = await fetch(`${getApiUrl()}/quizzes`);
                if (!res.ok) throw new Error("Testlarni yuklashda xatolik");
                const fetchedData = await res.json();

                const combined = [...localTests, ...fetchedData];
                setAvailableTests(combined);

                if (!selectedTestId && combined.length > 0) {
                    setSelectedTestId(combined[0].id || combined[0]._id);
                }
            } catch (err) {
                console.error(err);
                // Agar server yonmagan bo'lsa (yoki API xato bersa), hech bo'lmasa local testlar ko'rsatiladi
                // Shuning uchun xatoni katta ekranga chiqarmaymiz
            } finally {
                setLoading(false);
            }
        };
        fetchTests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStart = async () => {
        if (!selectedTestId) return;
        setStarting(true);
        setError(null);

        try {
            let qList = [];

            // Mahalliy test tekshiruvi
            const localTest = localTests.find(t => t.id === selectedTestId);

            if (localTest) {
                // Bu oldingi (JSON) test
                qList = [...(localTest.data || [])];
            } else {
                // Bu yangi serverdagi test (MongoDB'dan)
                const res = await fetch(`${getApiUrl()}/quizzes/${selectedTestId}`);
                if (!res.ok) throw new Error("Test ma'lumotlarini yuklashda xatolik");

                const fullQuiz = await res.json();
                qList = [...(fullQuiz.questions || [])];
            }

            if (qList.length === 0) {
                throw new Error("Tanlangan testda savollar yo'q");
            }

            if (shuffleQuestions) {
                qList = shuffleArray(qList);
            }

            startQuiz(qList);
        } catch (err) {
            setError(err.message);
            setStarting(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 px-4">
            <div className="absolute top-4 right-4">
                <button onClick={toggleTheme} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm text-slate-600 dark:text-slate-300">
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            <div className="max-w-md w-full max-h-full card flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center mb-2">
                    <Play className="text-primary-600 dark:text-primary-400" size={40} />
                </div>
                <h1 className="text-3xl font-bold">Exam Platform</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Quyida bazadagi hamda avvalgi mahalliy testlar ro'yxati keltirilgan.
                </p>

                {error && (
                    <div className="w-full bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                        {error}
                    </div>
                )}

                <div className="w-full text-left space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                        <Settings size={18} /> Select Test
                    </h3>
                    <div className="space-y-2 mb-4">
                        {loading && availableTests.length === 0 ? (
                            <div className="text-center py-4 text-slate-500 text-sm">Testlar yuklanmoqda...</div>
                        ) : availableTests.length === 0 ? (
                            <div className="text-center py-4 text-slate-500 text-sm">Hech qanday test topilmadi.</div>
                        ) : (
                            availableTests.map((test) => {
                                const testId = test.id || test._id;
                                const isLocal = !!test.id;
                                const questionsCount = isLocal ? test.data?.length : 0; // Backend doesnt send questions array length in list directly, but it does. Wait, in quizzes.js I excluded `-questions.correctAnswer`. The whole `questions` array is sent. But wait, `questions` is sent but maybe it's too big? Let's just check length.
                                const testLen = test.questions ? test.questions.length : questionsCount;

                                return (
                                    <label key={testId} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedTestId === testId ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-sm text-slate-900 dark:text-white' : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 text-slate-700 dark:text-slate-300'}`}>
                                        <input type="radio" className="hidden" name="test-selection" checked={selectedTestId === testId} onChange={() => setSelectedTestId(testId)} />
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${selectedTestId === testId ? 'border-primary-500 bg-primary-500' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'}`}>
                                            {selectedTestId === testId && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <div className="flex-1 text-sm font-medium">
                                            {test.title}
                                            <div className="text-xs font-normal text-slate-400 mt-0.5">
                                                {test.description || (isLocal ? 'Mahalliy test' : '')}
                                                {test.level ? ` • Level: ${test.level}` : ''}
                                                {testLen > 0 ? ` • ${testLen} ta savol` : ''}
                                            </div>
                                        </div>
                                    </label>
                                );
                            })
                        )}
                    </div>

                    <h3 className="font-semibold flex items-center gap-2 mb-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Settings size={18} /> Options
                    </h3>
                    <label className="flex items-center justify-between cursor-pointer">
                        <span>Shuffle Questions</span>
                        <input type="checkbox" checked={shuffleQuestions} onChange={() => setShuffleQuestions(!shuffleQuestions)} className="accent-primary-600 w-5 h-5 rounded" />
                    </label>
                </div>

                <button
                    onClick={handleStart}
                    disabled={starting || availableTests.length === 0}
                    className="btn btn-primary w-full text-lg py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {starting ? (
                        <>Yuklanmoqda...</>
                    ) : (
                        <>Start Quiz</>
                    )}
                </button>
            </div>
        </div>
    );
}
