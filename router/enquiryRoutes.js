import { Router } from "express";

import {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiry,
  deleteEnquiry,
} from "../controllers/enquiryController.js";

import {
  verifyJWT,
  authorizeUserType,
} from "../middlewares/authTypeMiddleware.js";

const router = Router();

/* =====================================================
   PUBLIC WEBSITE ROUTE
===================================================== */

router.post(
  "/",
  createEnquiry
);

/* =====================================================
   ADMIN ROUTES
===================================================== */

router.get(
  "/admin/all",
  verifyJWT,
  authorizeUserType("Admin"),
  getAllEnquiries
);

router.get(
  "/admin/:id",
  verifyJWT,
  authorizeUserType("Admin"),
  getEnquiryById
);

router.put(
  "/:id",
  verifyJWT,
  authorizeUserType("Admin"),
  updateEnquiry
);

router.delete(
  "/:id",
  verifyJWT,
  authorizeUserType("Admin"),
  deleteEnquiry
);

export default router;