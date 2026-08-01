import { Router } from "express";

import {
  createUser,
  deleteUser,
  getAllUsers,
  getProfile,
  loginWithPassword,
  registerOrLogin,
  resendOtp,
  createPassword,
  resetPassword,
  updatePassword,
  updateUserById,
  updateUserRole,
  verifyOtp,
} from "../controllers/authController.js";

import {
  verifyJWT,
  authorizeUserType,
} from "../middlewares/authTypeMiddleware.js";

const router = Router();

/* =====================================================
   PUBLIC AUTH ROUTES
===================================================== */

router.post(
  "/registerOrLogin",
  registerOrLogin
);

router.post(
  "/verifyOtp",
  verifyOtp
);

router.post(
  "/resendOtp",
  resendOtp
);

router.post(
  "/loginWithPassword",
  loginWithPassword
);

/* =====================================================
   PROTECTED USER ROUTES
===================================================== */

router.get(
  "/profile",
  verifyJWT,
  getProfile
);

router.post(
  "/createPassword",
  verifyJWT,
  createPassword
);

router.post(
  "/updatePassword",
  verifyJWT,
  updatePassword
);

router.post(
  "/resetPassword",
  verifyJWT,
  resetPassword
);

/* =====================================================
   ADMIN USER MANAGEMENT ROUTES
===================================================== */

router.post(
  "/createUser",
  createUser
);

router.get(
  "/getAllUsers",
  verifyJWT,
  authorizeUserType("Admin"),
  getAllUsers
);

router.patch(
  "/update/:id",
  verifyJWT,
  updateUserById
);

router.put(
  "/updateRole/:userId",
  verifyJWT,
  authorizeUserType("Admin"),
  updateUserRole
);

router.delete(
  "/delete/:id",
  verifyJWT,
  authorizeUserType("Admin"),
  deleteUser
);

export default router;