import mongoose from "mongoose";
const withdrawSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    network: {
        type: String,
        required: true,
    },
    address: {
        type: String,
    },
    lockedPrice: {
        type: Number,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    result: {
        type: String,
        required: true,
        enum: ["pending", "failed", "success"],
    },
    reason: String,
    tx: {
        type: String,
        required: true,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt
});

const withdrawModel = mongoose.models.Withdraw || mongoose.model("Withdraw", withdrawSchema);
export default withdrawModel;
