import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs"
import type { Request, Response } from "express";
import { generateToken } from "../utils/generateToken.js";

const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body

    // User Already Exist?
    const userExist = await prisma.user.findUnique({
        where: { email: email }
    })

    if (userExist) {
        return res
            .status(400)
            .json({ error: "User already exist with this email" })
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create User
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        }
    })

    // Generate JWT Token
    const token = generateToken(user.id, res)

    res.status(201).json({
        status: "success",
        data: {
            user: {
                id: user.id,
                name: name,
                email: email,
            }
        }
    })
}

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body

    // Check if user email exist in the table
    const user = await prisma.user.findUnique({
        where: { email: email }
    })

    if (!user) {
        return res
            .status(401)
            .json({ error: "Invalid Email" })
    }

    // Verify Password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res
            .status(401)
            .json({ error: "Invalid Password" })
    }

    // Generate JWT Token
    const token = generateToken(user.id, res)

    res.status(201).json({
        status: "success",
        data: {
            user: {
                id: user.id,
                email: email,
            },
            token
        }
    })
}

const logout = async (req: Request, res: Response) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0)
    })
    res.status(200).json({
        status: "success",
        message: "Logged out succesfully"
    })
}

export { register, login, logout }