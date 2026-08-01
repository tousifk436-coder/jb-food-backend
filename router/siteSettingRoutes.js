import { Router } from "express";

import upload from "../config/multerConfig.js";

import {
  getSiteSettings,
  getAdminSiteSettings,
  updateSiteSettings,
} from "../controllers/siteSettingController.js";

import {
  verifyJWT,
  authorizeUserType,
} from "../middlewares/authTypeMiddleware.js";

const router = Router();

/* =====================================================
   ADMIN ROUTES
===================================================== */

router.get(
  "/admin",
  verifyJWT,
  authorizeUserType("Admin"),
  getAdminSiteSettings
);

router.put(
  "/",
  verifyJWT,
  authorizeUserType("Admin"),
  upload.single("logo"),
  updateSiteSettings
);

/* =====================================================
   PUBLIC WEBSITE ROUTE
===================================================== */

router.get(
  "/",
  getSiteSettings
);

export default router;