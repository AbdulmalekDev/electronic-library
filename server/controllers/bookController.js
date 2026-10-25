import Book from "../models/Book.js";
import Review from "../models/Review.js";
import Borrow from "../models/Borrow.js";
import Favorite from "../models/Favorite.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// @desc    Get all books
// @route   GET /api/books
// @access  Public
export const getBooks = async (req, res, next) => {
  try {
    let query = {};

    // Default to 'available' for public browsing, but allow flexibility for admin/filtered queries
    if (req.query.status) {
      query.status = req.query.status;
    } else if (!req.query.featured && !req.query.search && !req.query.category) {
      // Only default to available if no other specific filter is provided
      query.status = "available";
    }

    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Category filter
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    // Featured books filter
    if (req.query.featured !== undefined) {
      query.featured = req.query.featured === "true" || req.query.featured === true;
    }

    // Sort options
    let sortBy = {};
    if (req.query.sort === "newest") {
      sortBy.createdAt = -1;
    } else if (req.query.sort === "oldest") {
      sortBy.createdAt = 1;
    } else if (req.query.sort === "rating") {
      sortBy.rating = -1;
    } else if (req.query.sort === "views") {
      sortBy.viewCount = -1;
    } else if (req.query.sort === "title") {
      sortBy.title = 1;
    } else {
      sortBy.featured = -1; // Prioritize featured books
      sortBy.createdAt = -1; // Then newest
    }

    // Pagination - if neither page nor limit is provided, fetch all books (up to 1000) for client-side catalog browsing
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || (hasPagination ? 12 : 1000);
    const skip = (page - 1) * limit;

    const books = await Book.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .populate("addedBy", "fullName username")
      .lean();

    // Check if favorited by user (optional auth)
    let favoritedBookIds = new Set();
    try {
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
      }

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userFavorites = await Favorite.find({ user: decoded.id }).select("book").lean();
        favoritedBookIds = new Set(userFavorites.map(f => f.book.toString()));
      }
    } catch (error) {
      // Ignore token errors
    }

    const booksWithFavorite = books.map(book => ({
      ...book,
      isFavorite: favoritedBookIds.has(book._id.toString()),
      hasPdf: !!book.pdfPath,
      fileUrl: book.pdfPath ? true : null
    }));

    const total = await Book.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        books: booksWithFavorite,
        pagination: {
          page,
          pages: totalPages,
          count: total,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
export const getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id).populate(
      "addedBy",
      "fullName username",
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "الكتاب غير موجود",
      });
    }

    // Update view count
    book.viewCount += 1;
    await book.save();

    // Check if favorited or borrowed by user (optional auth)
    let isFavorite = false;
    let currentBorrow = null;
    try {
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
      }

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const favorite = await Favorite.findOne({
          user: decoded.id,
          book: book._id,
        });
        isFavorite = !!favorite;

        // Check for active borrow
        const borrow = await Borrow.findOne({
          user: decoded.id,
          book: book._id,
          status: { $in: ["approved", "borrowed"] },
          dueDate: { $gt: new Date() },
        });
        currentBorrow = borrow;
      }
    } catch (error) {
      // Ignore token verification errors for public route
    }

    // Get recent reviews for this book
    const recentReviews = await Review.find({
      book: book._id,
      isApproved: true,
    })
      .populate("user", "fullName username profileImage")
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      data: {
        book: {
          ...book.toObject(),
          isFavorite,
          currentBorrow,
          hasPdf: !!book.pdfPath,
          fileUrl: book.pdfPath ? true : null,
        },
        recentReviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new book
// @route   POST /api/books
// @access  Private (Admin/Librarian)
export const createBook = async (req, res, next) => {
  try {
    const {
      title,
      author,
      publisher,
      referenceNumber,
      totalCopies,
      category,
      description,
      publicationYear,
      publishedYear,
      isbn,
      pages,
      language,
      tags,
      featured,
      status,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "عنوان الكتاب مطلوب",
      });
    }

    if (!author || !author.trim()) {
      return res.status(400).json({
        success: false,
        message: "اسم المؤلف مطلوب",
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "فئة الكتاب مطلوبة",
      });
    }

    // Generate referenceNumber if missing or empty
    let refNum = referenceNumber && referenceNumber.trim();
    if (!refNum) {
      const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
      refNum = `REF-${Date.now()}-${randomPart}`;
    } else {
      refNum = refNum.toUpperCase();
    }

    // Ensure uniqueness
    const existingBook = await Book.findOne({ referenceNumber: refNum });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: "الرقم المرجعي مستخدم مسبقاً",
      });
    }

    // Handle cover image upload (supports req.files.coverImage or req.file)
    let coverImage = null;
    if (req.files && req.files.coverImage && req.files.coverImage[0]) {
      coverImage = `/uploads/books/${req.files.coverImage[0].filename}`;
    } else if (req.file && req.file.fieldname === 'coverImage') {
      coverImage = `/uploads/books/${req.file.filename}`;
    }

    // Handle PDF upload (protected books directory)
    let pdfPath = null;
    if (req.files && req.files.pdfFile && req.files.pdfFile[0]) {
      pdfPath = `protected/books/${req.files.pdfFile[0].filename}`;
    } else if (req.file && req.file.fieldname === 'pdfFile') {
      pdfPath = `protected/books/${req.file.filename}`;
    }

    // Parse copies
    const parsedTotalCopies = totalCopies ? Math.max(1, parseInt(totalCopies, 10)) : 1;

    // Parse year (supports publishedYear from form or publicationYear)
    const yearVal = publicationYear || publishedYear;
    const parsedYear = yearVal ? parseInt(yearVal, 10) : new Date().getFullYear();

    // Parse pages safely (avoid CastError on empty strings or 0)
    const parsedPages = pages && Number(pages) > 0 ? parseInt(pages, 10) : undefined;

    // Publisher fallback
    const finalPublisher = (publisher && publisher.trim()) || "غير محدد";

    // Tags array parsing
    let parsedTags = [];
    if (typeof tags === 'string' && tags.trim()) {
      parsedTags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    } else if (Array.isArray(tags)) {
      parsedTags = tags.map(tag => typeof tag === 'string' ? tag.trim() : tag).filter(Boolean);
    }

    const isFeatured = featured === true || featured === 'true';

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      publisher: finalPublisher,
      referenceNumber: refNum,
      coverImage,
      pdfPath,
      totalCopies: parsedTotalCopies,
      availableCopies: parsedTotalCopies,
      category: category.trim(),
      description: description ? description.trim() : "",
      publicationYear: parsedYear,
      isbn: isbn && isbn.trim() ? isbn.trim() : undefined,
      pages: parsedPages,
      language: language || "العربية",
      tags: parsedTags,
      featured: isFeatured,
      status: status || "available",
      addedBy: req.user.id,
    });

    const populatedBook = await Book.findById(book._id).populate(
      "addedBy",
      "fullName username",
    );

    res.status(201).json({
      success: true,
      message: "تم إضافة الكتاب بنجاح",
      data: populatedBook,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private (Admin/Librarian)
export const updateBook = async (req, res, next) => {
  try {
    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "الكتاب غير موجود",
      });
    }

    const updateData = { ...req.body };

    // Clean updateData from invalid string/object representations sent from client
    if (updateData.coverImage && (typeof updateData.coverImage === 'object' || updateData.coverImage === 'null' || updateData.coverImage === 'undefined')) {
      delete updateData.coverImage;
    }
    if (updateData.pdfPath && (typeof updateData.pdfPath === 'object' || updateData.pdfPath === 'null' || updateData.pdfPath === 'undefined')) {
      delete updateData.pdfPath;
    }

    // Handle cover image upload
    if (req.files && req.files.coverImage && req.files.coverImage[0]) {
      updateData.coverImage = `/uploads/books/${req.files.coverImage[0].filename}`;
    } else if (req.file && req.file.fieldname === 'coverImage') {
      updateData.coverImage = `/uploads/books/${req.file.filename}`;
    }

    // Handle PDF upload
    if (req.files && req.files.pdfFile && req.files.pdfFile[0]) {
      updateData.pdfPath = `protected/books/${req.files.pdfFile[0].filename}`;
    } else if (req.file && req.file.fieldname === 'pdfFile') {
      updateData.pdfPath = `protected/books/${req.file.filename}`;
    }

    // Handle publicationYear from publishedYear alias
    if (!updateData.publicationYear && updateData.publishedYear) {
      updateData.publicationYear = parseInt(updateData.publishedYear, 10);
    }
    if (updateData.publicationYear) {
      updateData.publicationYear = parseInt(updateData.publicationYear, 10);
    }

    // Handle pages safely
    if (updateData.pages !== undefined) {
      if (updateData.pages === "" || Number(updateData.pages) <= 0) {
        delete updateData.pages;
      } else {
        updateData.pages = parseInt(updateData.pages, 10);
      }
    }

    // Handle tags if provided as string
    if (updateData.tags && typeof updateData.tags === "string") {
      updateData.tags = updateData.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
    }

    // Handle featured toggle boolean
    if (updateData.featured !== undefined) {
      updateData.featured = updateData.featured === true || updateData.featured === 'true';
    }

    // Handle copies logic
    if (updateData.totalCopies !== undefined) {
      const newTotal = parseInt(updateData.totalCopies, 10);
      const diff = newTotal - book.totalCopies;
      updateData.totalCopies = newTotal;
      updateData.availableCopies = book.availableCopies + diff;

      if (updateData.availableCopies < 0) {
        return res.status(400).json({
          success: false,
          message: "لا يمكن تقليل عدد النسخ الإجمالي لأقل من الكتب المستعارة حالياً",
        });
      }
    }

    // Check unique referenceNumber if modified
    if (updateData.referenceNumber && updateData.referenceNumber.trim().toUpperCase() !== book.referenceNumber) {
      const formattedRef = updateData.referenceNumber.trim().toUpperCase();
      const existingRef = await Book.findOne({
        referenceNumber: formattedRef,
        _id: { $ne: book._id },
      });
      if (existingRef) {
        return res.status(400).json({
          success: false,
          message: "الرقم المرجعي مستخدم مسبقاً لكتاب آخر",
        });
      }
      updateData.referenceNumber = formattedRef;
    }

    book = await Book.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("addedBy", "fullName username");

    res.status(200).json({
      success: true,
      message: "تم تحديث بيانات الكتاب بنجاح",
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private (Admin)
export const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "الكتاب غير موجود",
      });
    }

    const activeBorrows =
      await Borrow.countDocuments({
        book: book._id,
        status: { $in: ["pending", "approved", "borrowed"] },
      });

    if (activeBorrows > 0) {
      return res.status(400).json({
        success: false,
        message: "لا يمكن حذف الكتاب لوجود طلبات استعارة نشطة",
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "تم حذف الكتاب بنجاح",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get book statistics
// @route   GET /api/books/stats
// @access  Private (Admin/Librarian)
export const getBookStats = async (req, res, next) => {
  try {
    const stats = await Book.aggregate([
      {
        $group: {
          _id: null,
          totalBooks: { $sum: "$totalCopies" },
          availableBooks: { $sum: "$availableCopies" },
          borrowedBooks: { $subtract: ["$totalCopies", "$availableCopies"] },
        },
      },
    ]);

    const categoryStats = await Book.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: "$totalCopies" },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const recentBooks = await Book.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title author category createdAt");

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalBooks: 0,
          availableBooks: 0,
          borrowedBooks: 0,
        },
        categories: categoryStats,
        recentBooks,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  getBookStats,
};
