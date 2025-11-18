import { JWT_SECRET } from "@/utils";
import jwt from "jsonwebtoken"
export const signToken = (user: any) => {
    return jwt.sign({
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        balance: user.balance,
        role: user.role,
        ref: user.ref,
        winstreak: user.winstreak,
        fullname: user.fullname,
        oddstype: user.oddstype,
        avatar: user.avatar,
        clan: user.clan,
    }, JWT_SECRET, {
        expiresIn: "7d",
    });
};