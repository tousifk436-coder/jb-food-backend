// // // import Query from "../models/queryModel.js";

// // // export const createQuery = async (req, res) => {
// // //   try {
// // //     console.log("Received body:", req.body);
// // //     console.log("Received file:", req.file);

// // //     const name = req.body?.name?.trim();
// // //     const phone = req.body?.phone?.trim();

// // //     if (!name) {
// // //       return res.status(400).json({
// // //         success: false,
// // //         message: "Name is required",
// // //       });
// // //     }

// // //     if (!phone) {
// // //       return res.status(400).json({
// // //         success: false,
// // //         message: "Phone number is required",
// // //       });
// // //     }

// // //     if (!req.file) {
// // //       return res.status(400).json({
// // //         success: false,
// // //         message: "PDF is required",
// // //       });
// // //     }

// // //     const query = await Query.create({
// // //       name,
// // //       phone,
// // //       pdf: req.file.path.replace(/\\/g, "/"),
// // //     });

// // //     return res.status(201).json({
// // //       success: true,
// // //       message: "Query submitted successfully",
// // //       data: query,
// // //     });
// // //   } catch (error) {
// // //     console.error("Create query error:", error);

// // //     return res.status(500).json({
// // //       success: false,
// // //       message: error.message || "Internal server error",
// // //     });
// // //   }
// // // };

// // import path from "path";
// // import fs from "fs";
// // import Query from "../models/queryModel.js";

// // const portfolioPdfPath = path.join(
// //   process.cwd(),
// //   "uploads",
// //   "pdfs",
// //   "portfolio.pdf"
// // );

// // // Client submits name and phone
// // export const createQuery = async (req, res) => {
// //   try {
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

// //     if (!/^[0-9+\-\s]{7,15}$/.test(phone)) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Please enter a valid phone number",
// //       });
// //     }

// //     if (!fs.existsSync(portfolioPdfPath)) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Portfolio PDF is currently unavailable",
// //       });
// //     }

// //     const query = await Query.create({
// //       name,
// //       phone,
// //       pdf: "/uploads/pdfs/portfolio.pdf",
// //     });

// //     const baseUrl = `${req.protocol}://${req.get("host")}`;

// //     return res.status(201).json({
// //       success: true,
// //       message: "Details submitted successfully",
// //       data: query,
// //       downloadUrl: `${baseUrl}/api/query/download`,
// //       fileName: "Company-Portfolio.pdf",
// //     });
// //   } catch (error) {
// //     console.error("Create query error:", error);

// //     return res.status(500).json({
// //       success: false,
// //       message: error.message || "Internal server error",
// //     });
// //   }
// // };

// // // Download portfolio PDF
// // export const downloadPortfolio = async (req, res) => {
// //   try {
// //     if (!fs.existsSync(portfolioPdfPath)) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Portfolio PDF not found",
// //       });
// //     }

// //     return res.download(portfolioPdfPath, "Company-Portfolio.pdf");
// //   } catch (error) {
// //     console.error("Portfolio download error:", error);

// //     return res.status(500).json({
// //       success: false,
// //       message: "Unable to download portfolio",
// //     });
// //   }
// // };

// // // Admin uploads or replaces portfolio PDF
// // export const uploadPortfolio = async (req, res) => {
// //   try {
// //     if (!req.file) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Portfolio PDF is required",
// //       });
// //     }

// //     return res.status(200).json({
// //       success: true,
// //       message: "Portfolio PDF uploaded successfully",
// //       data: {
// //         fileName: req.file.filename,
// //         pdf: "/uploads/pdfs/portfolio.pdf",
// //       },
// //     });
// //   } catch (error) {
// //     console.error("Portfolio upload error:", error);

// //     return res.status(500).json({
// //       success: false,
// //       message: error.message || "Unable to upload portfolio",
// //     });
// //   }
// // };

// // // Admin gets all submitted users
// // export const getAllQueries = async (req, res) => {
// //   try {
// //     const queries = await Query.find()
// //       .sort({ createdAt: -1 })
// //       .lean();

// //     return res.status(200).json({
// //       success: true,
// //       count: queries.length,
// //       data: queries,
// //     });
// //   } catch (error) {
// //     console.error("Get queries error:", error);

// //     return res.status(500).json({
// //       success: false,
// //       message: error.message || "Unable to retrieve queries",
// //     });
// //   }
// // };

