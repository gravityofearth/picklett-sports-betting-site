import mongoose from "mongoose";
import { setSchemaLean } from ".";
const lineSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    event: {
        type: String,
        required: true,
    },
    eventId: {
        type: String,
    },
    oddsId: {
        type: String,
    },
    league: {
        type: String,
        required: true,
    },
    sports: {
        type: String,
        required: true,
    },
    yes: {
        type: Number,
        required: true,
    },
    no: {
        type: Number,
        required: true,
    },
    endsAt: {
        type: Number,
        required: true,
    },
    result: {
        type: String,
        required: true,
        enum: ['pending', 'yes', 'no'],
        index: true,
    },
    openedBy: {
        type: String,
        required: true,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt
});

setSchemaLean(lineSchema)
const lineModel = mongoose.models.Line || mongoose.model("Line", lineSchema);
export default lineModel;
