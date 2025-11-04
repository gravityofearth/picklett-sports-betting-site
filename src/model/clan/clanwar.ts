import mongoose, { Schema } from "mongoose";
const clanWarSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['24h'],
    },
    prize: Number,
    stake: Number,
    slots: Number,
    clans: [{
        clanId: Schema.Types.ObjectId,
        members: [String],
        wins: Number,
        bets: Number,
    }],
    startsAt: Number,
    minMembers: Number,
})
clanWarSchema.index({ "clans.clanId": 1 }) // clanwars.find({"clans.clanId": someClanId}) 
clanWarSchema.index({ startsAt: 1 })

const clanWarModel = mongoose.models.ClanWar || mongoose.model("ClanWar", clanWarSchema);
export default clanWarModel;

