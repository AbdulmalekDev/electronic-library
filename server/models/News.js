import { Schema, model } from "mongoose";

const newsSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "عنوان الخبر مطلوب"],
      trim: true,
      maxlength: [200, "عنوان الخبر يجب ألا يزيد عن 200 حرف"],
    },
    content: {
      type: String,
      required: [true, "محتوى الخبر مطلوب"],
      maxlength: [2000, "محتوى الخبر يجب ألا يزيد عن 2000 حرف"],
    },
    summary: {
      type: String,
      maxlength: [300, "ملخص الخبر يجب ألا يزيد عن 300 حرف"],
    },
    image: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: ["announcement", "event", "maintenance", "new_books", "general"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedDate: {
      type: Date,
      default: null,
    },
    expireDate: {
      type: Date,
      default: null,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [30, "الوسم يجب ألا يزيد عن 30 حرف"],
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
newsSchema.index({ isPublished: 1, publishedDate: -1 });
newsSchema.index({ category: 1 });
newsSchema.index({ priority: 1 });
newsSchema.index({ createdAt: -1 });

// Auto-populate creator/updater
newsSchema.pre(/^find/, function (next) {
  this.populate({
    path: "createdBy",
    select: "fullName username role",
  }).populate({
    path: "updatedBy",
    select: "fullName username role",
  });
  next();
});

export default model("News", newsSchema);
