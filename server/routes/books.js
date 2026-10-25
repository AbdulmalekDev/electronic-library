import { Router } from 'express';
const router = Router();

// Import controllers
import { getBooks, getBook, createBook, updateBook, deleteBook, getBookStats } from '../controllers/bookController.js';
import { accessBook, downloadBook } from '../controllers/borrowController.js';

// Import middleware
import { protect, authorize } from '../middleware/auth.js';

// File upload middleware
import multer, { diskStorage } from 'multer';
import { extname as _extname, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure absolute upload directories exist
const booksDir = join(__dirname, '../uploads/books');
const protectedBooksDir = join(__dirname, '../protected/books');

if (!fs.existsSync(booksDir)) {
  fs.mkdirSync(booksDir, { recursive: true });
}
if (!fs.existsSync(protectedBooksDir)) {
  fs.mkdirSync(protectedBooksDir, { recursive: true });
}

// Configure multer for file upload
const storage = diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'coverImage') {
      cb(null, booksDir);
    } else if (file.fieldname === 'pdfFile') {
      cb(null, protectedBooksDir);
    } else {
      cb(new Error(`حقل الرفع غير مدعوم: ${file.fieldname}`), null);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + _extname(file.originalname).toLowerCase());
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'coverImage') {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(_extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      return cb(new Error('صورة الغلاف يجب أن تكون بصيغة صورة صالحة (JPG, PNG, WebP)'));
    }
  } else if (file.fieldname === 'pdfFile') {
    const isPdfExt = /\.pdf$/i.test(file.originalname);
    const isPdfMime = file.mimetype === 'application/pdf' || file.mimetype === 'application/x-pdf';
    if (isPdfExt || isPdfMime) {
      return cb(null, true);
    } else {
      return cb(new Error('ملف الكتاب يجب أن يكون بصيغة PDF'));
    }
  } else {
    return cb(new Error('حقل الرفع غير مدعوم'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// @desc    Get all books
// @route   GET /api/books
router.get('/', getBooks);

// @desc    Get single book
// @route   GET /api/books/:id
// @desc    Get book statistics
// @route   GET /api/books/stats
router.get('/stats', protect, authorize('admin', 'librarian'), getBookStats);

// @desc    Get single book
// @route   GET /api/books/:id
router.get('/:id', getBook);

// @desc    Access book content (Stream)
// @route   GET /api/books/:id/access
router.get('/:id/access', protect, accessBook);

// @desc    Download book
// @route   GET /api/books/:id/download
router.get('/:id/download', protect, downloadBook);

// @desc    Create new book
// @route   POST /api/books
router.post(
  '/',
  protect,
  authorize('admin', 'librarian'),
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'pdfFile', maxCount: 1 },
  ]),
  createBook
);

router.put('/:id',
  protect,
  authorize('admin', 'librarian'),
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'pdfFile', maxCount: 1 },
  ]),
  updateBook
);
// @desc    Delete book
// @route   DELETE /api/books/:id
router.delete('/:id', protect, authorize('admin'), deleteBook);

export default router;