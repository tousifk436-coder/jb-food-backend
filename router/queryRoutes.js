// import express from "express";

// import upload from "../middlewares/queryUpload.js";

// import {
//   createQuery,
//   downloadPortfolioPdf,
//   uploadPortfolioPdf,
//   getPortfolioInfo,
//   getAllQueries,
//   getQueryById,
//   deleteQuery,
// } from "../controllers/queryController.js";

// const router = express.Router();

// /**
//  * Admin uploads or replaces the portfolio PDF.
//  *
//  * Body:
//  * form-data
//  * pdf: File
//  */
// router.post(
//   "/upload-portfolio",
//   upload.single("pdf"),
//   uploadPortfolioPdf
// );

// /**
//  * Check current portfolio PDF.
//  */
// router.get("/portfolio-info", getPortfolioInfo);

// /**
//  * Download latest portfolio PDF.
//  */
// router.get("/download", downloadPortfolioPdf);

// /**
//  * Get all submitted clients.
//  */
// router.get("/", getAllQueries);

// /**
//  * Client submits name and phone number.
//  */
// router.post("/", createQuery);

// /**
//  * Get one submitted query.
//  */
// router.get("/:id", getQueryById);

// /**
//  * Delete one submitted query.
//  */
// router.delete("/:id", deleteQuery);

// export default router;
import { Router } from "express";

import {
  createQuery,
  getAllQueries,
  deleteQuery,
  uploadPortfolio,
  getPortfolioInfo,
  downloadPortfolio,
} from "../controllers/queryController.js";

import {
  uploadPortfolioPdf,
} from "../middlewares/uploadPortfolioPdf.middleware.js";

import {
  verifyJWT,
} from "../middlewares/authTypeMiddleware.js";

const router = Router();

/* =====================================================
   PUBLIC WEBSITE ROUTES
===================================================== */

/*
 * Submit user name and phone number.
 */
router.post(
  "/",
  createQuery
);

/*
 * Download the latest Portfolio PDF.
 */
router.get(
  "/download",
  downloadPortfolio
);

/*
 * Get current Portfolio PDF information.
 */
router.get(
  "/portfolio-info",
  getPortfolioInfo
);

/* =====================================================
   ADMIN ROUTES
===================================================== */

/*
 * Get Portfolio query list.
 */
router.get(
  "/",
  verifyJWT,
  getAllQueries
);

/*
 * Upload or replace Portfolio PDF.
 * Form-data field name must be: pdf
 */
router.post(
  "/upload-portfolio",
  verifyJWT,
  uploadPortfolioPdf.single(
    "pdf"
  ),
  uploadPortfolio
);

/*
 * Delete Portfolio query.
 */
router.delete(
  "/:id",
  verifyJWT,
  deleteQuery
);

export default router;