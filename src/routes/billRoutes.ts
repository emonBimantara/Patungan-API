import express from "express";
import { createBill } from "../controller/billController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:groupId/bill", authMiddleware, createBill);

export default router;