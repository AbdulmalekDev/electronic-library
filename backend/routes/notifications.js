import { Router } from 'express';
const router = Router();

import { getBorrowNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/auth.js';

// All routes are protected and admin/librarian only
router.use(protect);
router.use(authorize('admin', 'librarian'));

// @desc    Get derived borrow notifications for admin
// @route   GET /api/notifications/borrows
router.get('/borrows', getBorrowNotifications);

// @desc    Mark a specific notification as read
// @route   PUT /api/notifications/mark-read/:id
router.put('/mark-read/:id', markAsRead);

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
router.put('/mark-all-read', markAllAsRead);

export default router;
