// // import Query from "../models/queryModel.js";

// // export const createQuery = async (req, res) => {
// //   try {
// //     console.log("Received body:", req.body);
// //     console.log("Received file:", req.file);

// //     const name = req.body?.name?.trim();
// //     const phone = req.body?.phone?.trim();

// //     if (!name) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Name is required",
// //       });
// //     }

// //     if (!phone) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Phone number is required",
// //       });
// //     }

// //     if (!req.file) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "PDF is required",
// //       });
// //     }

// //     const query = await Query.create({
// //       name,
// //       phone,
// //       pdf: req.file.path.replace(/\\/g, "/"),
// //     });

// //     return res.status(201).json({
// //       success: true,
// //       message: "Query submitted successfully",
// //       data: query,
// //     });
// //   } catch (error) {
// //     console.error("Create query error:", error);

// //     return res.status(500).json({
// //       success: false,
// //       message: error.message || "Internal server error",
// //     });
// //   }
// // };

// import path from "path";
// import fs from "fs";
// import Query from "../models/queryModel.js";

// const portfolioPdfPath = path.join(
//   process.cwd(),
//   "uploads",
//   "pdfs",
//   "portfolio.pdf"
// );

// // Client submits name and phone
// export const createQuery = async (req, res) => {
//   try {
//     const name = req.body?.name?.trim();
//     const phone = req.body?.phone?.trim();

//     if (!name) {
//       return res.status(400).json({
//         success: false,
//         message: "Name is required",
//       });
//     }

//     if (!phone) {
//       return res.status(400).json({
//         success: false,
//         message: "Phone number is required",
//       });
//     }

//     if (!/^[0-9+\-\s]{7,15}$/.test(phone)) {
//       return res.status(400).json({
//         success: false,
//         message: "Please enter a valid phone number",
//       });
//     }

//     if (!fs.existsSync(portfolioPdfPath)) {
//       return res.status(404).json({
//         success: false,
//         message: "Portfolio PDF is currently unavailable",
//       });
//     }

//     const query = await Query.create({
//       name,
//       phone,
//       pdf: "/uploads/pdfs/portfolio.pdf",
//     });

//     const baseUrl = `${req.protocol}://${req.get("host")}`;

//     return res.status(201).json({
//       success: true,
//       message: "Details submitted successfully",
//       data: query,
//       downloadUrl: `${baseUrl}/api/query/download`,
//       fileName: "Company-Portfolio.pdf",
//     });
//   } catch (error) {
//     console.error("Create query error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Internal server error",
//     });
//   }
// };

// // Download portfolio PDF
// export const downloadPortfolio = async (req, res) => {
//   try {
//     if (!fs.existsSync(portfolioPdfPath)) {
//       return res.status(404).json({
//         success: false,
//         message: "Portfolio PDF not found",
//       });
//     }

//     return res.download(portfolioPdfPath, "Company-Portfolio.pdf");
//   } catch (error) {
//     console.error("Portfolio download error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Unable to download portfolio",
//     });
//   }
// };

// // Admin uploads or replaces portfolio PDF
// export const uploadPortfolio = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Portfolio PDF is required",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Portfolio PDF uploaded successfully",
//       data: {
//         fileName: req.file.filename,
//         pdf: "/uploads/pdfs/portfolio.pdf",
//       },
//     });
//   } catch (error) {
//     console.error("Portfolio upload error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Unable to upload portfolio",
//     });
//   }
// };

// // Admin gets all submitted users
// export const getAllQueries = async (req, res) => {
//   try {
//     const queries = await Query.find()
//       .sort({ createdAt: -1 })
//       .lean();

//     return res.status(200).json({
//       success: true,
//       count: queries.length,
//       data: queries,
//     });
//   } catch (error) {
//     console.error("Get queries error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Unable to retrieve queries",
//     });
//   }
// };

import fs from "fs";
import path from "path";
import mongoose from "mongoose";

import Query from "../models/queryModel.js";

const portfolioFilePath = path.join(
  process.cwd(),
  "uploads",
  "pdfs",
  "portfolio.pdf"
);

const portfolioPublicPath =
  "/uploads/pdfs/portfolio.pdf";

/**
 * Create the complete backend URL.
 */
const getBaseUrl = (req) => {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL.replace(/\/$/, "");
  }

  return `${req.protocol}://${req.get("host")}`;
};

/**
 * Website:
 * Save client's name and phone number.
 *
 * POST /api/query
 */
