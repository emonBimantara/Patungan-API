import express from "express";
import { createGroup } from "../controller/groupController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createGroup);

export default router;