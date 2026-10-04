import { z } from "zod";

export const createGroupSchema = z.object({
    name: z.string().trim().min(1, "Group name is required"),
    paymentInfo: z.string().trim().min(1, "Payment Info is required")
})

export const addGroupMemberSchema = z.object({
    email: z.string().email("Invalid Email")
})

export const createBillSchema = z.object({
    paidById: z.string().uuid("Invalid payer ID")
})

export const addBillItemSchema = z.object({
    name: z.string().trim().min(1, "Item name is required"),
    price: z.number().positive("Price must be greater than 0")
});

export const confirmBillItemsSchema = z.object({
    itemIds: z.array(
        z.string().uuid("Invalid item ID")
    ).min(1, "At least one item is required")
});