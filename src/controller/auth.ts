// auth.js - JWT Authentication utilities
import userModel from "@/model/user";
import { JWT_SECRET } from "@/utils";
import jwt from "jsonwebtoken"
// Environment variables (add these to your .env file)
export const signToken = (user: any) => {
    return jwt.sign({ username: user.username, balance: user.balance }, JWT_SECRET, {
        expiresIn: "7d",
    });
};