// import fs from "fs";
// import path from "path";
// import mongoose from "mongoose";

// import Query from "../models/queryModel.js";

// const portfolioFilePath = path.join(
//   process.cwd(),
//   "uploads",
//   "pdfs",
//   "portfolio.pdf"
// );

// const portfolioPublicPath =
//   "/uploads/pdfs/portfolio.pdf";

// /**
//  * Create the complete backend URL.
//  */
// const getBaseUrl = (req) => {
//   if (process.env.BASE_URL) {
//     return process.env.BASE_URL.replace(/\/$/, "");
//   }

//   return `${req.protocol}://${req.get("host")}`;
// };

// /**
//  * Website:
//  * Save client's name and phone number.
//  *
//  * POST /api/query
//  */
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

//     const phoneRegex = /^[0-9+\-()\s]{7,20}$/;

//     if (!phoneRegex.test(phone)) {
//       return res.status(400).json({
//         success: false,
//         message: "Please enter a valid phone number",
//       });
//     }

//     // Do not accept the form when the admin has not uploaded a PDF
//     if (!fs.existsSync(portfolioFilePath)) {
//       return res.status(404).json({
//         success: false,
//         message:
//           "Portfolio PDF is currently unavailable. Please try again later.",
//       });
//     }

//     const query = await Query.create({
//       name,
//       phone,
//       pdf: portfolioPublicPath,
//     });

//     const baseUrl = getBaseUrl(req);

//     return res.status(201).json({
//       success: true,
//       message:
//         "Details submitted successfully. Portfolio is ready to download.",
//       data: query,
//       downloadUrl: `${baseUrl}/api/query/download`,
//       fileName: "Company-Portfolio.pdf",
//     });
//   } catch (error) {
//     console.error("Create query error:", error);

//     return res.status(500).json({
//       success: false,
//       message:
//         error.message || "Unable to submit details",
//     });
//   }
// };

// /**
//  * Website:
//  * Download the latest portfolio PDF.
//  *
//  * GET /api/query/download
//  */
// export const downloadPortfolioPdf = async (
//   req,
//   res
// ) => {
//   try {
//     if (!fs.existsSync(portfolioFilePath)) {
//       return res.status(404).json({
//         success: false,
//         message: "Portfolio PDF is not available",
//       });
//     }

//     // Prevent browser from downloading an older cached PDF
//     res.setHeader(
//       "Cache-Control",
//       "no-store, no-cache, must-revalidate, proxy-revalidate"
//     );

//     res.setHeader("Pragma", "no-cache");
//     res.setHeader("Expires", "0");

//     return res.download(
//       portfolioFilePath,
//       "Company-Portfolio.pdf",
//       (error) => {
//         if (error && !res.headersSent) {
//           console.error(
//             "Portfolio download error:",
//             error
//           );

//           return res.status(500).json({
//             success: false,
//             message:
//               "Unable to download portfolio PDF",
//           });
//         }
//       }
//     );
//   } catch (error) {
//     console.error("Portfolio download error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Unable to download portfolio PDF",
//     });
//   }
// };

// /**
//  * Admin:
//  * Upload or replace the portfolio PDF.
//  *
//  * POST /api/query/upload-portfolio
//  */
// export const uploadPortfolioPdf = async (
//   req,
//   res
// ) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Please select a portfolio PDF",
//       });
//     }

//     const baseUrl = getBaseUrl(req);

//     return res.status(200).json({
//       success: true,
//       message:
//         "Portfolio PDF uploaded successfully",
//       data: {
//         fileName: req.file.filename,
//         originalName: req.file.originalname,
//         size: req.file.size,
//         mimeType: req.file.mimetype,
//         pdfPath: portfolioPublicPath,
//         viewUrl: `${baseUrl}${portfolioPublicPath}`,
//         downloadUrl: `${baseUrl}/api/query/download`,
//         updatedAt: new Date().toISOString(),
//       },
//     });
//   } catch (error) {
//     console.error("Portfolio upload error:", error);

//     return res.status(500).json({
//       success: false,
//       message:
//         error.message ||
//         "Unable to upload portfolio PDF",
//     });
//   }
// };

// /**
//  * Admin:
//  * Check whether a portfolio PDF is available.
//  *
//  * GET /api/query/portfolio-info
//  */
// export const getPortfolioInfo = async (
//   req,
//   res
// ) => {
//   try {
//     const exists = fs.existsSync(portfolioFilePath);
//     const baseUrl = getBaseUrl(req);

