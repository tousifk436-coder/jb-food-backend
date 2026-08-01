import { Router } from "express";

import upload from "../config/multerConfig.js";

import {
  createHomeBanner,
  getActiveHomeBanners,
  getAllHomeBanners,
  getHomeBannerById,
  updateHomeBanner,
  deleteHomeBanner,
} from "../controllers/homeBannerController.js";

import {
  verifyJWT,
  authorizeUserType,
} from "../middlewares/authTypeMiddleware.js";

const router = Router();

/* =====================================================
   PUBLIC WEBSITE API
===================================================== */

router.get(
  "/",
  getActiveHomeBanners
);

/* =====================================================
   ADMIN APIS
===================================================== */

router.get(
  "/admin/all",
  verifyJWT,
  authorizeUserType("Admin"),
  getAllHomeBanners
);

router.get(
  "/admin/:id",
  verifyJWT,
  authorizeUserType("Admin"),
  getHomeBannerById
);

router.post(
  "/",
  verifyJWT,
  authorizeUserType("Admin"),

  upload.fields([
    {
      name: "desktopImage",
      maxCount: 1,
    },
    {
      name: "mobileImage",
      maxCount: 1,
    },
  ]),

  createHomeBanner
);

router.put(
  "/:id",
  verifyJWT,
  authorizeUserType("Admin"),

  upload.fields([
    {
      name: "desktopImage",
      maxCount: 1,
    },
    {
      name: "mobileImage",
      maxCount: 1,
    },
  ]),

  updateHomeBanner
);

router.delete(
  "/:id",
  verifyJWT,
  authorizeUserType("Admin"),
  deleteHomeBanner
);

export default router;