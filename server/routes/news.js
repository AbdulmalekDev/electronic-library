import { Router } from 'express';
const router = Router();

// Import controllers
import { getNews, getAllNewsAdmin, getNewsById, createNews, updateNews, deleteNews } from '../controllers/adminController.js';

// Import middleware
import { protect, authorize } from '../middleware/auth.js';

// File upload middleware
import multer, { diskStorage } from 'multer';
import { extname as _extname } from 'path';

// Configure multer for file upload
const storage = diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/news/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'news-' + uniqueSuffix + _extname(file.originalname));
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
    limits: { fileSize: 5 * 1024 * 1024 }
});

// @desc    Get all published news
// @route   GET /api/news
router.get('/', getNews);

// @desc    Get all news for admin (includes drafts)
// @route   GET /api/news/admin-all
router.get('/admin-all', protect, authorize('admin', 'librarian'), getAllNewsAdmin);

// @desc    Get single news article
// @route   GET /api/news/:id
router.get('/:id', getNewsById);

// @desc    Create news article
// @route   POST /api/news
router.post('/', protect, authorize('admin', 'librarian'), upload.single('image'), createNews);

// @desc    Update news article
// @route   PUT /api/news/:id
router.put('/:id', protect, authorize('admin', 'librarian'), upload.single('image'), updateNews);

// @desc    Delete news article
// @route   DELETE /api/news/:id
router.delete('/:id', protect, authorize('admin'), deleteNews);

export default router;