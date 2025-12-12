import mongoose from "mongoose";
import { setSchemaLean } from ".";
const childSchema = new mongoose.Schema({
    unit: String,
    eventId: String,
}, { _id: false });
const lineSchema = new mongoose.Schema({
    eventId: {
        type: String,
        index: true,
    },
    children: [childSchema],
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
    /* ODDS */
    odds_regular: String,
    odds_sets: String,
    odds_corners: String,
    odds_games: String,
    odds_points: String,
    odds_bookings: String,
    odds_daily_total: String,
}, {
    timestamps: true, // Adds createdAt and updatedAt
});
lineSchema.index({ status: 1, sports: 1, startsAt: 1 })
lineSchema.index({ startsAt: 1 })
setSchemaLean(lineSchema)
const lineModel = mongoose.models.Line || mongoose.model("Line", lineSchema);
export default lineModel;
