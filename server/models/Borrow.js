import { Schema, model } from "mongoose";

const borrowSchema = new Schema(
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
    borrowDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, "تاريخ الإرجاع مطلوب"],
    },
    returnDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "borrowed",
        "returned",
        "overdue",
        "expired",
        "rejected",
        "cancelled",
      ],
      default: "pending",
    },
    canRead: {
      type: Boolean,
      default: true,
    },
    canDownload: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    returnedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    fine: {
      amount: {
        type: Number,
        default: 0,
        min: [0, "قيمة الغرامة يجب أن تكون أكبر من أو تساوي صفر"],
      },
      reason: {
        type: String,
        maxlength: [200, "سبب الغرامة يجب ألا يزيد عن 200 حرف"],
      },
      paid: {
        type: Boolean,
        default: false,
      },
      paidDate: {
        type: Date,
        default: null,
      },
    },
    notes: {
      type: String,
      maxlength: [500, "الملاحظات يجب ألا تزيد عن 500 حرف"],
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    lastReminderDate: {
      type: Date,
      default: null,
    },
    readByAdmin: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  {
    timestamps: true,
  },
);

// Indexes
borrowSchema.index({ user: 1, status: 1 });
borrowSchema.index({ book: 1, status: 1 });
borrowSchema.index({ dueDate: 1 });
borrowSchema.index({ status: 1 });
borrowSchema.index({ borrowDate: -1 });

// Virtual for checking if overdue
borrowSchema.virtual("isOverdue").get(function () {
  if (this.status === "borrowed" && this.dueDate < new Date()) {
    return true;
  }
  return false;
});

// Virtual for days overdue
borrowSchema.virtual("daysOverdue").get(function () {
  if (this.isOverdue) {
    const now = new Date();
    const due = new Date(this.dueDate);
    const diffTime = Math.abs(now - due);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Calculate fine for overdue books
borrowSchema.pre("save", function (next) {
  if (this.isOverdue && this.status === "borrowed") {
    const daysOverdue = this.daysOverdue;
    if (daysOverdue > 0) {
      this.fine.amount = daysOverdue * 2; // 2 units per day
    }
  }
  next();
});

export default model("Borrow", borrowSchema);
