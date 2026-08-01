import { Router } from "express";

import {
  getDashboardSummary,
} from "../controllers/dashboardController.js";

import {
  verifyJWT,
  authorizeUserType,
} from "../middlewares/authTypeMiddleware.js";

const router = Router();

/* =====================================================
   ADMIN DASHBOARD
===================================================== */

router.get(
  "/summary",
  verifyJWT,
  authorizeUserType("Admin"),
  getDashboardSummary
);

export default router;