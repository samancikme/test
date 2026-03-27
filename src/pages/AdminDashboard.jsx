import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Trash2, LogOut, FileText, FileDown, Plus } from 'lucide-react';
import { getApiUrl } from '../config';

export default function AdminDashboard() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    const fetchQuizzes = async () => {
        try {
            const res = await fetch(`${getApiUrl()}/quizzes`);
            const data = await res.json();
            setQuizzes(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Haqiqatan ham bu testni o'chirmoqchimisiz?")) return;

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${getApiUrl()}/quizzes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setQuizzes(quizzes.filter(q => q._id !== id));
                setMessage({ type: 'success', text: "Test o'chirildi" });
            } else {
                setMessage({ type: 'error', text: "O'chirishda xatolik yuz berdi" });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Server xatosi' });
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage({ type: 'error', text: 'Iltimos, fayl tanlang (.docx yoki .pdf)' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${getApiUrl()}/quizzes/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: `Test yuklandi! Savollar soni: ${data.questionsCount}` });
                setFile(null);
                document.getElementById('file-upload').value = '';
                fetchQuizzes();
            } else {
                setMessage({ type: 'error', text: data.message || 'Yuklashda xatolik' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Server xatosi' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-10 w-full">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="font-bold text-xl text-primary-600 dark:text-primary-400 flex items-center gap-2">
                        <FileText size={24} /> Admin Panel
                    </div>
                    <button onClick={handleLogout} className="btn py-1.5 px-3 text-sm flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200">
                        <LogOut size={16} /> Chiqish
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 mt-8 flex flex-col md:flex-row gap-8">
                {/* Chap tomon: Yangi fayl yuklash */}
                <div className="w-full md:w-1/3 flex flex-col gap-6">
                    <div className="card p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
                            <Plus size={20} className="text-primary-500" /> Yangi Test Qo'shish
                        </h2>

                        {message.text && (
                            <div className={`p-3 rounded-lg text-sm mb-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium dark:text-slate-300">DOCX yoki PDF fayl tanlang</label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept=".docx,.pdf"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-slate-700 dark:file:text-slate-200 dark:hover:file:bg-slate-600 outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={uploading || !file}
                                className="btn btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {uploading ? "Fayl o'qilmoqda..." : <><Upload size={18} /> Yuklash</>}
                            </button>
                        </form>
                    </div>

                    {/* Shablon Namunasi */}
                    <div className="card p-6 bg-slate-100/50 dark:bg-slate-800/50 border-dashed border-2">
                        <h3 className="font-bold flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-2">
                            <FileDown size={18} /> Shablon Namunasi
                        </h3>
                        <p className="text-xs text-slate-500 mb-3">Siz yuklayotgan fayl aynan shu formatda bo'lishi shart:</p>
                        <div className="bg-slate-800 dark:bg-black p-3 rounded-lg text-xs font-mono text-green-400 overflow-x-auto whitespace-pre">
                            {`Title: Tarix Testi
Description: 1-kurslar uchun
Level: 1-daraja

Q: O'zbekistonning poytaxti?
Type: single
A) Samarqand
B) Toshkent (T)
C) Buxoro
D) Xiva

Q: Qaysi mevalar qizil?
Type: multi
A) Olma (T)
B) Banan
C) Qulupnay (T)
`}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            <b>(T)</b> yozuvi o'sha variant to'g'ri ekanligini bildiradi. Qisqa va Londa yozing!
                        </p>
                    </div>
                </div>

                {/* O'ng tomon: Bazadagi testlar ro'yxati */}
                <div className="w-full md:w-2/3">
                    <div className="card p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
                            <FileText size={20} className="text-primary-500" /> Barcha Testlar Ro'yxati
                        </h2>

                        {loading ? (
                            <div className="text-center py-8 text-slate-500">Yuklanmoqda...</div>
                        ) : quizzes.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                Hali hech qanday test qo'shilmagan.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {quizzes.map((quiz) => (
                                    <div key={quiz._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-300 transition-colors">
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-white text-lg">{quiz.title}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                {quiz.description} • {quiz.questions?.length || 0} ta savol
                                            </p>
                                        </div>
                                        <div className="mt-3 sm:mt-0 flex items-center gap-2">
                                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold mr-2">
                                                Level: {quiz.level || '-'}
                                            </span>
                                            <button
                                                onClick={() => handleDelete(quiz._id)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                title="O'chirish"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
