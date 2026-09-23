import express from "express";
import { addBillItem, confirmBillItems, createBill, getBillDetail } from "../controller/billController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:groupId/bill", authMiddleware, createBill);
router.post("/:billId/items", authMiddleware, addBillItem);
router.post("/:billId/items/confirm", authMiddleware, confirmBillItems);
router.get("/:billId/bill", authMiddleware, getBillDetail);

export default router;