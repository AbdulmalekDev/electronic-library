import api from './api';

const borrowService = {
    // Get current user's borrow requests
    getMyBorrowRequests: (params) => api.get('/borrows/my-requests', { params }),

    // Get all borrow requests (Admin/Librarian)
    getAllBorrowRequests: (params) => api.get('/borrows', { params }),

    // Create new borrow request
    requestBorrow: (bookId, dueDate) => api.post('/borrows', { bookId, dueDate }),

    // Update borrow status (Legacy)
    updateBorrowStatus: (id, status, notes) => api.put(`/borrows/${id}/status`, { status, notes }),

    // Approve borrow request (Expert)
    approveBorrow: (id, options) => api.put(`/borrows/${id}/approve`, options),

    // Reject borrow request (Expert)
    rejectBorrow: (id, notes) => api.put(`/borrows/${id}/reject`, { notes }),

    // Return book
    returnBook: (id, data) => api.put(`/borrows/${id}/return`, data),

    // Cancel borrow request
    cancelBorrowRequest: (id) => api.delete(`/borrows/${id}`),

    // Get borrow statistics
    getBorrowStats: () => api.get('/borrows/stats'),
};

export default borrowService;
