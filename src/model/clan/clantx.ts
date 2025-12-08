import mongoose, { Schema } from "mongoose";
import { setSchemaLean } from "..";
const clanTxSchema = new mongoose.Schema({
    clanId: Schema.Types.ObjectId,
    username: String,
    warId: Schema.Types.ObjectId,
    amount: Number,
    type: {
        type: String,
        enum: ['deposit', 'tax', 'distribute', 'stake', 'prize'],
    },
    timestamp: Number,
    cofferBefore: Number,
    cofferAfter: Number,
});
clanTxSchema.index(({ clanId: 1, timestamp: -1 }))
setSchemaLean(clanTxSchema)
const clanTxModel = mongoose.models.ClanTx || mongoose.model("ClanTx", clanTxSchema);
export default clanTxModel;
