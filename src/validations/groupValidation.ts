import { z } from "zod";

export const createGroupSchema = z.object({
    name: z.string().trim().min(1, "Group name is required"),
    paymentInfo: z.string().trim().min(1, "Payment Info is required")
})