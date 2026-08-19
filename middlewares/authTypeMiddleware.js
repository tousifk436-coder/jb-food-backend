

import jwt from "jsonwebtoken";

import { asyncHandler } from "../utils/asynchandler.js";
import { apiError } from "../utils/apiError.js";
import User from "../models/User.modal.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const authorizationHeader = req.header("Authorization");

    const bearerToken = authorizationHeader?.startsWith("Bearer ")
      ? authorizationHeader.slice(7).trim()
      : null;

    const cookieToken = req.cookies?.accessToken;

    const token = cookieToken || bearerToken;

    if (!token) {
      return apiError(
        res,
        401,
        false,
        "Unauthorized request: No token provided"
      );
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(
      decodedToken?.userId
    ).select("-password -otp -otpExpiration -authToken");

    if (!user) {
      return apiError(
        res,
        401,
        false,
        "Invalid access token: User not found"
      );
    }

    if (user.activeStatus === false) {
      return apiError(
        res,
        403,
        false,
        "Your account is inactive"
      );
    }

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    const jwtErrors = {
      "jwt malformed":
        "Invalid token format. Please log in again.",
      "invalid signature":
        "Token signature verification failed.",
      "jwt expired":
        "Your session has expired. Please log in again.",
      "invalid token":
        "The provided token is invalid.",
      "jwt not active":
        "Token is not active yet.",
    };

    const message =
      jwtErrors[error?.message] ||
      "Authentication failed. Please provide a valid token.";

    return apiError(
      res,
      401,
      false,
      message
    );
  }
});

/*
 * Usage:
 *
 * authorizeUserType("Admin")
 *
 * This remains compatible with your existing route style.
 */
export const authorizeUserType = (...allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return apiError(
        res,
        401,
        false,
        "Unauthorized access: User information is missing"
      );
    }

    const currentRole =
      req.user.role ||
      req.user.accountType;

    if (!allowedTypes.includes(currentRole)) {
      return apiError(
        res,
        403,
        false,
        "Forbidden: You do not have permission to perform this action"
      );
    }

    next();
  };
};
