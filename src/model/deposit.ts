import mongoose from "mongoose";
const depositSchema = new mongoose.Schema({
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
    privateKey: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    depositAmount: {
        type: Number,
        required: false,
    },
    lockedPrice: {
        type: Number,
        required: true,
    },
    result: {
        type: String,
        required: true,
        enum: ["initiated", "expired", "confirming", "success"],
    },
    confirmations: {
        type: Number,
        required: true,
    },
    expiresAt: {
        type: Number,
        required: true,
    }
});

const depositModel = mongoose.models.Deposit || mongoose.model("Deposit", depositSchema);
export default depositModel;
