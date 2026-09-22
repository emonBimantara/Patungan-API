import express from "express";
import { addMember, createGroup, getGroupMembers, getMyGroups } from "../controller/groupController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createGroup);
router.post("/:groupId/members", authMiddleware, addMember);
router.get("/:groupId/members", authMiddleware, getGroupMembers);
router.get("/", authMiddleware, getMyGroups);

export default router;