//     if (!exists) {
//       return res.status(200).json({
//         success: true,
//         data: {
//           exists: false,
//           message:
//             "No portfolio PDF has been uploaded",
//         },
//       });
//     }

//     const fileInformation = fs.statSync(
//       portfolioFilePath
//     );

//     return res.status(200).json({
//       success: true,
//       data: {
//         exists: true,
//         fileName: "portfolio.pdf",
//         size: fileInformation.size,
//         updatedAt:
//           fileInformation.mtime.toISOString(),
//         viewUrl: `${baseUrl}${portfolioPublicPath}`,
//         downloadUrl: `${baseUrl}/api/query/download`,
//       },
//     });
//   } catch (error) {
//     console.error(
//       "Get portfolio information error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Unable to retrieve portfolio information",
//     });
//   }
// };

// /**
//  * Admin:
//  * Get all clients who submitted the portfolio form.
//  *
//  * GET /api/query?page=1&limit=10&search=
//  */
// export const getAllQueries = async (req, res) => {
//   try {
//     const page = Math.max(
//       Number.parseInt(req.query.page, 10) || 1,
//       1
//     );

//     const limit = Math.min(
//       Math.max(
//         Number.parseInt(req.query.limit, 10) || 10,
//         1
//       ),
//       100
//     );

//     const search = req.query.search?.trim() || "";

//     const filter = search
//       ? {
//           $or: [
//             {
//               name: {
//                 $regex: search,
//                 $options: "i",
//               },
//             },
//             {
//               phone: {
//                 $regex: search,
//                 $options: "i",
//               },
//             },
//           ],
//         }
//       : {};

//     const skip = (page - 1) * limit;

//     const [queries, total] = await Promise.all([
//       Query.find(filter)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean(),

//       Query.countDocuments(filter),
//     ]);

//     return res.status(200).json({
//       success: true,
//       message: "Queries retrieved successfully",
//       data: queries,
//       pagination: {
//         currentPage: page,
//         pageSize: limit,
//         totalRecords: total,
//         totalPages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     console.error("Get queries error:", error);

//     return res.status(500).json({
//       success: false,
//       message:
//         error.message ||
//         "Unable to retrieve queries",
//     });
//   }
// };

// /**
//  * Admin:
//  * Get one query by MongoDB ID.
//  *
//  * GET /api/query/:id
//  */
// export const getQueryById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid query ID",
//       });
//     }

//     const query = await Query.findById(id).lean();

//     if (!query) {
//       return res.status(404).json({
//         success: false,
//         message: "Query not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: query,
//     });
//   } catch (error) {
//     console.error("Get query error:", error);

//     return res.status(500).json({
//       success: false,
//       message:
//         error.message || "Unable to retrieve query",
//     });
//   }
// };

// /**
//  * Admin:
//  * Delete one submitted query.
//  *
//  * DELETE /api/query/:id
//  */
// export const deleteQuery = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid query ID",
//       });
//     }

//     const deletedQuery =
//       await Query.findByIdAndDelete(id);

//     if (!deletedQuery) {
//       return res.status(404).json({
//         success: false,
//         message: "Query not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Query deleted successfully",
//     });
//   } catch (error) {
//     console.error("Delete query error:", error);

//     return res.status(500).json({
//       success: false,
//       message:
//         error.message || "Unable to delete query",
//     });
//   }
// };

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Readable } from "stream";
import { pipeline } from "stream/promises";

import Query from "../models/queryModel.js";
import PortfolioPdf from "../models/PortfolioPdf.modal.js";

import cloudinary from "../config/cloudinary.js";

const PORTFOLIO_KEY =
  "main-portfolio";

const DEFAULT_PDF_NAME =
  "ARV-Portfolio.pdf";

const CLOUDINARY_CHUNK_SIZE =
  20 * 1024 * 1024;

/* =====================================================
   HELPERS
===================================================== */

const getBackendBaseUrl = (req) => {
  const environmentBaseUrl =
    process.env.BASE_URL?.trim();

  if (environmentBaseUrl) {
    return environmentBaseUrl.replace(
      /\/$/,
      ""
    );
  }

  return `${req.protocol}://${req.get(
    "host"
  )}`;
};

