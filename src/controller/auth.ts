import { JWT_SECRET } from "@/utils";
import jwt from "jsonwebtoken"
export const signToken = (user: any) => {
    return jwt.sign({ username: user.username, balance: user.balance, role: user.role }, JWT_SECRET, {
        expiresIn: "7d",
    });
};