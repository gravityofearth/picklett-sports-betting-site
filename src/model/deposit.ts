import mongoose from "mongoose";
const depositSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    sender: {
        type: String,
        required: true,
        match: [/^0x[0-9a-fA-F]{40}$/, 'Invalid Ethereum Address']
    },
    depositAmount: {
        type: Number,
        required: false,
    },
    dedicatedWallet: {
        type: String,
        required: true,
        match: [/^0x[0-9a-fA-F]{40}$/, 'Invalid Ethereum Address']
    },
    tx: {
        type: String,
        required: true,
        match: [/^(0x[0-9a-fA-F]{64}|undefined)$/, 'Invalid Ethereum Transaction']
    },
    result: {
        type: String,
        required: true,
        enum: ["initiated", "verifying", "failed", "success"],
    },
    reason: String,
    blockTimestampAtCreated: {
        type: String,
        required: true,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt
});

const depositModel = mongoose.models.Deposit || mongoose.model("Deposit", depositSchema);
export default depositModel;
