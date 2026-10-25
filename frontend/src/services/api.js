import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
});

// Request interceptor for adding the bearer token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
                // This prevents clearing a valid token just because an admin data fetch failed due to a server glitch
                console.warn('Unauthorized access detected on non-auth route. Potentially invalid token.');

                // Optional: You might want to skip removal and just let the app handle it via AuthContext
                // But for security, removing it is safer ONLY IF we are sure the token is actually expired/invalid
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

// News API Calls
export const getAllNewsAdmin = () => api.get('/news/admin-all');
export const getNewsById = (id) => api.get(`/news/${id}`);
export const createNews = (newsData) => api.post('/news', newsData);
export const updateNews = (id, newsData) => api.put(`/news/${id}`, newsData);
export const deleteNews = (id) => api.delete(`/news/${id}`);

export default api;
