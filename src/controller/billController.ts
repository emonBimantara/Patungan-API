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

    // 2.1 Cek apakah requester adalah member group
    const membership = await prisma.groupMember.findFirst({
        where: {
            groupId,
            userId: req.user.id
        }
    });

    if (!membership) {
        return res.status(403).json({
            error: "You are not a member of this group"
        });
    }

    // 2.2 Cek apakah user yang membayar adalah member group
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
        },
        include: {
            group: {
                include: {
                    groupMembers: true
                }
            }
        }
    });

    if (!bill) {
        return res.status(404).json({
            error: "Bill not found"
        });
    }

    const isMember = bill.group.groupMembers.some(
        (member) => member.userId === req.user.id
    );

    if (!isMember) {
        return res.status(403).json({
            error: "You are not a member of this group"
        });
    }

    const billItem = await prisma.billItem.create({
        data: {
            billId,
            name,
            price
        }
    });

    const updatedBill = await prisma.bill.update({
        where: {
            id: billId
        },
        data: {
            total: {
                increment: price
            }
        }
    });

    return res.status(201).json({
        status: "success",
        data: {
            billItem,
            total: updatedBill.total
        }
    });
};

const confirmBillItems = async (
    req: Request<{ billId: string }>,
    res: Response
) => {
    // Ambil ID bill dari URL
    const { billId } = req.params;

    // Ambil daftar item yang dipilih dari request body
    const { itemIds } = req.body;

    // User diambil dari authMiddleware, bukan dari request body
    // supaya user tidak bisa mengaku sebagai user lain
    const user = req.user;

    // Pastikan bill yang dimaksud benar-benar ada
    const bill = await prisma.bill.findUnique({
        where: {
            id: billId
        },
        include: {
            group: {
                select: {
                    paymentInfo: true,
                    groupMembers: true
                }
            }
        }
    });

    if (!bill) {
        return res.status(404).json({
            error: "Bill not found"
        });
    }

    const isMember = bill.group.groupMembers.some(
        (member) => member.userId === user.id
    );

    if (!isMember) {
        return res.status(403).json({
            error: "You are not a member of this group"
        });
    }

    // Cari semua BillItem yang dipilih
    // sekaligus memastikan item-item tersebut memang milik bill ini
    const items = await prisma.billItem.findMany({
        where: {
            id: {
                in: itemIds
            },
            billId
        }
    });

    // Pastikan semua item yang dikirim memang ditemukan
    if (items.length !== itemIds.length) {
        return res.status(400).json({
            error: "One or more items are invalid"
        });
    }

    // Buat selection untuk setiap item yang dipilih oleh user
    const selections = await prisma.billItemSelection.createMany({
        data: itemIds.map((itemId: string) => ({
            billItemId: itemId,
            userId: user.id
        })),
        skipDuplicates: true
    });

    return res.status(201).json({
        status: "success",
        data: {
            selections
        }
    });
};

const getBillDetail = async (
    req: Request<{ billId: string }>,
    res: Response
) => {
    // Ambil ID bill dari URL
    const { billId } = req.params;

    // Cari bill sekaligus semua item dan selection-nya
    const bill = await prisma.bill.findUnique({
        where: {
            id: billId
        },
        include: {
            group: {
                include: {
                    groupMembers: true
                }
            },
            items: {
                include: {
                    selections: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                }
            },
            paidBy: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    // Kalau bill tidak ditemukan
    if (!bill) {
        return res.status(404).json({
            error: "Bill not found"
        });
    }

    const isMember = bill.group.groupMembers.some(
        (member) => member.userId === req.user.id
    );

    if (!isMember) {
        return res.status(403).json({
            error: "You are not a member of this group"
        });
    }

    return res.status(200).json({
        status: "success",
        data: {
            bill
        }
    });
};

const getBillSummary = async (
    req: Request<{ billId: string }>,
    res: Response
) => {
    // Ambil ID bill dari URL
    const { billId } = req.params;

    // User diambil dari authMiddleware
    const user = req.user;

    // Cari bill sekaligus item dan selection milik user ini
    const bill = await prisma.bill.findUnique({
        where: {
            id: billId
        },
        include: {
            group: {
                include: {
                    groupMembers: true
                }
            },
            items: {
                include: {
                    selections: {
                        where: {
                            userId: user.id
                        }
                    }
                }
            }
        }
    });

    // Pastikan bill ada
    if (!bill) {
        return res.status(404).json({
            error: "Bill not found"
        });
    }

    const isMember = bill.group.groupMembers.some(
        (member) => member.userId === user.id
    );

    if (!isMember) {
        return res.status(403).json({
            error: "You are not a member of this group"
        });
    }

    // Ambil hanya item yang dipilih oleh user
    const selectedItems = bill.items.filter(
        (item) => item.selections.length > 0
    );

    // Hitung total harga item yang dipilih
    const total = selectedItems.reduce(
        (sum, item) => sum + Number(item.price),
        0
    );

    return res.status(200).json({
        status: "success",
        data: {
            items: selectedItems,
            total
        }
    });
};

export { createBill, addBillItem, confirmBillItems, getBillDetail, getBillSummary };