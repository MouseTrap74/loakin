import axios from 'axios';

const API_BASE_URL =
    (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Otomatis attach token ke setiap request kalau ada
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Kalau response 401, otomatis logout dan redirect ke login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

/**
 * Build a full URL to a file in Laravel's /storage directory.
 * @param {string} path — relative path inside storage (e.g. "photos/abc.jpg")
 * @returns {string} absolute URL
 */
export const storageUrl = (path) => `${API_BASE_URL}/storage/${path}`;

export default api;