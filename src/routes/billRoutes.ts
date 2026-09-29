import express from "express";
import {
    addBillItem,
    confirmBillItems,
    createBill,
    getBillDetail,
    getBillSummary
} from "../controller/billController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { createBillSchema } from "../validations/groupValidation.js";

const router = express.Router();

router.post("/:groupId/bill", authMiddleware, validate(createBillSchema), createBill);
router.post("/:billId/items", authMiddleware, addBillItem);
router.post("/:billId/items/confirm", authMiddleware, confirmBillItems);
router.get("/:billId/bill", authMiddleware, getBillDetail);
router.get("/:billId/summary", authMiddleware, getBillSummary);

export default router;