import { Router } from "express";

import upload from "../config/multerConfig.js";

import {
  createProduct,
  getProducts,
  getProductBySlug,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

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
  getAllProducts
);

router.get(
  "/admin/:id",
  verifyJWT,
  authorizeUserType("Admin"),
  getProductById
);

router.post(
  "/",
  verifyJWT,
  authorizeUserType("Admin"),

  upload.fields([
    {
      name: "mainImage",
      maxCount: 1,
    },
    {
      name: "galleryImages",
      maxCount: 10,
    },
  ]),

  createProduct
);

router.put(
  "/:id",
  verifyJWT,
  authorizeUserType("Admin"),

  upload.fields([
    {
      name: "mainImage",
      maxCount: 1,
    },
    {
      name: "galleryImages",
      maxCount: 10,
    },
  ]),

  updateProduct
);

router.delete(
  "/:id",
  verifyJWT,
  authorizeUserType("Admin"),
  deleteProduct
);

/* =====================================================
   PUBLIC WEBSITE ROUTES
===================================================== */

router.get(
  "/",
  getProducts
);

router.get(
  "/:slug",
  getProductBySlug
);

export default router;