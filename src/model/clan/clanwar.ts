import mongoose, { Schema } from "mongoose";
const clanWarSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['24h'],
    },
    prizePool: Number,
    clanStake: Number,
    slots: Number,
    clans: [{
        clanId: Schema.Types.ObjectId,
        members: [String]
    }],
    startsAt: Number,
    minMembers: Number,
})
clanWarSchema.index({ "clans.clanId": 1 }) // clanwars.find({"clans.clanId": someClanId}) 

const clanWarModel = mongoose.models.ClanWar || mongoose.model("ClanWar", clanWarSchema);
export default clanWarModel;

