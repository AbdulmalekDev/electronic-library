import Favorite from "../models/Favorite.js";
import Book from "../models/Book.js";
import mongoose from "mongoose";

// @desc    Toggle book favorite status
// @route   POST /api/favorites/toggle/:bookId
// @access  Private
export const toggleFavorite = async (req, res, next) => {
    try {
        const { bookId } = req.params;

        // Validate if bookId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({
                success: false,
                message: "معرف كتاب غير صالح",
            });
        }

        // Check if book exists
        const book = await Book.findById(bookId).lean();
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "الكتاب غير موجود",
            });
        }

        // Check if favorite exists
        const existingFavorite = await Favorite.findOne({
            user: req.user.id,
            book: bookId,
        });

        if (existingFavorite) {
            // Remove favorite
            await Favorite.findByIdAndDelete(existingFavorite._id);
            return res.status(200).json({
                success: true,
                favorited: false,
                message: "تمت الإزالة من المفضلة",
            });
        } else {
            // Add favorite
            await Favorite.create({
                user: req.user.id,
                book: bookId,
            });
            return res.status(201).json({
                success: true,
                favorited: true,
                message: "تمت الإضافة إلى المفضلة",
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user's favorites
// @route   GET /api/favorites
// @access  Private
export const getMyFavorites = async (req, res, next) => {
    try {
        const favorites = await Favorite.find({ user: req.user.id })
            .populate("book")
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            data: favorites.map((f) => f.book),
        });
    } catch (error) {
        next(error);
    }
};

export default {
    toggleFavorite,
    getMyFavorites,
};
