import express from "express";
import { addMember, createGroup, getGroupDetail, getGroupMembers, getMyGroups } from "../controller/groupController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { createGroupSchema } from "../validations/groupValidation.js";

const router = express.Router();

router.post("/", authMiddleware, validate(createGroupSchema), createGroup);
router.post("/:groupId/members", authMiddleware, addMember);
router.get("/:groupId/members", authMiddleware, getGroupMembers);
router.get("/", authMiddleware, getMyGroups);
router.get("/:groupId", authMiddleware, getGroupDetail);

export default router;