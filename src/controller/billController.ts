import type { Request, Response } from "express";
import { prisma } from "../config/db.js";

const createBill = async (
    req: Request<{ groupId: string }>,
    res: Response
) => {
    const { groupId } = req.params;
    const { paidById } = req.body;

    // 1. Cari group
    const group = await prisma.group.findUnique({
        where: {
            id: groupId
        }
    });

    if (!group) {
        return res.status(404).json({
            error: "Group not found"
        });
    }

    // 2. Cek apakah user yang membayar adalah member group
    const payer = await prisma.groupMember.findFirst({
        where: {
            groupId,
            userId: paidById
        }
    });

    if (!payer) {
        return res.status(400).json({
            error: "Payer is not a member of this group"
        });
    }

    // 3. Cek apakah group sudah punya bill
    const existingBill = await prisma.bill.findUnique({
        where: {
            groupId
        }
    });

    if (existingBill) {
        return res.status(400).json({
            error: "This group already has a bill"
        });
    }

    // 4. Buat bill
    const bill = await prisma.bill.create({
        data: {
            groupId,
            paidById,
            total: 0
        }
    });

    res.status(201).json({
        status: "success",
        data: {
            bill
        }
    });
};

const addBillItem = async (
    req: Request<{ billId: string }>,
    res: Response
) => {
    const { billId } = req.params;
    const { name, price } = req.body;

    const bill = await prisma.bill.findUnique({
        where: {
            id: billId
        }
    });

    if (!bill) {
        return res.status(404).json({
            error: "Bill not found"
        });
    }

    const billItem = await prisma.billItem.create({
        data: {
            billId,
            name,
            price
        }
    });

    res.status(201).json({
        status: "success",
        data: {
            billItem
        }
    });
};

export { createBill, addBillItem };