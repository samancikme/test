export const getApiUrl = () => {
    // Vite-da backend URL-ni .env fayldan o'qiymiz
    return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};
