import express from "express";
import { addBillItem, createBill } from "../controller/billController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:groupId/bill", authMiddleware, createBill);
router.post("/:billId/items", authMiddleware, addBillItem);

export default router;