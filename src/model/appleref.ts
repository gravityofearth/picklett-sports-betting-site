import mongoose from "mongoose";
import { setSchemaLean } from ".";
const appleRefSchema = new mongoose.Schema({
    ref: {
        type: String,
        unique: true,
    },
    username: {
        type: String,
    },
    active: Boolean,
    referrees: [{
        username: String,
        deposited: Boolean,
    }],
}, {
    timestamps: true,
});
appleRefSchema.index({ username: 1, "referrees.username": 1, "referrees.deposited": 1 })

setSchemaLean(appleRefSchema)
const appleRefModel = mongoose.models.AppleRef || mongoose.model("AppleRef", appleRefSchema);
export default appleRefModel;