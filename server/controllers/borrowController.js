import Borrow from "../models/Borrow.js";
import Book from "../models/Book.js";
import User from "../models/User.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Create borrow request
// @route   POST /api/borrows
// @access  Private
export const createBorrowRequest = async (req, res, next) => {
  try {
    const { bookId, dueDate } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "الكتاب غير موجود",
      });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: "الكتاب غير متوفر حالياً",
      });
    }

    // Check if user already has a pending or active request for this book
    const existingRequest = await Borrow.findOne({
      user: req.user.id,
      book: bookId,
      status: { $in: ["pending", "approved", "borrowed"] },
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "لديك طلب استعارة نشط لهذا الكتاب",
      });
    }

    // Check user's current borrow limit
    const currentBorrows = await Borrow.countDocuments({
      user: req.user.id,
      status: { $in: ["pending", "approved", "borrowed"] },
    });

    if (currentBorrows >= req.user.borrowLimit) {
      return res.status(400).json({
        success: false,
        message: `تم الوصول للحد الأقصى للاستعارة (${req.user.borrowLimit} كتب)`,
      });
    }

    // Calculate default due date (14 days from now if not provided)
    const finalDueDate = dueDate
      ? new Date(dueDate)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const borrowRequest = await Borrow.create({
      user: req.user.id,
      book: bookId,
      dueDate: finalDueDate,
      status: "pending",
    });

    // Create notification for librarians
    const librarians = await User.find({
      role: { $in: ["admin", "librarian"] },
    });

    for (const librarian of librarians) {
      librarian.notifications.push({
        type: "borrow_request",
        message: `طلب استعارة جديد: "${book.title}" من قبل ${req.user.fullName}`,
        createdAt: new Date(),
      });
      await librarian.save();
    }

    const populatedRequest = await Borrow.findById(borrowRequest._id)
      .populate("user", "fullName username email")
      .populate("book", "title author coverImage");

    res.status(201).json({
      success: true,
      data: populatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's borrow requests
// @route   GET /api/borrows/my-requests
// @access  Private
export const getMyBorrowRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const requests = await Borrow.find(query)
      .populate("book", "title author coverImage availableCopies")
      .populate("approvedBy", "fullName username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Borrow.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        requests,
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

// @desc    Get all borrow requests (for admin/librarian)
// @route   GET /api/borrows
// @access  Private (Admin/Librarian)
export const getAllBorrowRequests = async (req, res, next) => {
  try {
    const { status, user, book, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status === "overdue") {
      // Logic for overdue: currently borrowed and dueDate has passed
      query.status = "borrowed";
      query.dueDate = { $lt: new Date() };
    } else if (status) {
      query.status = status;
    }

    if (user) query.user = user;
    if (book) query.book = book;

    const skip = (page - 1) * limit;

    const requests = await Borrow.find(query)
      .populate("user", "fullName username email")
      .populate("book", "title author coverImage referenceNumber")
      .populate("approvedBy", "fullName username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Borrow.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        requests,
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
// @desc    Update borrow status (Legacy/General)
// @route   PUT /api/borrows/:id/status
// @access  Private (Admin/Librarian)
export const updateBorrowStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const borrowRequest = await Borrow.findById(req.params.id)
      .populate("user", "fullName username email")
      .populate("book", "title availableCopies");

    if (!borrowRequest) {
      return res.status(404).json({
        success: false,
        message: "طلب الاستعارة غير موجود",
      });
    }

    // Check if book is available for approval
    if (status === "approved" && borrowRequest.book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: "الكتاب غير متوفر حالياً",
      });
    }

    borrowRequest.status = status;
    borrowRequest.approvedBy = req.user.id;
    if (notes) borrowRequest.notes = notes;

    if (status === "borrowed") {
      // Update book available copies
      borrowRequest.book.availableCopies -= 1;
      await borrowRequest.book.save();
    }

    await borrowRequest.save();

    // Create notification for user
    const user = await User.findById(borrowRequest.user._id);
    const notificationMessage =
      status === "approved"
        ? `تم قبول طلب استعارة "${borrowRequest.book.title}"`
        : status === "rejected"
          ? `تم رفض طلب استعارة "${borrowRequest.book.title}"`
          : `تم تحديث حالة طلب استعارة "${borrowRequest.book.title}"`;

    user.notifications.push({
      type: status === "approved" ? "borrow_approved" : "borrow_rejected",
      message: notificationMessage,
      createdAt: new Date(),
    });
    await user.save();

    res.status(200).json({
      success: true,
      data: borrowRequest,
      message: `تم ${status === "approved" ? "قبول" : status === "rejected" ? "رفض" : "تحديث"} الطلب بنجاح`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve borrow request
// @route   PUT /api/borrows/:id/approve
// @access  Private (Admin/Librarian)
export const approveBorrow = async (req, res, next) => {
  try {
    const { dueDate, canRead, canDownload, notes } = req.body;

    const borrowRequest = await Borrow.findById(req.params.id)
      .populate("user", "fullName username email")
      .populate("book", "title availableCopies");

    if (!borrowRequest) {
      return res.status(404).json({
        success: false,
        message: "طلب الاستعارة غير موجود",
      });
    }

    if (borrowRequest.status === "approved" || borrowRequest.status === "borrowed") {
      return res.status(400).json({
        success: false,
        message: "تم قبول هذا الطلب مسبقاً",
      });
    }

    // Atomic check and decrement of availableCopies to prevent concurrent borrows exceeding total copies
    const updatedBook = await Book.findOneAndUpdate(
      { _id: borrowRequest.book._id, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { new: true }
    );

    if (!updatedBook) {
      return res.status(400).json({
        success: false,
        message: "الكتاب غير متوفر حالياً أو نفدت النسخ المتاحة",
      });
    }

    borrowRequest.status = "approved";
    borrowRequest.approvedBy = req.user.id;
    borrowRequest.dueDate = dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    borrowRequest.canRead = canRead === 'true' || canRead === true;
    borrowRequest.canDownload = canDownload === 'true' || canDownload === true;
    if (notes) borrowRequest.notes = notes;

    await borrowRequest.save();

    // Create notification for user
    const user = await User.findById(borrowRequest.user._id);
    if (user) {
      user.notifications.push({
        type: "borrow_approved",
        message: `تم قبول طلب استعارة "${borrowRequest.book.title}" - يمكنك الآن القراءة${borrowRequest.canDownload ? " والتحميل" : ""}`,
        createdAt: new Date(),
      });
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: borrowRequest,
      message: "تم قبول الطلب بنجاح وتحديث عدد النسخ المتاحة",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject borrow request
// @route   PUT /api/borrows/:id/reject
// @access  Private (Admin/Librarian)
export const rejectBorrow = async (req, res, next) => {
  try {
    const { notes } = req.body;

    const borrowRequest = await Borrow.findById(req.params.id)
      .populate("user", "fullName username email")
      .populate("book", "title");

    if (!borrowRequest) {
      return res.status(404).json({
        success: false,
        message: "طلب الاستعارة غير موجود",
      });
    }

    borrowRequest.status = "rejected";
    borrowRequest.approvedBy = req.user.id;
    if (notes) borrowRequest.notes = notes;

    await borrowRequest.save();

    // Create notification for user
    const user = await User.findById(borrowRequest.user._id);
    user.notifications.push({
      type: "borrow_rejected",
      message: `تم رفض طلب استعارة "${borrowRequest.book.title}"`,
      createdAt: new Date(),
    });
    await user.save();

    res.status(200).json({
      success: true,
      data: borrowRequest,
      message: "تم رفض الطلب بنجاح",
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to resolve secure PDF path and prevent path traversal
const getSecurePdfFilePath = (storedPdfPath) => {
  if (!storedPdfPath) return null;
  const normalized = storedPdfPath.replace(/^[/\\]+/, '');
  
  // Primary location: backend/protected/books/...
  const backendDir = path.resolve(__dirname, '../');
  const primaryPath = path.resolve(backendDir, normalized);
  if (primaryPath.startsWith(backendDir) && fs.existsSync(primaryPath)) {
    return primaryPath;
  }

  // Secondary location: root directory
  const rootDir = path.resolve(__dirname, '../../');
  const secondaryPath = path.resolve(rootDir, normalized);
  if (secondaryPath.startsWith(rootDir) && fs.existsSync(secondaryPath)) {
    return secondaryPath;
  }

  // Return primary if not found so caller handles 404 cleanly
  return primaryPath.startsWith(backendDir) ? primaryPath : null;
};

// @desc    Get book access (stream/read)
// @route   GET /api/books/:id/access
// @access  Private
export const accessBook = async (req, res, next) => {
  try {
    const borrow = await Borrow.findOne({
      user: req.user.id,
      book: req.params.id,
      status: { $in: ["approved", "borrowed"] },
      dueDate: { $gt: new Date() },
      canRead: true
    }).populate("book");

    if (!borrow || !borrow.book || !borrow.book.pdfPath) {
      return res.status(403).json({
        success: false,
        message: "ليس لديك صلاحية الوصول لهذا الكتاب أو الملف غير متوفر",
      });
    }

    const filePath = getSecurePdfFilePath(borrow.book.pdfPath);

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "ملف الكتاب غير موجود على الخادم",
      });
    }

    res.contentType("application/pdf");
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    next(error);
  }
};

// @desc    Download book
// @route   GET /api/books/:id/download
// @access  Private
export const downloadBook = async (req, res, next) => {
  try {
    const borrow = await Borrow.findOne({
      user: req.user.id,
      book: req.params.id,
      status: { $in: ["approved", "borrowed"] },
      dueDate: { $gt: new Date() },
      canDownload: true
    }).populate("book");

    if (!borrow || !borrow.book || !borrow.book.pdfPath) {
      return res.status(403).json({
        success: false,
        message: "ليس لديك صلاحية تحميل هذا الكتاب",
      });
    }

    const filePath = getSecurePdfFilePath(borrow.book.pdfPath);

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "ملف الكتاب غير موجود على الخادم",
      });
    }

    res.download(filePath, `${borrow.book.title || 'book'}.pdf`);
  } catch (error) {
    next(error);
  }
};

// @desc    Return book
// @route   PUT /api/borrows/:id/return
// @access  Private (Admin/Librarian)
export const returnBook = async (req, res, next) => {
  try {
    const { notes, fine } = req.body;

    const borrowRequest = await Borrow.findById(req.params.id)
      .populate("user", "fullName username")
      .populate("book", "title availableCopies totalCopies");

    if (!borrowRequest) {
      return res.status(404).json({
        success: false,
        message: "طلب الاستعارة غير موجود",
      });
    }

    if (borrowRequest.status !== "borrowed" && borrowRequest.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "يمكن إرجاع الكتب المعارة فقط",
      });
    }

    borrowRequest.status = "returned";
    borrowRequest.returnDate = new Date();
    borrowRequest.returnedTo = req.user.id;

    if (fine) {
      borrowRequest.fine = {
        amount: fine.amount || 0,
        reason: fine.reason || "",
        paid: false,
      };
    }

    if (notes) borrowRequest.notes = notes;

    // Atomically increment available copies without exceeding totalCopies
    await Book.findByIdAndUpdate(borrowRequest.book._id, {
      $inc: { availableCopies: 1 }
    });

    await borrowRequest.save();

    // Create notification for user
    const user = await User.findById(borrowRequest.user._id);
    user.notifications.push({
      type: "return_reminder",
      message: `تم إرجاع كتاب "${borrowRequest.book.title}"${fine ? ` مع غرامة: ${fine.amount}` : ""}`,
      createdAt: new Date(),
    });
    await user.save();

    res.status(200).json({
      success: true,
      data: borrowRequest,
      message: "تم إرجاع الكتاب بنجاح",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel borrow request
// @route   DELETE /api/borrows/:id
// @access  Private
export const cancelBorrowRequest = async (req, res, next) => {
  try {
    const borrowRequest = await Borrow.findById(req.params.id);

    if (!borrowRequest) {
      return res.status(404).json({
        success: false,
        message: "طلب الاستعارة غير موجود",
      });
    }

    // Check if user owns this request
    if (
      borrowRequest.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "ليس لديك صلاحية إلغاء هذا الطلب",
      });
    }

    if (borrowRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "يمكن إلغاء طلبات الاستعارة في مرحلة الانتظار فقط",
      });
    }

    borrowRequest.status = "cancelled";
    await borrowRequest.save();

    res.status(200).json({
      success: true,
      message: "تم إلغاء طلب الاستعارة",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get borrow statistics
// @route   GET /api/borrows/stats
// @access  Private (Admin/Librarian)
export const getBorrowStats = async (req, res, next) => {
  try {
    const stats = await Borrow.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const overdueBooks = await Borrow.countDocuments({
      status: "borrowed",
      dueDate: { $lt: new Date() },
    });

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
        $limit: 5,
      },
      {
        $project: {
          book: {
            title: "$book.title",
            author: "$book.author",
          },
          borrowCount: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusStats: stats,
        overdueBooks,
        popularBooks,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createBorrowRequest,
  getMyBorrowRequests,
  getAllBorrowRequests,
  approveBorrow,
  rejectBorrow,
  updateBorrowStatus,
  returnBook,
  cancelBorrowRequest,
  getBorrowStats,
  accessBook,
  downloadBook,
};
