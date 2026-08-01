import { Router } from "express";

import {
  createFAQ,
  getFAQs,
  getFAQById,
  getAllFAQs,
  getAdminFAQById,
  updateFAQ,
  deleteFAQ,
} from "../controllers/faqController.js";

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
  getAllFAQs
);

router.get(
  "/admin/:id",
  verifyJWT,
  authorizeUserType("Admin"),
  getAdminFAQById
);

router.post(
  "/",
  verifyJWT,
  authorizeUserType("Admin"),
  createFAQ
);

router.put(
  "/:id",
  verifyJWT,
  authorizeUserType("Admin"),
  updateFAQ
);

router.delete(
  "/:id",
  verifyJWT,
  authorizeUserType("Admin"),
  deleteFAQ
);

/* =====================================================
   PUBLIC WEBSITE ROUTES
===================================================== */

router.get("/", getFAQs);

router.get("/:id", getFAQById);

export default router;