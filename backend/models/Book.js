import { Schema, model } from "mongoose";

const bookSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "عنوان الكتاب مطلوب"],
      trim: true,
      maxlength: [200, "عنوان الكتاب يجب ألا يزيد عن 200 حرف"],
    },
    author: {
      type: String,
      required: [true, "اسم المؤلف مطلوب"],
      trim: true,
      maxlength: [100, "اسم المؤلف يجب ألا يزيد عن 100 حرف"],
    },
    publisher: {
      type: String,
      required: [true, "دار النشر مطلوبة"],
      trim: true,
      maxlength: [100, "اسم دار النشر يجب ألا يزيد عن 100 حرف"],
    },
    referenceNumber: {
      type: String,
      required: [true, "الرقم المرجعي مطلوب"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    coverImage: {
      type: String,
      default: null,
    },
    pdfPath: {
      type: String,
      default: null,
    },
    totalCopies: {
      type: Number,
      required: [true, "عدد النسخ مطلوب"],
      min: [0, "عدد النسخ يجب أن يكون أكبر من أو يساوي صفر"],
    },

    availableCopies: {
      type: Number,
      required: true,
      min: [0, "عدد النسخ المتاحة يجب أن يكون أكبر من أو يساوي صفر"],
    },
    category: {
      type: String,
      required: [true, "فئة الكتاب مطلوبة"],
      enum: [
        "أدب",
        "الأدب",
        "تاريخ",
        "التاريخ",
        "علوم",
        "العلوم",
        "تكنولوجيا",
        "التقنية",
        "دين",
        "الدين",
        "فلسفة",
        "الفلسفة",
        "سياسة",
        "اقتصاد",
        "طب",
        "هندسة",
        "فنون",
        "شعر",
        "قصص",
        "الروايات",
        "أخرى",
      ],
    },
    description: {
      type: String,
      maxlength: [1000, "الوصف يجب ألا يزيد عن 1000 حرف"],
    },
    publicationYear: {
      type: Number,
      min: [1000, "سنة النشر غير صحيحة"],
      max: [new Date().getFullYear(), "سنة النشر لا يمكن أن تكون في المستقبل"],
    },
    isbn: {
      type: String,
      trim: true,
      maxlength: [20, "الرقم التسلسلي يجب ألا يزيد عن 20 حرف"],
    },
    pages: {
      type: Number,
      min: [1, "عدد الصفحات يجب أن يكون أكبر من صفر"],
    },
    language: {
      type: String,
      default: "العربية",
      enum: ["العربية", "Arabic", "الإنجليزية", "English", "فرنسية", "French", "ألمانية", "German", "إسبانية", "Spanish", "أخرى", "Other"],
    },
    rating: {
      type: Number,
      min: [0, "التقييم يجب أن يكون أكبر من أو يساوي صفر"],
      max: [5, "التقييم يجب أن يكون أقل من أو يساوي 5"],
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["available", "out_of_stock", "maintenance", "archived"],
      default: "available",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, "الوسم يجب ألا يزيد عن 50 حرف"],
      },
    ],
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better performance
bookSchema.index({ referenceNumber: 1 });
bookSchema.index(
  { title: "text", author: "text", description: "text" },
  { default_language: "none", language_override: "none" },
);
bookSchema.index({ category: 1 });
bookSchema.index({ status: 1 });
bookSchema.index({ featured: 1 });
bookSchema.index({ rating: -1 });
bookSchema.index({ createdAt: -1 });

// Update available copies when total copies changes
bookSchema.pre("save", function (next) {
  if (this.isModified("totalCopies")) {
    const oldTotal =
      this.totalCopies -
      this.modifiedPaths().find((path) => path === "totalCopies") || 0;
    if (oldTotal !== 0) {
      const oldAvailable = this.availableCopies;
      const change = this.totalCopies - oldTotal;
      this.availableCopies = Math.max(0, oldAvailable + change);
    }
  }
  next();
});

// Virtual for borrowing information
bookSchema.virtual("borrowedCopies").get(function () {
  return this.totalCopies - this.availableCopies;
});

export default model("Book", bookSchema);
