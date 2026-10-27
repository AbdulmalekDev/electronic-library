import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import fs from 'fs';

// Import error handler
import errorHandler from './middleware/errorHandler.js';
import { initCronJobs } from './utils/cron.js';

// Import routes
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import borrowRoutes from './routes/borrows.js';
import reviewRoutes from './routes/reviews.js';
import newsRoutes from './routes/news.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/users.js';
import favoriteRoutes from './routes/favorites.js';
import dynamicListRoutes from './routes/dynamicLists.js';
import notificationRoutes from './routes/notifications.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure upload directories exist
const ensureUploadDirs = () => {
    const dirs = [
        join(__dirname, './uploads'),
        join(__dirname, './uploads/news'),
        join(__dirname, './uploads/books'),
        join(__dirname, './uploads/users'),
        join(__dirname, './uploads/settings'),
        join(__dirname, './protected/books')
    ];

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        }
    });
};

ensureUploadDirs();
initCronJobs();

const app = express();

const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        process.env.FRONTEND_URL,
        process.env.ADMIN_URL
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));


// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false
}));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: {
        success: false,
        message: 'تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً'
    }
});
app.use('/api', limiter);

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

// Serve static files
app.use('/uploads', express.static(join(__dirname, './uploads')));

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrows', borrowRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/dynamic-lists', dynamicListRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'المسار غير موجود'
    });
});

// Global error handler
app.use(errorHandler);

export default app;
