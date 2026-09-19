import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";
import type { NextFunction, Request, Response } from "express";

interface MyJwtPayload {
    id: string;
}

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return res
            .status(401)
            .json({ error: "Not Authorized, No Token Provided" });
    }

    try {
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error("JWT_SECRET is not defined");
        }

        // Verify Token and Extract User ID
        const decoded = jwt.verify(token, secret) as MyJwtPayload;

        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user) {
            return res
                .status(401)
                .json({ error: "User no longer exist" });
        }

        req.user = user;

        next();
    } catch (error) {
        return res
            .status(401)
            .json({ error: "Not Authorized, token failed" });
    }
};