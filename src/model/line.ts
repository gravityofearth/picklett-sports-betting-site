import mongoose from "mongoose";
import { setSchemaLean } from ".";
const lineSchema = new mongoose.Schema({
    eventId: {
        type: String,
        index: true,
    },
    sports: String,
    leagueId: String,
    leagueName: String,
    home: String,
    away: String,
    startsAt: Number,
    status: {
        type: String,
        enum: ['pending', 'live', 'finished', 'cancelled', 'inactive'],
    },
    odds: String,
}, {
    timestamps: true, // Adds createdAt and updatedAt
});
lineSchema.index({ status: 1, sports: 1, startsAt: 1 })
setSchemaLean(lineSchema)
const lineModel = mongoose.models.Line || mongoose.model("Line", lineSchema);
export default lineModel;
