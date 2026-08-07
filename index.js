import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import uploadRoutes from "./router/uploadRoutes.js";

import connectDB from "./config/db.js";
import authRoutes from "./router/authRoutes.js";
import homeBannerRoutes from "./router/homeBannerRoutes.js";

import categoryRoutes from "./router/categoryRoutes.js";
import productRoutes from "./router/productRoutes.js";
import faqRoutes from "./router/faqRoutes.js";
import siteSettingRoutes from "./router/siteSettingRoutes.js";
import enquiryRoutes from "./router/enquiryRoutes.js";
import dashboardRoutes from "./router/dashboardRoutes.js";
import testimonialRoutes from "./router/testimonialRoutes.js";

/* =====================================================
   ENVIRONMENT CONFIGURATION
===================================================== */

dotenv.config();

const app = express();

/* =====================================================
   CORS CONFIGURATION

   No CLIENT_URL environment variable is required.
===================================================== */

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

/* =====================================================
   REQUEST BODY CONFIGURATION
===================================================== */

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

/* =====================================================
   API ROUTES
===================================================== */
app.use("/api/auth", authRoutes);
app.use("/api/home-banners", homeBannerRoutes);
app.use("/api/categories", categoryRoutes);
app.use(
  "/api/products",
  productRoutes
);
app.use("/api/faqs", faqRoutes);
app.use(
  "/api/site-settings",
  siteSettingRoutes
);
app.use(
  "/api/enquiries",
  enquiryRoutes
);
app.use(
  "/api/dashboard",
  dashboardRoutes
);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/upload", uploadRoutes);
/*
 * New JB General Exports APIs will be added here:
 *
 * app.use("/api/home-banners", homeBannerRoutes);
 * app.use("/api/categories", categoryRoutes);
 * app.use("/api/products", productRoutes);
 * app.use("/api/faqs", faqRoutes);
 * app.use("/api/site-settings", siteSettingRoutes);
 * app.use("/api/enquiries", enquiryRoutes);
 */

/* =====================================================
   ROOT ROUTE
===================================================== */

app.get("/", (req, res) => {
  const baseUrl = (
    process.env.BASE_URL ||
    `${req.protocol}://${req.get("host")}`
  ).replace(/\/$/, "");

  return res.status(200).json({
    success: true,
    message:
      "JB General Exports LLP Backend API is running",
    baseUrl,
  });
});

/* =====================================================
   HEALTH CHECK
===================================================== */

app.get(
  "/api/health",
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Server is healthy",
      databaseConnected: true,
      timestamp: new Date().toISOString(),
    });
  }
);

/* =====================================================
   ROUTE NOT FOUND
===================================================== */

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message:
      `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/* =====================================================
   GLOBAL ERROR HANDLER
===================================================== */

app.use(
  (error, req, res, next) => {
    console.error(
      "Global server error:",
      error
    );

    if (
      error.code === "LIMIT_FILE_SIZE"
    ) {
      return res.status(413).json({
        success: false,
        message:
          "Uploaded image is too large.",
      });
    }

    if (
      error.code ===
      "LIMIT_UNEXPECTED_FILE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Unexpected file field name.",
      });
    }

    if (
      error instanceof SyntaxError &&
      error.status === 400 &&
      "body" in error
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid JSON request body.",
      });
    }

    const statusCode =
      Number(error.statusCode) >= 400 &&
      Number(error.statusCode) <= 599
        ? Number(error.statusCode)
        : Number(error.status) >= 400 &&
            Number(error.status) <= 599
          ? Number(error.status)
          : 500;

    return res
      .status(statusCode)
      .json({
        success: false,
        message:
          error.message ||
          "Internal server error",
      });
  }
);

/* =====================================================
   START SERVER
===================================================== */

const PORT =
  Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      const baseUrl = (
        process.env.BASE_URL ||
        `http://localhost:${PORT}`
      ).replace(/\/$/, "");

      console.log(
        `🚀 Server running on port ${PORT}`
      );

      console.log(
        `🌐 API URL: ${baseUrl}`
      );

      console.log(
        `🔐 Authentication API: ${baseUrl}/api/auth`
      );
    });
  } catch (error) {
    console.error(
      "❌ Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();