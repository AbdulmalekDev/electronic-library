import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "المستخدم مطلوب"],
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: [true, "الكتاب مطلوب"],
    },
    rating: {
      type: Number,
      required: [true, "التقييم مطلوب"],
      min: [1, "التقييم يجب أن يكون أكبر من أو يساوي 1"],
      max: [5, "التقييم يجب أن يكون أقل من أو يساوي 5"],
    },
    comment: {
      type: String,
      maxlength: [500, "التعليق يجب ألا يزيد عن 500 حرف"],
    },
    isVerified: {
      type: Boolean,
      default: false, // تأكيد أن المستخدم استعار الكتاب
    },
    isApproved: {
      type: Boolean,
      default: false, // للمراجعة والموافقة من المشرف
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
    reported: {
      count: {
        type: Number,
        default: 0,
      },
      reasons: [
        {
          reason: {
            type: String,
            enum: ["spam", "inappropriate", "fake", "offensive", "other"],
          },
          reportedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
          date: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  },
);

// Ensure one review per user per book
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

// Indexes
reviewSchema.index({ book: 1, rating: -1 });
reviewSchema.index({ isApproved: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });

// Virtual for average rating calculation (if needed)
reviewSchema.virtual("averageRating").get(function () {
  // This would typically be calculated with aggregation
  return this.rating;
});

// Auto-populate user info
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "fullName username profileImage",
  });
  next();
});

export default model("Review", reviewSchema);
