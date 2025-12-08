import mongoose from "mongoose";
import { setSchemaLean } from ".";
const betSchema = new mongoose.Schema({
    username: {
        type: String,
        index: true,
    },
    lineId: mongoose.Schema.Types.ObjectId,
    num: String,
    description: String,
    oddsName: String,
    point: String,
    team_total_point: Number,
    value: Number,
    index: Number,
    amount: Number,
    result: {
        type: String,
        enum: ['pending', 'win', 'lose', 'draw', 'cancelled'],
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt
});
betSchema.index({ lineId: 1, num: 1, oddsName: 1, point: 1, team_total_point: 1 })
betSchema.index({ updatedAt: 1 })
betSchema.index({ createdAt: 1 })
setSchemaLean(betSchema)
const betModel = mongoose.models.Bet || mongoose.model("Bet", betSchema);
export default betModel;
