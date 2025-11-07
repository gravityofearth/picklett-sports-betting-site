import mongoose, { Schema } from "mongoose";
import { setSchemaLean } from "..";
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
        betIds: [Schema.Types.ObjectId],
    }],
    startsAt: Number,
    minMembers: Number,
    rewarded: String
})
clanWarSchema.index({ "clans.clanId": 1 }) // clanwars.find({"clans.clanId": someClanId}) 
clanWarSchema.index({ startsAt: 1 })

setSchemaLean(clanWarSchema)
const clanWarModel = mongoose.models.ClanWar || mongoose.model("ClanWar", clanWarSchema);
export default clanWarModel;

