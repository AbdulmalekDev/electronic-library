import User from "../models/User.js";

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin/Librarian)
export const getUsers = async (req, res, next) => {
    try {
        const { search, role, status, page = 1, limit = 10 } = req.query;

        let query = {};

        // Search functionality
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        // Filter by role
        if (role && role !== "all") {
            query.role = role;
        }

        // Filter by status
        if (status && status !== "all") {
            query.isActive = status === "active";
        }

        const skip = (page - 1) * limit;

        const users = await User.find(query)
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                users,
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

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin/Librarian)
export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "المستخدم غير موجود",
            });
        }

        // Get user statistics (borrow counts, etc.) if needed
        // const borrowCount = await Borrow.countDocuments({ user: user._id });

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new user (by Admin)
// @route   POST /api/users
// @access  Private (Admin)
export const createUser = async (req, res, next) => {
    try {
        const { fullName, username, email, password, role, phone, job } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "البريد الإلكتروني أو اسم المستخدم مستخدم مسبقاً",
            });
        }

        // Handle profile image upload
        let profileImage = null;
        if (req.file) {
            profileImage = `/uploads/users/${req.file.filename}`;
        }

        const user = await User.create({
            fullName,
            username,
            email,
            password,
            role: role || "user",
            phone,
            job,
            profileImage
        });

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "المستخدم غير موجود",
            });
        }

        // Update user fields
        const fieldsToUpdate = ['fullName', 'username', 'email', 'role', 'phone', 'job', 'isActive', 'borrowLimit'];
        fieldsToUpdate.forEach(field => {
            if (req.body[field] !== undefined) {
                user[field] = req.body[field];
            }
        });

        if (req.body.password) {
            user.password = req.body.password;
        }

        // Handle profile image upload
        if (req.file) {
            user.profileImage = `/uploads/users/${req.file.filename}`;
        }

        await user.save();

        // Convert to object and remove password
        const updatedUser = user.toObject();
        delete updatedUser.password;

        res.status(200).json({
            success: true,
            data: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "المستخدم غير موجود",
            });
        }

        // Prevent deleting self
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "لا يمكنك حذف حسابك الخاص",
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "تم حذف المستخدم بنجاح",
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add book to favorites
// @route   POST /api/users/favorites/:bookId
// @access  Private
export const addToFavorites = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.favorites.includes(req.params.bookId)) {
            user.favorites.push(req.params.bookId);
            await user.save();
        }
        res.status(200).json({ success: true, message: "تمت الإضافة للمفضلة" });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove book from favorites
// @route   DELETE /api/users/favorites/:bookId
// @access  Private
export const removeFromFavorites = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        user.favorites = user.favorites.filter(id => id.toString() !== req.params.bookId);
        await user.save();
        res.status(200).json({ success: true, message: "تم الحذف من المفضلة" });
    } catch (error) {
        next(error);
    }
};

// @desc    Add book to bookmarks
// @route   POST /api/users/bookmarks/:bookId
// @access  Private
export const addToBookmarks = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.bookmarks.includes(req.params.bookId)) {
            user.bookmarks.push(req.params.bookId);
            await user.save();
        }
        res.status(200).json({ success: true, message: "تمت الإضافة للمحفظة" });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove book from bookmarks
// @route   DELETE /api/users/bookmarks/:bookId
// @access  Private
export const removeFromBookmarks = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        user.bookmarks = user.bookmarks.filter(id => id.toString() !== req.params.bookId);
        await user.save();
        res.status(200).json({ success: true, message: "تم الحذف من المحفظة" });
    } catch (error) {
        next(error);
    }
};

export default {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    addToFavorites,
    removeFromFavorites,
    addToBookmarks,
    removeFromBookmarks
};
