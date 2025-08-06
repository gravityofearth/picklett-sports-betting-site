import mongoose from "mongoose";
const betSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    lineId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    side: {
        type: String,
        required: true,
        enum: ['yes', 'no'],
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'win', 'lose'],
    },


}, {
    timestamps: true, // Adds createdAt and updatedAt
});

const betModel = mongoose.models.Bet || mongoose.model("Bet", betSchema);
export default betModel;
