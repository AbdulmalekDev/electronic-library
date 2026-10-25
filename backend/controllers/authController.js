import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Generate JWT Token
// export  const generateToken = (id) => {
//   return jwt({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRE,
//   });
// };تم استبدال الكود هذا بالكود الاسفل 

export const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
};


// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  console.log('Register request body:', req.body);
  try {
    const { fullName, username, email, password, job } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message:
          userExists.email === email
            ? "البريد الإلكتروني مستخدم مسبقاً"
            : "اسم المستخدم مستخدم مسبقاً",
      });
    }

    // Create user
    const user = await User.create({
      fullName,
      username,
      email,
      password,
      job,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: user.role,
          job: user.job,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { username: rawUsername, password } = req.body;
    const username = rawUsername ? rawUsername.toLowerCase().trim() : '';

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "يرجى إدخال اسم المستخدم وكلمة المرور",
      });
    }

    console.log(`Login attempt for: ${username}`);

    // Check for user
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      console.log(`Login failed for: ${username}`);
      return res.status(401).json({
        success: false,
        message: "بيانات الدخول غير صحيحة",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "تم إلغاء تفعيل هذا الحساب",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: user.role,
          job: user.job,
          profileImage: user.profileImage,
          borrowLimit: user.borrowLimit,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: user.role,
          job: user.job,
          profileImage: user.profileImage,
          borrowLimit: user.borrowLimit,
          notifications: user.notifications,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, job, phone } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.user.id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "البريد الإلكتروني مستخدم مسبقاً",
        });
      }
    }

    const fieldsToUpdate = {};
    if (fullName) fieldsToUpdate.fullName = fullName;
    if (email) fieldsToUpdate.email = email;
    if (job) fieldsToUpdate.job = job;
    if (phone) fieldsToUpdate.phone = phone;

    if (req.file) {
      fieldsToUpdate.profileImage = `/uploads/users/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: user.role,
          job: user.job,
          profileImage: user.profileImage,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");

    // Check current password
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return res.status(400).json({
        success: false,
        message: "كلمة المرور الحالية غير صحيحة",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "تم تغيير كلمة المرور بنجاح",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/auth/notifications/:id/read
// @access  Private
export const markNotificationAsRead = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const notification = user.notifications.id(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "الإشعار غير موجود",
      });
    }

    notification.isRead = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "تم تعليم الإشعار كمقروء",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "لا يوجد مستخدم بهذا البريد الإلكتروني",
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash and set resetToken field
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expiry (10 minutes)
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Mock sending email
    const resetUrl = `${req.protocol}://${req.get(
      "host",
    )}/api/auth/reset-password/${resetToken}`;

    console.log("Password Reset URL:", resetUrl);

    res.status(200).json({
      success: true,
      message: "تم إرسال تعليمات إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
      // In a real app, don't send the token in response
      // But for this demo/project without a real email setup, we can show it or log it
      resetToken: resetToken
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "رمز إعادة التعيين غير صالح أو انتهت صلاحيته",
      });
    }

    // Set new password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "تمت إعادة تعيين كلمة المرور بنجاح",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("notifications");

    const unreadCount = user.notifications.filter((n) => !n.isRead).length;

    res.status(200).json({
      success: true,
      data: {
        notifications: user.notifications.sort(
          (a, b) => b.createdAt - a.createdAt,
        ),
        unreadCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  markNotificationAsRead,
  getNotifications,
  forgotPassword,
  resetPassword,
};
