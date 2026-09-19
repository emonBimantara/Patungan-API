import express from "express";
import { addMember, createGroup } from "../controller/groupController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createGroup);
router.post("/:groupId/members", authMiddleware, addMember);

export default router;