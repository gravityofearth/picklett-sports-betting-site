import { JWT_SECRET } from "@/utils";
import jwt from "jsonwebtoken"
export const signToken = (user: any) => {
    return jwt.sign({
        username: user.username,
        balance: user.balance,
        role: user.role,
        ref: user.ref,
        winstreak: user.winstreak,
        fullname: user.fullname,
        oddstype: user.oddstype,
        avatar: user.avatar,
    }, JWT_SECRET, {
        expiresIn: "7d",
    });
};