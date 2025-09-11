import mongoose from "mongoose";
const withdrawSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    wallet: {
        type: String,
    },
    amount: {
        type: Number,
        required: true,
    },
    result: {
        type: String,
        required: true,
        enum: ["requested", "failed", "success"],
    },
    reason: String,
    tx: {
        type: String,
        required: true,
        match: [/^(0x[0-9a-fA-F]{64}|undefined)$/, 'Invalid Ethereum Transaction']
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt
});

const withdrawModel = mongoose.models.Withdraw || mongoose.model("Withdraw", withdrawSchema);
export default withdrawModel;
