import Review from "../models/Review.js";
import Book from "../models/Book.js";
import Borrow from "../models/Borrow.js";

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res, next) => {
  try {
    const { bookId, rating, comment } = req.body;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "الكتاب غير موجود",
      });
    }

    // Check if user already reviewed this book
    const existingReview = await Review.findOne({
      user: req.user.id,
      book: bookId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "لقد قمت بمراجعة هذا الكتاب مسبقاً",
      });
    }

    // Check if user actually borrowed the book (for verified review)
    const borrowRecord = await Borrow.findOne({
      user: req.user.id,
      book: bookId,
      status: "returned",
    });

    const review = await Review.create({
      user: req.user.id,
      book: bookId,
      rating,
      comment,
      isVerified: !!borrowRecord,
      isApproved: false, // Reviews need approval
    });

    // Update book's average rating
    const bookReviews = await Review.find({
      book: bookId,
      isApproved: true,
    });

    const totalRating =
      bookReviews.reduce((sum, r) => sum + r.rating, 0) + rating;
    const newRatingCount = bookReviews.length + 1;
    const newAverageRating = totalRating / newRatingCount;

    book.rating = Math.round(newAverageRating * 10) / 10; // Round to 1 decimal
    book.ratingCount = newRatingCount;
    await book.save();

    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "fullName username profileImage",
    );

    res.status(201).json({
      success: true,
      data: populatedReview,
      message:
        "تم إضافة مراجعتك بنجاح. ستظهر بعد المراجعة والموافقة من الإدارة",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a book
// @route   GET /api/reviews/book/:bookId
// @access  Public
export const getBookReviews = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;

    let query = { book: bookId, isApproved: true };
    if (rating) {
      query.rating = parseInt(rating);
    }

    const skip = (page - 1) * limit;

    const reviews = await Review.find(query)
      .populate("user", "fullName username profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    // Get rating distribution
    const ratingStats = await Review.aggregate([
      { $match: { book: bookId, isApproved: true } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        ratingStats,
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

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
export const getMyReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ user: req.user.id })
      .populate("book", "title author coverImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        reviews,
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

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "المراجعة غير موجودة",
      });
    }

    // Check if user owns this review
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "ليس لديك صلاحية تعديل هذه المراجعة",
      });
    }

    const oldRating = review.rating;

    // Update review
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.isApproved = false; // Need re-approval after edit
    await review.save();

    // Update book's average rating if rating changed
    if (rating && rating !== oldRating) {
      const bookReviews = await Review.find({
        book: review.book,
        isApproved: true,
        _id: { $ne: review._id },
      });

      const totalRating =
        bookReviews.reduce((sum, r) => sum + r.rating, 0) + rating;
      const newRatingCount = bookReviews.length + 1;
      const newAverageRating = totalRating / newRatingCount;

      const book = await Book.findById(review.book);
      book.rating = Math.round(newAverageRating * 10) / 10;
      book.ratingCount = newRatingCount;
      await book.save();
    }

    const populatedReview = await Review.findById(review._id)
      .populate("user", "fullName username profileImage")
      .populate("book", "title author");

    res.status(200).json({
      success: true,
      data: populatedReview,
      message: "تم تحديث المراجعة بنجاح",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "المراجعة غير موجودة",
      });
    }

    // Check if user owns this review or is admin
    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "ليس لديك صلاحية حذف هذه المراجعة",
      });
    }

    const bookId = review.book;

    await Review.findByIdAndDelete(req.params.id);

    // Update book's average rating
    const bookReviews = await Review.find({
      book: bookId,
      isApproved: true,
    });

    const book = await Book.findById(bookId);

    if (bookReviews.length > 0) {
      const totalRating = bookReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / bookReviews.length;
      book.rating = Math.round(averageRating * 10) / 10;
      book.ratingCount = bookReviews.length;
    } else {
      book.rating = 0;
      book.ratingCount = 0;
    }

    await book.save();

    res.status(200).json({
      success: true,
      message: "تم حذف المراجعة بنجاح",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews (for admin/librarian)
// @route   GET /api/reviews/admin/all
// @access  Private (Admin/Librarian)
export const getAllReviews = async (req, res, next) => {
  try {
    const { isApproved, book, page = 1, limit = 20 } = req.query;

    let query = {};
    if (isApproved !== undefined) query.isApproved = isApproved === "true";
    if (book) query.book = book;

    const skip = (page - 1) * limit;

    const reviews = await Review.find(query)
      .populate("user", "fullName username email")
      .populate("book", "title author referenceNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        reviews,
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

// @desc    Approve/Reject review (for admin/librarian)
// @route   PUT /api/reviews/admin/:id/approve
// @access  Private (Admin/Librarian)
export const approveReview = async (req, res, next) => {
  try {
    const { isApproved } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "المراجعة غير موجودة",
      });
    }

    const oldApproved = review.isApproved;

    review.isApproved = isApproved;
    await review.save();

    // Update book's average rating only if this is the first approval
    if (isApproved && !oldApproved) {
      const bookReviews = await Review.find({
        book: review.book,
        isApproved: true,
      });

      const totalRating = bookReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / bookReviews.length;

      const book = await Book.findById(review.book);
      book.rating = Math.round(averageRating * 10) / 10;
      book.ratingCount = bookReviews.length;
      await book.save();
    }

    res.status(200).json({
      success: true,
      data: review,
      message: isApproved ? "تم قبول المراجعة" : "تم رفض المراجعة",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report review
// @route   POST /api/reviews/:id/report
// @access  Private
export const reportReview = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "المراجعة غير موجودة",
      });
    }

    // Check if user already reported this review
    const existingReport = review.reported.reasons.find(
      (r) => r.reportedBy.toString() === req.user.id,
    );

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: "لقد أبلغت عن هذه المراجعة مسبقاً",
      });
    }

    review.reported.reasons.push({
      reason,
      reportedBy: req.user.id,
      date: new Date(),
    });

    review.reported.count += 1;
    await review.save();

    res.status(200).json({
      success: true,
      message: "تم إرسال البلاغ بنجاح",
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createReview,
  getBookReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  approveReview,
  reportReview,
};
