import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "غير مصرح لك بالوصول إلى هذا المسار",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "المستخدم المرتبط بهذا الرمز غير موجود",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "تم إلغاء تفعيل هذا الحساب",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "رمز غير صحيح",
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "ليس لديك صلاحية للوصول إلى هذا المسار",
      });
    }
    next();
  };
};

// Check if user owns the resource or is admin
export const authorizeOwnerOrAdmin = (resourceUserField = "user") => {
  return (req, res, next) => {
    const resourceUserId =
      req.body[resourceUserField] ||
      req.params[resourceUserField] ||
      req.resource?.[resourceUserField];

    if (
      req.user.role === "admin" ||
      req.user._id.toString() === resourceUserId.toString()
    ) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "ليس لديك صلاحية للوصول إلى هذا المورد",
    });
  };
};

export default {
  protect,
  authorize,
  authorizeOwnerOrAdmin,
};
