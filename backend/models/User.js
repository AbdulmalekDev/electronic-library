import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "الاسم الكامل مطلوب"],
      trim: true,
      maxlength: [100, "الاسم يجب ألا يزيد عن 100 حرف"],
    },
    username: {
      type: String,
      required: [true, "اسم المستخدم مطلوب"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "اسم المستخدم يجب ألا يقل عن 3 أحرف"],
    },
    email: {
      type: String,
      required: [true, "البريد الإلكتروني مطلوب"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "يرجى إدخال بريد إلكتروني صحيح",
      ],
    },
    password: {
      type: String,
      required: [true, "كلمة المرور مطلوبة"],
      minlength: [6, "كلمة المرور يجب ألا تقل عن 6 أحرف"],
    },
    job: {
      type: String,
      trim: true,
      maxlength: [100, "المهنة يجب ألا تزيد عن 100 حرف"],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, "رقم الهاتف يجب ألا يزيد عن 20 حرف"],
    },
    role: {
      type: String,
      enum: ["user", "admin", "librarian"],
      default: "user",
    },
    profileImage: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    borrowLimit: {
      type: Number,
      default: 3, // عدد الكتب المسموح استعارتها
    },
    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
    bookmarks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
    notifications: [
      {
        type: {
          type: String,
          enum: [
            "borrow_request",
            "borrow_approved",
            "borrow_rejected",
            "return_reminder",
            "book_available",
          ],
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        isRead: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  },
);

// Index for better performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // const bcrypt = require("bcryptjs");
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  // const bcrypt = require("bcryptjs");
  return await bcrypt.compare(candidatePassword, userPassword);
};

export default model("User", userSchema);