const sanitizePdfFileName = (
  fileName
) => {
  let safeFileName = path
    .basename(
      fileName ||
        DEFAULT_PDF_NAME
    )
    .replace(/["\r\n]/g, "")
    .replace(
      /[^a-zA-Z0-9._()\- ]/g,
      "_"
    )
    .trim();

  if (!safeFileName) {
    safeFileName =
      DEFAULT_PDF_NAME;
  }

  if (
    !safeFileName
      .toLowerCase()
      .endsWith(".pdf")
  ) {
    safeFileName =
      `${safeFileName}.pdf`;
  }

  return safeFileName;
};

const removeTemporaryFile =
  async (filePath) => {
    if (!filePath) {
      return;
    }

    try {
      await fs.promises.unlink(
        filePath
      );
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error(
          "Temporary PDF removal error:",
          error
        );
      }
    }
  };

/*
 * Upload a large PDF to Cloudinary
 * using chunked upload.
 */
const uploadLargePdfToCloudinary = (
  localFilePath,
  publicId
) => {
  return new Promise(
    (resolve, reject) => {
      let settled = false;

      cloudinary.uploader.upload_large(
        localFilePath,
        {
          resource_type: "raw",
          type: "upload",

          /*
           * Raw asset public IDs should
           * include the extension.
           */
          public_id: publicId,

          overwrite: false,

          chunk_size:
            CLOUDINARY_CHUNK_SIZE,

          tags: [
            "arv-portfolio",
            "portfolio-pdf",
          ],
        },
        (error, result) => {
          if (settled) {
            return;
          }

          if (error) {
            settled = true;
            reject(error);
            return;
          }

          /*
           * Chunked uploads can return
           * intermediate responses.
           */
          if (
            !result ||
            result.done === false
          ) {
            return;
          }

          settled = true;
          resolve(result);
        }
      );
    }
  );
};

/*
 * Delete a raw PDF from Cloudinary.
 */
const deleteCloudinaryPdf =
  async (publicId) => {
    if (!publicId) {
      return;
    }

    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: "raw",
        type: "upload",
        invalidate: true,
      }
    );
  };

/* =====================================================
   CREATE PORTFOLIO QUERY

   POST /api/query
===================================================== */

const createQuery = async (
  req,
  res
) => {
  try {
    const name =
      req.body.name?.trim();

    const phone =
      req.body.phone?.trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message:
          "Name is required.",
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message:
          "Phone number is required.",
      });
    }

    const portfolioPdf =
      await PortfolioPdf.findOne({
        key: PORTFOLIO_KEY,
      }).lean();

    if (!portfolioPdf?.pdfUrl) {
      return res.status(404).json({
        success: false,
        message:
          "Portfolio PDF is currently not available.",
      });
    }

    const createdQuery =
      await Query.create({
        name,
        phone,
        pdf: portfolioPdf.pdfUrl,
      });

    const backendBaseUrl =
      getBackendBaseUrl(req);

    const downloadUrl =
      `${backendBaseUrl}/api/query/download`;

    return res.status(201).json({
      success: true,

      message:
        "Your details were submitted successfully.",

      data: createdQuery,

      fileName:
        portfolioPdf.originalName ||
        DEFAULT_PDF_NAME,

      downloadUrl,
    });
  } catch (error) {
    console.error(
      "Create query error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Failed to submit your details.",
    });
  }
};

/* =====================================================
   GET ALL PORTFOLIO QUERIES

   GET /api/query
===================================================== */

const getAllQueries = async (
  req,
  res
) => {
  try {
    const page = Math.max(
      Number.parseInt(
        req.query.page,
        10
      ) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(
          req.query.limit,
          10
        ) || 10,
        1
      ),
      100
    );

    const search =
      req.query.search?.trim() ||
      "";

    const skip =
      (page - 1) * limit;

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

    const [
      queries,
      totalQueries,
    ] = await Promise.all([
      Query.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Query.countDocuments(
        filter
      ),
    ]);

    return res.status(200).json({
      success: true,

      message:
        "Portfolio queries fetched successfully.",

      data: {
        queries,
        totalQueries,
        currentPage: page,

        totalPages: Math.ceil(
          totalQueries / limit
        ),

        limit,
      },
    });
  } catch (error) {
    console.error(
      "Get Portfolio queries error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Failed to fetch Portfolio queries.",
    });
  }
};

