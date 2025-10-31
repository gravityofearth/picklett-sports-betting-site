import mongoose from "mongoose";
const clanSchema = new mongoose.Schema({
    title: String,
    ownerUserName: String,
    description: String,
    icon: String,
    coffer: Number,
    xp: Number,
    level: Number,
});

const clanModel = mongoose.models.Clan || mongoose.model("Clan", clanSchema);
export default clanModel;
