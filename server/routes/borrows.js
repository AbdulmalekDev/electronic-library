import { Router } from 'express';
const router = Router();

// Import controllers
import { createBorrowRequest, getMyBorrowRequests, getAllBorrowRequests, approveBorrow, rejectBorrow, updateBorrowStatus, returnBook, cancelBorrowRequest, getBorrowStats } from '../controllers/borrowController.js';

// Import middleware
import { protect, authorize } from '../middleware/auth.js';

// @desc    Create borrow request
// @route   POST /api/borrows
router.post('/', protect, createBorrowRequest);
router.post('/request', protect, createBorrowRequest);

// @desc    Get my borrow requests
// @route   GET /api/borrows/my-requests
router.get('/my-requests', protect, getMyBorrowRequests);

// @desc    Get all borrow requests (for admin/librarian)
// @route   GET /api/borrows
router.get('/', protect, authorize('admin', 'librarian'), getAllBorrowRequests);

// @desc    Get borrow statistics
// @route   GET /api/borrows/stats
router.get('/stats', protect, authorize('admin', 'librarian'), getBorrowStats);

// @desc    Approve borrow request
// @route   PUT /api/borrows/:id/approve
router.put('/:id/approve', protect, authorize('admin', 'librarian'), approveBorrow);

// @desc    Reject borrow request
// @route   PUT /api/borrows/:id/reject
router.put('/:id/reject', protect, authorize('admin', 'librarian'), rejectBorrow);

// @desc    Update borrow status (Legacy)
// @route   PUT /api/borrows/:id/status
router.put('/:id/status', protect, authorize('admin', 'librarian'), updateBorrowStatus);

// @desc    Return book
// @route   PUT /api/borrows/:id/return
router.put('/:id/return', protect, authorize('admin', 'librarian'), returnBook);

// @desc    Cancel borrow request
// @route   DELETE /api/borrows/:id
router.delete('/:id', protect, cancelBorrowRequest);

export default router;