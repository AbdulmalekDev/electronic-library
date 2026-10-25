import { Schema, model } from "mongoose";

const favoriteSchema = new Schema(
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
    },
    {
        timestamps: true,
    }
);

// Unique compound index on user and book to prevent duplicates
favoriteSchema.index({ user: 1, book: 1 }, { unique: true });

// Individual indexes for performance
favoriteSchema.index({ user: 1 });
favoriteSchema.index({ book: 1 });

export default model("Favorite", favoriteSchema);
