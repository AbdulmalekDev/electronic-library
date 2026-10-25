import { Router } from 'express';
const router = Router();

// Import controllers
import { register, login, getMe, updateProfile, changePassword, markNotificationAsRead, getNotifications, forgotPassword, resetPassword } from '../controllers/authController.js';

// Import middleware
import { protect } from '../middleware/auth.js';

// File upload middleware
import multer, { diskStorage } from 'multer';
import { extname as _extname } from 'path';

// Configure multer for file upload
const storage = diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/users/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'user-' + uniqueSuffix + _extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(_extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
});

// @desc    Register user
// @route   POST /api/auth/register
router.post('/register', register);

// @desc    Login user
// @route   POST /api/auth/login
router.post('/login', login);

// @desc    Get current user
// @route   GET /api/auth/me
router.get('/me', protect, getMe);

// @desc    Update user profile
// @route   PUT /api/auth/profile
router.put('/profile', protect, upload.single('profileImage'), updateProfile);

// Aliases for compatibility
router.get('/profile', protect, getMe);
router.put('/update-profile', protect, upload.single('profileImage'), updateProfile);

// @desc    Change password
// @route   PUT /api/auth/password
router.put('/password', protect, changePassword);

// @desc    Get notifications
// @route   GET /api/auth/notifications
router.get('/notifications', protect, getNotifications);

// @desc    Mark notification as read
// @route   PUT /api/auth/notifications/:id/read
router.put('/notifications/:id/read', protect, markNotificationAsRead);

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
router.post('/reset-password/:token', resetPassword);

export default router;