import mongoose from "mongoose";
const clanSchema = new mongoose.Schema({
    title: String,
    ownerUserName: String,
    description: String,
    icon: String,
    coffer: Number,
    xp: Number,
    level: Number,
    wins: Number,
    bets: Number,
});

const clanModel = mongoose.models.Clan || mongoose.model("Clan", clanSchema);
export default clanModel;
