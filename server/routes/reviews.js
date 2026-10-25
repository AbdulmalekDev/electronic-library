import { Router } from 'express';
const router = Router();

// Import controllers
import { createReview, getBookReviews, getMyReviews, updateReview, deleteReview, getAllReviews, approveReview, reportReview } from '../controllers/reviewController.js';

// Import middleware
import { protect, authorize } from '../middleware/auth.js';

// @desc    Create a review
// @route   POST /api/reviews
router.post('/', protect, createReview);

// @desc    Get reviews for a book
// @route   GET /api/reviews/book/:bookId
router.get('/book/:bookId', getBookReviews);

// @desc    Get my reviews
// @route   GET /api/reviews/my-reviews
router.get('/my-reviews', protect, getMyReviews);

// @desc    Update review
// @route   PUT /api/reviews/:id
router.put('/:id', protect, updateReview);

// @desc    Delete review
// @route   DELETE /api/reviews/:id
router.delete('/:id', protect, deleteReview);

// @desc    Get all reviews (for admin/librarian)
// @route   GET /api/reviews/admin/all
router.get('/admin/all', protect, authorize('admin', 'librarian'), getAllReviews);

// @desc    Approve/Reject review (for admin/librarian)
// @route   PUT /api/reviews/admin/:id/approve
router.put('/admin/:id/approve', protect, authorize('admin', 'librarian'), approveReview);

// @desc    Report review
// @route   POST /api/reviews/:id/report
router.post('/:id/report', protect, reportReview);

export default router;