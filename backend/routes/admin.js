import { Router } from 'express';
const router = Router();

// Import controllers
import {
  getDashboardStats,
  getAnalytics,
  getSettings,
  updateSettings,
  getUsersReport,
  getBooksReport,
  getBorrowsReport,
  getNotifications,
  getDashboardOverview
} from '../controllers/adminController.js';

// Import middleware
import { protect, authorize } from '../middleware/auth.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
router.get('/dashboard', protect, authorize('admin', 'librarian'), getDashboardStats);

// @desc    Get analytics data
// @route   GET /api/admin/analytics
router.get('/analytics', protect, authorize('admin'), getAnalytics);

// @desc    Get system settings
// @route   GET /api/admin/settings
router.get('/settings', protect, authorize('admin'), getSettings);

// @desc    Update system settings
// @route   PUT /api/admin/settings
router.put('/settings', protect, authorize('admin'), updateSettings);

// Report Routes
router.get('/users', protect, authorize('admin'), getUsersReport);
router.get('/books', protect, authorize('admin', 'librarian'), getBooksReport);
router.get('/borrows', protect, authorize('admin', 'librarian'), getBorrowsReport);
router.get('/overview', protect, authorize('admin'), getDashboardOverview);
// Notifications
router.get('/notifications', protect, authorize('admin', 'librarian'), getNotifications);

export default router;