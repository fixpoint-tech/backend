// src/routes/branchRoutes.js
import { Router } from "express";
import branchController from "../controllers/branchController.js";
import { authorizeRoles } from "../middleware/auth.js";

const router = Router();

// Only maintenance_executive can access branch routes
router.use(authorizeRoles("maintenance_executive"));

// POST /api/v1/branches - Add a new branch
router.post("/", branchController.addBranch);

// GET /api/v1/branches - Get all branches
router.get("/", branchController.getAllBranches);

// GET /api/v1/branches/:id - Get branch by ID
router.get("/:id", branchController.getBranchById);

// PUT /api/v1/branches/:id - Update branch by ID
router.put("/:id", branchController.updateBranch);

// DELETE /api/v1/branches/:id - Delete branch by ID
router.delete("/:id", branchController.deleteBranch);

export default router;
