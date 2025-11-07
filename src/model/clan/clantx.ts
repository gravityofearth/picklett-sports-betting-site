import mongoose, { Schema } from "mongoose";
import { setSchemaLean } from "..";
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
    timestamp: {
        type: Number,
        index: true,
    },
    cofferBefore: Number,
    cofferAfter: Number,
});

setSchemaLean(clanTxSchema)
const clanTxModel = mongoose.models.ClanTx || mongoose.model("ClanTx", clanTxSchema);
export default clanTxModel;
