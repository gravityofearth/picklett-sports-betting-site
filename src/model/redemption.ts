import mongoose from "mongoose";
const redemptionSchema = new mongoose.Schema({
    username: {
        type: String,
        required: false,
    },
    amount: {
        type: Number,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'redeemed'],
    },


}, {
    timestamps: true, // Adds createdAt and updatedAt
});

const redemptionModel = mongoose.models.Redemption || mongoose.model("Redemption", redemptionSchema);
export default redemptionModel;