/* =====================================================
   DELETE PORTFOLIO QUERY

   DELETE /api/query/:id
===================================================== */

const deleteQuery = async (
  req,
  res
) => {
  try {
    const queryId =
      req.params.id;

    const deletedQuery =
      await Query.findByIdAndDelete(
        queryId
      );

    if (!deletedQuery) {
      return res.status(404).json({
        success: false,
        message:
          "Portfolio query not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Portfolio query deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Portfolio query error:",
      error
    );

    if (
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Portfolio query ID.",
      });
    }

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Failed to delete Portfolio query.",
    });
  }
};

/* =====================================================
   UPLOAD PORTFOLIO PDF TO CLOUDINARY

   POST /api/query/upload-portfolio
===================================================== */

const uploadPortfolio = async (
  req,
  res
) => {
  let newCloudinaryPublicId =
    null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,

        message:
          "Please select a PDF file.",
      });
    }

    if (
      !req.file.path ||
      !fs.existsSync(req.file.path)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Temporary uploaded PDF file was not found.",
      });
    }

    const previousPortfolio =
      await PortfolioPdf.findOne({
        key: PORTFOLIO_KEY,
      }).lean();

    /*
     * Every upload gets a new public ID.
     * This prevents old cached PDFs from
     * being used after replacement.
     */
    const uniquePublicId =
      `arv/portfolio/portfolio-${
        Date.now()
      }-${crypto.randomUUID()}.pdf`;

    const uploadResult =
      await uploadLargePdfToCloudinary(
        req.file.path,
        uniquePublicId
      );

    if (
      !uploadResult?.secure_url
    ) {
      throw new Error(
        "Cloudinary did not return a PDF URL."
      );
    }

    if (
      !uploadResult?.public_id
    ) {
      throw new Error(
        "Cloudinary did not return a public ID."
      );
    }

    newCloudinaryPublicId =
      uploadResult.public_id;

    const safeOriginalName =
      sanitizePdfFileName(
        req.file.originalname
      );

    const savedPortfolio =
      await PortfolioPdf.findOneAndUpdate(
        {
          key: PORTFOLIO_KEY,
        },
        {
          $set: {
            key:
              PORTFOLIO_KEY,

            pdfUrl:
              uploadResult.secure_url,

            publicId:
              uploadResult.public_id,

            assetId:
              uploadResult.asset_id ||
              "",

            resourceType:
              uploadResult.resource_type ||
              "raw",

            originalName:
              safeOriginalName,

            bytes:
              uploadResult.bytes ||
              req.file.size ||
              0,

            cloudinaryVersion:
              uploadResult.version ||
              0,

            uploadedAt:
              new Date(),
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

    /*
     * Delete the previous PDF only after
     * the new Cloudinary upload and MongoDB
     * update succeed.
     */
    if (
      previousPortfolio?.publicId &&
      previousPortfolio.publicId !==
        savedPortfolio.publicId
    ) {
      try {
        await deleteCloudinaryPdf(
          previousPortfolio.publicId
        );
      } catch (deleteError) {
        console.error(
          "Previous Cloudinary PDF deletion error:",
          deleteError
        );
      }
    }

    const backendBaseUrl =
      getBackendBaseUrl(req);

    const downloadUrl =
      `${backendBaseUrl}/api/query/download`;

    return res.status(200).json({
      success: true,

      message:
        "Portfolio PDF uploaded to Cloudinary successfully.",

      fileName:
        savedPortfolio.originalName,

      downloadUrl,

      data: {
        id:
          savedPortfolio._id,

        fileName:
          savedPortfolio.originalName,

        pdfUrl:
          savedPortfolio.pdfUrl,

        publicId:
          savedPortfolio.publicId,

        bytes:
          savedPortfolio.bytes,

        sizeInMB: Number(
          (
            savedPortfolio.bytes /
            (1024 * 1024)
          ).toFixed(2)
        ),

        uploadedAt:
          savedPortfolio.uploadedAt,

        downloadUrl,
      },
    });
  } catch (error) {
    console.error(
      "Portfolio PDF upload error:",
      error
    );

    /*
     * If Cloudinary upload succeeded but
     * MongoDB update failed, remove the
     * incomplete new Cloudinary asset.
     */
    if (
      newCloudinaryPublicId
    ) {
      try {
        await deleteCloudinaryPdf(
          newCloudinaryPublicId
        );
      } catch (cleanupError) {
        console.error(
          "Incomplete Cloudinary PDF cleanup error:",
          cleanupError
        );
      }
    }

    const possibleStatusCode =
      Number(
        error?.http_code ||
          error?.statusCode
      );

    const statusCode =
      possibleStatusCode >= 400 &&
      possibleStatusCode <= 599
        ? possibleStatusCode
        : 500;

    return res
      .status(statusCode)
      .json({
        success: false,

        message:
          error.message ||
          "Failed to upload Portfolio PDF.",
      });
  } finally {
    await removeTemporaryFile(
      req.file?.path
    );
  }
};

/* =====================================================
   GET CURRENT PORTFOLIO INFORMATION

   GET /api/query/portfolio-info
===================================================== */

const getPortfolioInfo = async (
  req,
  res
) => {
  try {
    const portfolioPdf =
      await PortfolioPdf.findOne({
        key: PORTFOLIO_KEY,
      }).lean();

    if (!portfolioPdf) {
      return res.status(404).json({
        success: false,

        message:
          "Portfolio PDF has not been uploaded.",
      });
    }

    const backendBaseUrl =
      getBackendBaseUrl(req);

    const downloadUrl =
      `${backendBaseUrl}/api/query/download`;

    return res.status(200).json({
      success: true,

      message:
        "Portfolio PDF information fetched successfully.",

      data: {
        fileName:
          portfolioPdf.originalName ||
          DEFAULT_PDF_NAME,

        pdfUrl:
          portfolioPdf.pdfUrl,

        bytes:
          portfolioPdf.bytes ||
          0,

        sizeInMB: Number(
          (
            (portfolioPdf.bytes ||
              0) /
            (1024 * 1024)
          ).toFixed(2)
        ),

        uploadedAt:
          portfolioPdf.uploadedAt,

        updatedAt:
          portfolioPdf.updatedAt,

        downloadUrl,
      },
    });
  } catch (error) {
    console.error(
      "Get Portfolio information error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Failed to fetch Portfolio information.",
    });
  }
};

