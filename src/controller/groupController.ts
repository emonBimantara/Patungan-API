import type { Request, Response } from "express";
import { prisma } from "../config/db.js";

const createGroup = async (req: Request, res: Response) => {
    const { name } = req.body

    const group = await prisma.group.create({
        data: {
            name,
            createdById: req.user.id
        }
    })

    await prisma.groupMember.create({
        data: {
            userId: req.user.id,
            groupId: group.id
        }
    })

    res.status(201).json({
        status: "success",
        data: {
            group
        }
    })
}

export { createGroup }