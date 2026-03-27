import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainApp from './MainApp';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { useTheme } from './hooks/useTheme';

// Yopiq marshrut (Faqat admin kira oladi)
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }
    return children;
};

export default function App() {
    useTheme();

    return (
        <BrowserRouter>
            <Routes>
                {/* Asosiy foydalanuvchi qismi */}
                <Route path="/*" element={<MainApp />} />

                {/* Admin qismi */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
