import News from "../models/News.js";



import User from "../models/User.js";
import Book from "../models/Book.js";
import Borrow from "../models/Borrow.js";
import LibraryInfo from "../models/LibraryInfo.js";

// @desc    Get all published news
// @route   GET /api/news
// @access  Public
export const getNews = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    let query = {
      isPublished: true,
      $or: [
        { expireDate: { $exists: false } },
        { expireDate: { $gt: new Date() } },
      ],
    };

    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const news = await News.find(query)
      .populate("createdBy", "fullName username")
      .sort({ publishedDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await News.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        news,
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          count: total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ALL news articles (admin - no filter)
// @route   GET /api/news/admin-all
// @access  Private (Admin/Librarian)
export const getAllNewsAdmin = async (req, res, next) => {
  try {
    const { category, status, page = 1, limit = 50 } = req.query;

    let query = {};

    if (category) {
      query.category = category;
    }

    if (status === 'published') {
      query.isPublished = true;
    } else if (status === 'draft') {
      query.isPublished = false;
    }

    const skip = (page - 1) * limit;

    const news = await News.find(query)
      .populate("createdBy", "fullName username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await News.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        news,
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          count: total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single news article
// @route   GET /api/news/:id
// @access  Public
export const getNewsById = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id).populate(
      "createdBy",
      "fullName username",
    );

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "الخبر غير موجود",
      });
    }

    // Update view count
    news.viewCount += 1;
    await news.save();

    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create news article
// @route   POST /api/news
// @access  Private (Admin/Librarian)
export const createNews = async (req, res, next) => {
  try {
    const {
      title,
      content,
      summary,
      category,
      priority,
      isPublished,
      publishedDate,
      expireDate,
      tags,
    } = req.body;

    const news = await News.create({
      title,
      content,
      summary,
      category,
      priority,
      image: req.file ? `/uploads/news/${req.file.filename}` : null,
      isPublished: isPublished === 'true' || isPublished === true,
      publishedDate: (isPublished === 'true' || isPublished === true) ? publishedDate || new Date() : null,
      expireDate,
      tags: tags ? (typeof tags === 'string' ? tags.split(",").map((tag) => tag.trim()) : tags) : [],
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    const populatedNews = await News.findById(news._id).populate(
      "createdBy",
      "fullName username",
    );

    res.status(201).json({
      success: true,
      data: populatedNews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update news article
// @route   PUT /api/news/:id
// @access  Private (Admin/Librarian)
export const updateNews = async (req, res, next) => {
  try {
    const {
      title,
      content,
      summary,
      category,
      priority,
      isPublished,
      publishedDate,
      expireDate,
      tags,
    } = req.body;

    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "الخبر غير موجود",
      });
    }

    // Update fields
    const updateFields = {
      title,
      content,
      summary,
      category,
      priority,
      tags: tags ? (typeof tags === 'string' ? tags.split(",").map((tag) => tag.trim()) : tags) : [],
      updatedBy: req.user.id,
    };

    if (req.file) {
      updateFields.image = `/uploads/news/${req.file.filename}`;
    } else if (req.body.image && (typeof req.body.image === 'object' || req.body.image === 'null' || req.body.image === 'undefined')) {
      // Clean up body if it contains invalid image object
      delete updateFields.image;
    }

    if (isPublished !== undefined) {
      const isPub = isPublished === 'true' || isPublished === true;
      updateFields.isPublished = isPub;
      if (isPub && !news.publishedDate) {
        updateFields.publishedDate = publishedDate || new Date();
      }
    }

    if (publishedDate) updateFields.publishedDate = publishedDate;
    if (expireDate) updateFields.expireDate = expireDate;

    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true },
    ).populate("createdBy updatedBy", "fullName username");

    res.status(200).json({
      success: true,
      data: updatedNews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete news article
// @route   DELETE /api/news/:id
// @access  Private (Admin)
export const deleteNews = async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "الخبر غير موجود",
      });
    }

    await News.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "تم حذف الخبر بنجاح",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin/Librarian)
export const getDashboardStats = async (req, res, next) => {
  try {
    // Import models
    // const User = require("../models/User.js").default;
    // const Book = require("../models/Book.js").default;
    // const Borrow = require("../models/Borrow.js").default;

    // Calculate date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get basic counts
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();
    const totalBorrows = await Borrow.countDocuments();

    // Get recent activity
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    const newBooksThisWeek = await Book.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    const activeBorrowRequests = await Borrow.countDocuments({
      status: { $in: ["pending", "approved", "borrowed"] },
    });

    const overdueBooks = await Borrow.countDocuments({
      status: "borrowed",
      dueDate: { $lt: now },
    });

    // Get recent activities
    const recentUsers = await User.find()
      .select("fullName username createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentBorrows = await Borrow.find()
      .populate("user", "fullName username")
      .populate("book", "title author")
      .select("user book status createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    // Get monthly statistics
    const monthlyStats = await Borrow.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalBooks,
          totalBorrows,
          activeBorrowRequests,
          overdueBooks,
          newUsersThisWeek,
          newBooksThisWeek,
        },
        recent: {
          users: recentUsers,
          borrows: recentBorrows,
        },
        monthlyStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getAnalytics = async (req, res, next) => {
  try {
    // const User = require("../models/User.js").default;
    // const Book = require("../models/Book.js").default;
    // const Borrow = require("../models/Borrow.js").default;

    // Category distribution
    const categoryStats = await Book.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: "$totalCopies" },
          available: { $sum: "$availableCopies" },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Most borrowed books
    const popularBooks = await Borrow.aggregate([
      {
        $group: {
          _id: "$book",
          borrowCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "book",
        },
      },
      {
        $unwind: "$book",
      },
      {
        $sort: { borrowCount: -1 },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          title: "$book.title",
          author: "$book.author",
          borrowCount: 1,
          category: "$book.category",
        },
      },
    ]);

    // User activity
    const userActivity = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    // Monthly borrow trends
    const monthlyTrends = await Borrow.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$borrowDate" },
            month: { $month: "$borrowDate" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        categoryStats,
        popularBooks,
        userActivity,
        monthlyTrends,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
export const getSettings = async (req, res, next) => {
  try {
    // const LibraryInfo = require("../models/LibraryInfo.js").default;

    const settings = await LibraryInfo.find().sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
export const updateSettings = async (req, res, next) => {
  try {
    // const LibraryInfo = require("../models/LibraryInfo.js");

    const updates = req.body;
    const promises = [];

    for (const [type, value] of Object.entries(updates)) {
      const updateData = {
        updatedBy: req.user.id,
        updatedAt: new Date(),
      };

      if (typeof value === "object" && value !== null) {
        if (value.title) updateData.title = value.title;
        if (value.content) updateData.content = value.content;
      } else {
        updateData.content = value;
      }

      promises.push(
        LibraryInfo.findOneAndUpdate(
          { type },
          updateData,
          { upsert: true, new: true },
        ),
      );
    }

    const updatedSettings = await Promise.all(promises);

    res.status(200).json({
      success: true,
      data: updatedSettings,
      message: "تم تحديث الإعدادات بنجاح",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Users Report
// @route   GET /api/reports/users
// @access  Private (Admin)
export const getUsersReport = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Books Report
// @route   GET /api/reports/books
// @access  Private (Admin/Librarian)
export const getBooksReport = async (req, res, next) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Borrows Report
// @route   GET /api/reports/borrows
// @access  Private (Admin/Librarian)
export const getBorrowsReport = async (req, res, next) => {
  try {
    const borrows = await Borrow.find()
      .populate("user", "fullName email")
      .populate("book", "title author")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: borrows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Notifications (Recent Activity)
// @route   GET /api/admin/notifications
// @access  Private (Admin)
export const getNotifications = async (req, res, next) => {
  try {
    // We'll aggregate recent activities as notifications
    const recentUsers = await User.find().select("fullName createdAt").sort({ createdAt: -1 }).limit(5);
    const recentBorrows = await Borrow.find().populate("user", "fullName").populate("book", "title").sort({ createdAt: -1 }).limit(5);

    const notifications = [
      ...recentUsers.map(u => ({
        id: `user-${u._id}`,
        type: 'info',
        title: 'عضو جديد',
        message: `تم تسجيل العضو "${u.fullName}" في المكتبة`,
        date: u.createdAt,
        read: false
      })),
      ...recentBorrows.map(b => ({
        id: `borrow-${b._id}`,
        type: 'success',
        title: 'استعارة جديدة',
        message: `قام "${b.user?.fullName}" باستعارة "${b.book?.title}"`,
        date: b.createdAt,
        read: false
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Get dashboard overview (Frontend Compatible)
// @route   GET /api/admin/overview
export const getDashboardOverview = async (req, res, next) => {
  try {
    const now = new Date();

    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments();

    const activeBorrows = await Borrow.countDocuments({
      status: { $in: ["approved", "borrowed"] }
    });

    const overdueReturns = await Borrow.countDocuments({
      status: "borrowed",
      dueDate: { $lt: now }
    });

    // الطلبات المعلقة
    const pendingRequests = await Borrow.find({ status: "pending" })
      .populate("user", "fullName email")
      .populate("book", "title")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalBooks,
          totalUsers,
          activeBorrows,
          overdueReturns
        },
        pendingRequests
      }
    });

  } catch (error) {
    next(error);
  }
};

export default {
  getNews,
  getAllNewsAdmin,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getDashboardStats,
  getAnalytics,
  getSettings,
  updateSettings,
  getUsersReport,
  getBooksReport,
  getBorrowsReport,
  getNotifications,
  getDashboardOverview
};
