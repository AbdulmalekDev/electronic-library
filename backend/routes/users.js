import { Router } from 'express';
const router = Router();

import {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    addToFavorites,
    removeFromFavorites,
    addToBookmarks,
    removeFromBookmarks
} from '../controllers/userController.js';

import { protect, authorize } from '../middleware/auth.js';

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
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit for avatars
    }
});

// All routes are protected
router.use(protect);

// Admin & Librarian can view users
router.get('/', authorize('admin', 'librarian'), getUsers);
router.get('/:id', authorize('admin', 'librarian'), getUser);

// Only Admin can create, update, delete users
router.post('/', authorize('admin'), upload.single('profileImage'), createUser);
router.put('/:id', authorize('admin'), upload.single('profileImage'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

// Favorites and Bookmarks (Individual users)
router.post('/favorites/:bookId', addToFavorites);
router.delete('/favorites/:bookId', removeFromFavorites);
router.post('/bookmarks/:bookId', addToBookmarks);
router.delete('/bookmarks/:bookId', removeFromBookmarks);

export default router;