export const createQuery = async (req, res) => {
  try {
    const name = req.body?.name?.trim();
    const phone = req.body?.phone?.trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const phoneRegex = /^[0-9+\-()\s]{7,20}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number",
      });
    }

    // Do not accept the form when the admin has not uploaded a PDF
    if (!fs.existsSync(portfolioFilePath)) {
      return res.status(404).json({
        success: false,
        message:
          "Portfolio PDF is currently unavailable. Please try again later.",
      });
    }

    const query = await Query.create({
      name,
      phone,
      pdf: portfolioPublicPath,
    });

    const baseUrl = getBaseUrl(req);

    return res.status(201).json({
      success: true,
      message:
        "Details submitted successfully. Portfolio is ready to download.",
      data: query,
      downloadUrl: `${baseUrl}/api/query/download`,
      fileName: "Company-Portfolio.pdf",
    });
  } catch (error) {
    console.error("Create query error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Unable to submit details",
    });
  }
};

/**
 * Website:
 * Download the latest portfolio PDF.
 *
 * GET /api/query/download
 */
export const downloadPortfolioPdf = async (
  req,
  res
) => {
  try {
    if (!fs.existsSync(portfolioFilePath)) {
      return res.status(404).json({
        success: false,
        message: "Portfolio PDF is not available",
      });
    }

    // Prevent browser from downloading an older cached PDF
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );

    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    return res.download(
      portfolioFilePath,
      "Company-Portfolio.pdf",
      (error) => {
        if (error && !res.headersSent) {
          console.error(
            "Portfolio download error:",
            error
          );

          return res.status(500).json({
            success: false,
            message:
              "Unable to download portfolio PDF",
          });
        }
      }
    );
  } catch (error) {
    console.error("Portfolio download error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to download portfolio PDF",
    });
  }
};

/**
 * Admin:
 * Upload or replace the portfolio PDF.
 *
 * POST /api/query/upload-portfolio
 */
export const uploadPortfolioPdf = async (
  req,
  res
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a portfolio PDF",
      });
    }

    const baseUrl = getBaseUrl(req);

    return res.status(200).json({
      success: true,
      message:
        "Portfolio PDF uploaded successfully",
      data: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        pdfPath: portfolioPublicPath,
        viewUrl: `${baseUrl}${portfolioPublicPath}`,
        downloadUrl: `${baseUrl}/api/query/download`,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Portfolio upload error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to upload portfolio PDF",
    });
  }
};

/**
 * Admin:
 * Check whether a portfolio PDF is available.
 *
 * GET /api/query/portfolio-info
 */
export const getPortfolioInfo = async (
  req,
  res
) => {
  try {
    const exists = fs.existsSync(portfolioFilePath);
    const baseUrl = getBaseUrl(req);

    if (!exists) {
      return res.status(200).json({
        success: true,
        data: {
          exists: false,
          message:
            "No portfolio PDF has been uploaded",
        },
      });
    }

    const fileInformation = fs.statSync(
      portfolioFilePath
    );

    return res.status(200).json({
      success: true,
      data: {
        exists: true,
        fileName: "portfolio.pdf",
        size: fileInformation.size,
        updatedAt:
          fileInformation.mtime.toISOString(),
        viewUrl: `${baseUrl}${portfolioPublicPath}`,
        downloadUrl: `${baseUrl}/api/query/download`,
      },
    });
  } catch (error) {
    console.error(
      "Get portfolio information error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve portfolio information",
    });
  }
};

/**
 * Admin:
 * Get all clients who submitted the portfolio form.
 *
 * GET /api/query?page=1&limit=10&search=
 */
export const getAllQueries = async (req, res) => {
  try {
    const page = Math.max(
      Number.parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(req.query.limit, 10) || 10,
        1
      ),
      100
    );

    const search = req.query.search?.trim() || "";

    const filter = search
      ? {
          $or: [
            {
              name: {
                $regex: search,
                $options: "i",
              },
            },
            {
              phone: {
                $regex: search,
                $options: "i",
              },
            },
          ],
        }
      : {};

    const skip = (page - 1) * limit;

    const [queries, total] = await Promise.all([
      Query.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Query.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Queries retrieved successfully",
      data: queries,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalRecords: total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get queries error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to retrieve queries",
    });
  }
};

/**
 * Admin:
 * Get one query by MongoDB ID.
 *
 * GET /api/query/:id
 */
export const getQueryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid query ID",
      });
    }

    const query = await Query.findById(id).lean();

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: query,
    });
  } catch (error) {
    console.error("Get query error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Unable to retrieve query",
    });
  }
};

/**
 * Admin:
 * Delete one submitted query.
 *
 * DELETE /api/query/:id
 */
export const deleteQuery = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid query ID",
      });
    }

    const deletedQuery =
      await Query.findByIdAndDelete(id);

    if (!deletedQuery) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Query deleted successfully",
    });
  } catch (error) {
    console.error("Delete query error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Unable to delete query",
    });
  }
};