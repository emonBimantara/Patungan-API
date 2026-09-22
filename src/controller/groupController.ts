import type { Request, Response } from "express";
import { prisma } from "../config/db.js";

const createGroup = async (req: Request<{ groupId: string }>, res: Response) => {
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

const addMember = async (req: Request, res: Response) => {
    const { userId } = req.body
    const groupId = req.params.groupId as string;

    // Find Group
    const group = await prisma.group.findUnique({
        where: { id: groupId }
    })

    if (!group) {
        return res.status(404).json({ error: "Group Not Found" })
    }

    // Check the request from group creator
    if (group.createdById !== req.user.id) {
        return res.status(403).json({
            error: "You are not allowed to add members to this group"
        });
    }

    // Find user that want to add to group
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        return res.status(404).json({
            error: "User not found"
        });
    }

    // User already exist in group?
    const existingMember = await prisma.groupMember.findFirst({
        where: {
            userId,
            groupId
        }
    });

    if (existingMember) {
        return res.status(400).json({
            error: "User is already a member of this group"
        });
    }

    // Add Member
    const member = await prisma.groupMember.create({
        data: {
            userId,
            groupId
        }
    });

    res.status(201).json({
        status: "success",
        data: {
            member
        }
    });

}

const getGroupMembers = async (
    req: Request<{ groupId: string }>,
    res: Response
) => {
    const groupId = req.params.groupId as string

    const members = await prisma.groupMember.findMany({
        where: { groupId: groupId },
        include: { user: true }
    })

    res.status(200).json({
        status: "success",
        data: {
            members
        }
    })
}
export { createGroup, addMember, getGroupMembers }