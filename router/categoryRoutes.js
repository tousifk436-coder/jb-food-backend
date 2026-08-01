import { Router } from "express";

import upload from "../config/multerConfig.js";

import {
  createCategory,
  getCategories,
  getCategoryBySlug,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

import {
  verifyJWT,
  authorizeUserType,
} from "../middlewares/authTypeMiddleware.js";

const router = Router();

/* =====================================================
   ADMIN ROUTES
===================================================== */

router.get(
  "/admin/all",
  verifyJWT,
  authorizeUserType("Admin"),
  getAllCategories
);

router.get(
  "/admin/:id",
  verifyJWT,
  authorizeUserType("Admin"),
  getCategoryById
);

router.post(
  "/",
  verifyJWT,
  authorizeUserType("Admin"),
  upload.single("categoryImage"),
  createCategory
);

router.put(
  "/:id",
  verifyJWT,
  authorizeUserType("Admin"),
  upload.single("categoryImage"),
  updateCategory
);

router.delete(
  "/:id",
  verifyJWT,
  authorizeUserType("Admin"),
  deleteCategory
);

/* =====================================================
   PUBLIC WEBSITE ROUTES
===================================================== */

router.get(
  "/",
  getCategories
);

router.get(
  "/:slug",
  getCategoryBySlug
);

export default router;