import api from './api';

const favoriteService = {
    // Toggle book favorite status
    toggleFavorite: (bookId) => api.post(`/favorites/toggle/${bookId}`),

    // Get current user's favorites
    getMyFavorites: () => api.get('/favorites'),
};

export default favoriteService;
