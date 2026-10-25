import { Schema, model } from "mongoose";

const libraryInfoSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "العنوان مطلوب"],
      trim: true,
      maxlength: [200, "العنوان يجب ألا يزيد عن 200 حرف"],
    },
    content: {
      type: String,
      required: [true, "المحتوى مطلوب"],
      maxlength: [2000, "المحتوى يجب ألا يزيد عن 2000 حرف"],
    },
    type: {
      type: String,
      enum: [
        "about",
        "mission",
        "vision",
        "services",
        "rules",
        "contact",
        "general",
      ],
      required: [true, "نوع المحتوى مطلوب"],
    },
    image: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
      min: [0, "الترتيب يجب أن يكون أكبر من أو يساوي صفر"],
    },
    seoTitle: {
      type: String,
      maxlength: [60, "عنوان SEO يجب ألا يزيد عن 60 حرف"],
    },
    seoDescription: {
      type: String,
      maxlength: [160, "وصف SEO يجب ألا يزيد عن 160 حرف"],
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
libraryInfoSchema.index({ type: 1 });
libraryInfoSchema.index({ isActive: 1 });
libraryInfoSchema.index({ order: 1 });

export default model("LibraryInfo", libraryInfoSchema);
