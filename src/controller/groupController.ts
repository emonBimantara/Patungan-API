import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { stringify } from "node:querystring";

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

const getMyGroups = async (
    req: Request,
    res: Response
) => {
    const groups = await prisma.groupMember.findMany({
        where: { userId: req.user.id },
        include: {
            group: {
                include: {
                    groupMembers: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    const formattedGroups = groups.map((item) => ({
        id: item.group.id,
        name: item.group.name,
        members: item.group.groupMembers.map((member) => ({
            id: member.user.id,
            name: member.user.name,
            email: member.user.email
        }))
    }));

    res.status(200).json({
        status: "Success",
        data: { groups: formattedGroups }
    })
}

const getGroupDetail = async (
    req: Request<{ groupId: string }>,
    res: Response
) => {
    const { groupId } = req.params
    const user = req.user

    // Apakah user merupakan member group ini?
    const membership = await prisma.groupMember.findFirst({
        where: {
            groupId,
            userId: user.id
        }
    })

    if (!membership) {
        return res.status(403).json({ error: "You ain't a member of this group" })
    }

    // Ambil detail group
    const group = await prisma.group.findUnique({
        where: {
            id: groupId
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            groupMembers: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            },
            bill: true
        }
    })

    if (!group) {
        return res.status(404).json({ error: "Group not found" });
    }

    return res.status(200).json({
        status: "success",
        data: {
            group
        }
    });
}

export { createGroup, addMember, getGroupMembers, getMyGroups, getGroupDetail }