import mongoose from "mongoose";
import { setSchemaLean } from ".";
const affiliateRewardSchema = new mongoose.Schema({
    startsAt: {
        type: Number,
        required: true,
    },
    endsAt: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: Number,
        required: true,
    },
    referrer: {
        type: String,
        required: true,
    },
    revenue: {
        type: Number,
        required: true,
    },
    earning: {
        type: Number,
        required: true,
    },
    totalBets: {
        type: Number,
        required: true,
    },
    detail: [{
        amount: {
            type: Number,
            required: true,
        },
        referee: {
            type: String,
            required: true,
        }
    }]
});

setSchemaLean(affiliateRewardSchema)
const affiliateRewardModel = mongoose.models.AffiliateReward || mongoose.model('AffiliateReward', affiliateRewardSchema)
export default affiliateRewardModel;
