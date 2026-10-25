import api from './api';
import favoriteService from './favoriteService';

const bookService = {
    // Get all books with optional filters
    getAllBooks: (params) => api.get('/books', { params }),

    // Get single book by ID
    getBook: (id) => api.get(`/books/${id}`),

    // Create new book (Admin)
    createBook: (data) => api.post('/books', data),

    // Update book (Admin)
    updateBook: (id, data) => api.put(`/books/${id}`, data),

    // Delete book (Admin)
    deleteBook: (id) => api.delete(`/books/${id}`),

    // Get book reviews
    getBookReviews: (id) => api.get(`/reviews/book/${id}`),

    // Add review
    addReview: (id, data) => api.post('/reviews', { ...data, bookId: id }),

    // Request to borrow book
    requestBorrow: (id) => api.post('/borrows', { bookId: id }),

    // Add to bookmarks (if implemented)
    addToBookmarks: (id) => api.post(`/users/bookmarks/${id}`),

    // Remove from bookmarks (if implemented)
    removeFromBookmarks: (id) => api.delete(`/users/bookmarks/${id}`),

    // Use favoriteService for favorites
    toggleFavorite: (id) => favoriteService.toggleFavorite(id),

    // Expert Book Access (Read)
    accessBook: (id) => api.get(`/books/${id}/access`, { responseType: 'blob' }),

    // Expert Book Download
    downloadBook: (id) => api.get(`/books/${id}/download`, { responseType: 'blob' }),
};

export default bookService;