/* =====================================================
   DOWNLOAD LATEST PORTFOLIO PDF

   GET /api/query/download
===================================================== */

const downloadPortfolio = async (
  req,
  res
) => {
  try {
    const portfolioPdf =
      await PortfolioPdf.findOne({
        key: PORTFOLIO_KEY,
      }).lean();

    if (!portfolioPdf?.pdfUrl) {
      return res.status(404).json({
        success: false,

        message:
          "Portfolio PDF is not available.",
      });
    }

    const cloudinaryResponse =
      await fetch(
        portfolioPdf.pdfUrl,
        {
          method: "GET",
          cache: "no-store",

          headers: {
            Accept:
              "application/pdf,application/octet-stream",
          },
        }
      );

    if (
      !cloudinaryResponse.ok
    ) {
      throw new Error(
        `Cloudinary PDF request failed with status ${cloudinaryResponse.status}.`
      );
    }

    if (
      !cloudinaryResponse.body
    ) {
      throw new Error(
        "Cloudinary returned an empty PDF response."
      );
    }

    const safeFileName =
      sanitizePdfFileName(
        portfolioPdf.originalName
      );

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeFileName}"; filename*=UTF-8''${encodeURIComponent(
        safeFileName
      )}`
    );

    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );

    res.setHeader(
      "Pragma",
      "no-cache"
    );

    res.setHeader(
      "Expires",
      "0"
    );

    res.setHeader(
      "Surrogate-Control",
      "no-store"
    );

    const contentLength =
      cloudinaryResponse.headers.get(
        "content-length"
      );

    if (contentLength) {
      res.setHeader(
        "Content-Length",
        contentLength
      );
    }

    /*
     * Stream the PDF instead of loading
     * the complete PDF into backend RAM.
     */
    const cloudinaryNodeStream =
      Readable.fromWeb(
        cloudinaryResponse.body
      );

    await pipeline(
      cloudinaryNodeStream,
      res
    );

    return;
  } catch (error) {
    console.error(
      "Portfolio PDF download error:",
      error
    );

    if (res.headersSent) {
      res.destroy(error);
      return;
    }

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Failed to download Portfolio PDF.",
    });
  }
};

export {
  createQuery,
  getAllQueries,
  deleteQuery,
  uploadPortfolio,
  getPortfolioInfo,
  downloadPortfolio,
};