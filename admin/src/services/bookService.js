import api from './api';

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

    // Add to favorites (if implemented)
    addToFavorites: (id) => api.post(`/users/favorites/${id}`),

    // Remove from favorites (if implemented)
    removeFromFavorites: (id) => api.delete(`/users/favorites/${id}`),
};

export default bookService;
