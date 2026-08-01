// import { asyncHandler } from "../utils/asynchandler.js";
// import jwt from "jsonwebtoken";
// import { apiError } from "../utils/apiError.js";
// import User from "../models/User.modal.js";

// export const verifyJWT = asyncHandler(async (req, res, next) => {
//   try {
//     // Get the token from cookies or Authorization header
//     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

   

//     if (!token) {
//       apiError(res, 401, false, "Unauthorized request: No token provided");
//       return;
//     }

//     // Verify the token
//     const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    
    
//     // Find the user associated with the token
//     const user = await User.findById(decodedToken?.userId)
//     .select("-password -authToken"); // Don't return sensitive fields like password and authToken
   
//     if (!user) {
//       apiError(res, 401, false, "Invalid access token: User not found");
//       return;
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     const jwtErrors = {
//       "jwt malformed": "Invalid token format. Please log in again to get a valid access token.",
//       "invalid signature": "Token signature verification failed. Access denied.",
//       "jwt expired": "Your session has expired. Please log in again to continue.",
//       "invalid token": "The provided token is invalid. Please authenticate again.",
//       "jwt not active": "Token is not yet active. Please check your system time.",
//     };
//     const message = jwtErrors[error?.message] || "Authentication failed. Please provide a valid token.";
//     apiError(res, 401, false, message);
//     return;
//   }
// });

// export const authorizeUserType = (...allowedTypes) => {
//   return async (req, res, next) => {
   
//     try {
//       // Ensure the user object is attached to the request
//       if (!req.user) {
//         return apiError(res, 401, false, "Unauthorized access: No user data available");
//       }

//       // Check if the user's accountType is in the allowedTypes array
//       if (!allowedTypes.includes(req.user.accountType)) {
//         return apiError(res, 403, false, "Forbidden: You do not have access to this resource");
//       }

//       next();
//     } catch (error) {
//       return apiError(res, 500, false, error.message || "Error in authorization");
//     }
//   };
// };

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
