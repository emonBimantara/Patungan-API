import { z } from "zod";

export const createGroupSchema = z.object({
    name: z.string().trim().min(1, "Group name is required"),
    paymentInfo: z.string().trim().min(1, "Payment Info is required")
})

export const addGroupMemberSchema = z.object({
    userId: z.string().uuid("Invalid User ID")
})

export const createBillSchema = z.object({
    paidById: z.string().uuid("Invalid payer ID")
})