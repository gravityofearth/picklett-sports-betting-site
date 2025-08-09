import mongoose from "mongoose";
const balanceTransactionSchema = new mongoose.Schema({
    username: { type: String, required: true, index: true },
    type: {
        type: String,
        required: true,
        enum: ['bet_placed', 'bet_win', 'bet_loss', 'deposit', 'withdraw', 'refund']
    },
    amount: { type: Number, required: true }, // Positive for credits, negative for debits
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    betId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bet' },
    depositId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deposit' },
    withdrawId: { type: mongoose.Schema.Types.ObjectId, ref: 'Withdraw' },
    lineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Line' },
    timestamp: { type: Date, default: Date.now },
    description: String,
});

const balanceTransactionModel = mongoose.models.BalanceTransaction || mongoose.model('BalanceTransaction', balanceTransactionSchema)
export default balanceTransactionModel;
