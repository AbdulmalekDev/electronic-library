import axios from 'axios';

/**
 * API CONFIGURATION
 * Uses environment variables for BASE_URL and fallbacks to standard localhost:5001/api.
 */
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
console.log("API URL:",  BASE_URL);

// Ensure /api is appended if not present, and handle potential port issues from .env
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

const api = axios.create({
    baseURL: API_URL,
});
console.log("API URL:", process.env.REACT_APP_API_URL);

// Request interceptor for adding the bearer token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Safely set header for Axios 1.x AxiosHeaders prototype
            if (config.headers && config.headers.set) {
                config.headers.set('Authorization', `Bearer ${token}`);
            } else {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Log error for easier debugging
        console.error(`API Error [${error.config?.method?.toUpperCase()}] ${error.config?.url}:`, error.response?.status, error.response?.data);

        if (error.response && error.response.status === 401) {
            // Check if it's a login request OR a user load request
            const isAuthRequest = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/me');

            if (!isAuthRequest) {
                // IMPORTANT: Only remove token if it's NOT an initial auth check failure
                console.warn('Unauthorized access detected on non-auth route. Potentially invalid token.');

                localStorage.removeItem('token');
                localStorage.removeItem('user');

                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

/**
 * GENERIC API HELPERS (Originally from src/utils/api.js)
 * Consolidated here to ensure they benefit from interceptors and central URL config.
 */

export const fetchDataFromApi = async (url) => {
    try {
        const { data } = await api.get(url);
        return data;
    } catch (error) {
        console.error("API Fetch Error:", error);
        return { success: false, msg: error.response?.data?.message || error.message };
    }
};

export const postData = async (url, formData) => {
    try {
        const res = await api.post(url, formData);
        return res.data;
    } catch (error) {
        console.error("API Post Error:", error);
        return { success: false, msg: error.response?.data?.message || error.message, error: true };
    }
};

export const editData = async (url, updatedData) => {
    try {
        const res = await api.put(url, updatedData);
        return res.data;
    } catch (error) {
        console.error("API Edit Error:", error);
        return { success: false, msg: error.response?.data?.message || error.message, error: true };
    }
};

export const deleteData = async (url) => {
    try {
        const res = await api.delete(url);
        return res.data;
    } catch (error) {
        console.error("API Delete Error:", error);
        return { success: false, msg: error.response?.data?.message || error.message };
    }
};

export const deleteImages = async (url, image) => {
    try {
        const res = await api.delete(url, { data: image });
        return res.data;
    } catch (error) {
        console.error("API Delete Image Error:", error);
        return { success: false, msg: error.response?.data?.message || error.message };
    }
};

/**
 * SPECIFIC ENDPOINTS (Originally from src/services/api.js)
 */

// News API Calls
export const getAllNewsAdmin = () => api.get('/news/admin-all');
export const getNewsById = (id) => api.get(`/news/${id}`);
export const createNews = (newsData) => api.post('/news', newsData);
export const updateNews = (id, newsData) => api.put(`/news/${id}`, newsData);
export const deleteNews = (id) => api.delete(`/news/${id}`);

// Users API Calls
export const getAllUsers = (params) => api.get('/users', { params });
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (userData) => api.post('/users', userData);
export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const updateProfile = (userData) => api.put('/auth/update-profile', userData);
export const getMe = () => api.get('/auth/me');

// Borrows API Calls
export const getAllBorrows = (params) => api.get('/borrows', { params });
export const getBorrowStats = (params) => api.get('/borrows/stats', { params });
export const approveBorrow = (id, options) => api.put(`/borrows/${id}/approve`, options);
export const rejectBorrow = (id, notes) => api.put(`/borrows/${id}/reject`, { notes });
export const returnBook = (id, data) => api.put(`/borrows/${id}/return`, data);
export const deleteBorrow = (id) => api.delete(`/borrows/${id}`);

// Admin & Reports
export const getNotifications = () => api.get('/admin/notifications');
export const getReports = (type) => api.get(`/reports/${type}`);

export default api;
