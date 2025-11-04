import mongoose, { Schema } from "mongoose";
const clanTxSchema = new mongoose.Schema({
    clanId: {
        type: Schema.Types.ObjectId,
        index: true,
    },
    username: String,
    warId: Schema.Types.ObjectId,
    amount: Number,
    type: {
        type: String,
        enum: ['deposit', 'tax', 'distribute', 'stake', 'prize'],
    },
    timestamp: Number,
});

const clanTxModel = mongoose.models.ClanTx || mongoose.model("ClanTx", clanTxSchema);
export default clanTxModel;
