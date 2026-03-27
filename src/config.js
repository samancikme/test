export const getApiUrl = () => {
    // Vite-da import.meta.env.PROD ishlab chiqarish muhitini bildiradi
    return import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';
};
