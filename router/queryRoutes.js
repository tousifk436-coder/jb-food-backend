import express from "express";

import upload from "../middlewares/queryUpload.js";

import {
  createQuery,
  downloadPortfolioPdf,
  uploadPortfolioPdf,
  getPortfolioInfo,
  getAllQueries,
  getQueryById,
  deleteQuery,
} from "../controllers/queryController.js";

const router = express.Router();

/**
 * Admin uploads or replaces the portfolio PDF.
 *
 * Body:
 * form-data
 * pdf: File
 */
router.post(
  "/upload-portfolio",
  upload.single("pdf"),
  uploadPortfolioPdf
);

/**
 * Check current portfolio PDF.
 */
router.get("/portfolio-info", getPortfolioInfo);

/**
 * Download latest portfolio PDF.
 */
router.get("/download", downloadPortfolioPdf);

/**
 * Get all submitted clients.
 */
router.get("/", getAllQueries);

/**
 * Client submits name and phone number.
 */
router.post("/", createQuery);

/**
 * Get one submitted query.
 */
router.get("/:id", getQueryById);

/**
 * Delete one submitted query.
 */
router.delete("/:id", deleteQuery);

export default router;