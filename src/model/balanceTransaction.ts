import mongoose from "mongoose";
import { setSchemaLean } from ".";
const balanceTransactionSchema = new mongoose.Schema({
    username: { type: String, required: true, index: true },
    type: {
        type: String,
        required: true,
        enum: ['bet_placed', 'bet_win', 'deposit', 'withdraw', "sweep", 'redeem', 'winstreak_reward', "affiliate_reward", "clan_created", "clan_deposit", "clan_distribute"]
    },
    amount: { type: Number, required: true }, // Positive for credits, negative for debits
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    clanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clan' },
    betId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bet' },
    depositId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deposit' },
    withdrawId: { type: mongoose.Schema.Types.ObjectId, ref: 'Withdraw' },
    lineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Line' },
    redemptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Redemption' },
    timestamp: { type: Date, default: Date.now },
    description: String,
});

setSchemaLean(balanceTransactionSchema)
const balanceTransactionModel = mongoose.models.BalanceTransaction || mongoose.model('BalanceTransaction', balanceTransactionSchema)
export default balanceTransactionModel;
