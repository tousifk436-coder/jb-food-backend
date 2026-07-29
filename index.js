// // // // import express from "express";
// // // // import dotenv from "dotenv";
// // // // import connectDB from "./config/db.js";
// // // // import cors from "cors";
// // // // import authRoutes from "./router/authRoutes.js";
// // // // import uploadRoutes from "./router/uploadRoutes.js";
// // // // import galleryRoutes from "./router/galleryRoutes.js";
// // // // import contactPageRoutes from "./router/contactPageRoutes.js";
// // // // import testimonialsRoutes from "./router/testimonialsRoutes.js";
// // // // import homeSliderRoutes from "./router/homeSliderRoutes.js";
// // // // import blogRoutes from "./router/blogRoutes.js";
// // // // import dashboardRoutes from "./router/dashboardRoutes.js";
// // // // import commentRoutes from "./router/commentRoutes.js";
// // // // import bookConsultationRoutes from "./router/bookConsultationRoutes.js";
// // // // import portfolioRoutes from "./router/portfolioRoutes.js";
// // // // import { generalLimiter, authLimiter } from "./middlewares/rateLimiter.js";
// // // // import queryRoutes from "./router/queryRoutes.js";
// // // // // Load environment variables
// // // // dotenv.config();
// // // // const app = express();

// // // // // CORS Configuration

// // // // // ARV-backend/index.js
// // // // // const allowedOrigins = [
// // // // //   "http://localhost:5173", // admin (React)
// // // // //   "http://localhost:5500", // website (Live Server)
// // // // //   "http://127.0.0.1:5500", // website (alternate)
// // // // //   process.env.CLIENT_URL,
// // // // // ].filter(Boolean);

// // // // // app.use(
// // // // //   cors({
// // // // //     origin: function (origin, callback) {
// // // // //       if (!origin || allowedOrigins.includes(origin)) {
// // // // //         callback(null, true);
// // // // //       } else {
// // // // //         callback(new Error("Not allowed by CORS"));
// // // // //       }
// // // // //     },
// // // // //     credentials: true,
// // // // //   }),
// // // // // );

// // // // const clientUrl = process.env.CLIENT_URL;
// // // // app.use(
// // // //   cors({
// // // //     // origin: clientUrl || "*",
// // // //     origin: clientUrl || "http://localhost:5173",
// // // //     credentials: true,
// // // //   }),
// // // // );

// // // // // app.use(express.json());
// // // // app.use(express.json({ limit: "50mb" }));
// // // // app.use(express.urlencoded({ limit: "50mb", extended: true }));

// // // // // Rate Limiters
// // // // // app.use("/api/auth", authLimiter);   // strict — OTP/login routes
// // // // // app.use("/api", generalLimiter);     // general — baaki sab routes

// // // // // Routes
// // // // app.use("/api/auth", authRoutes);
// // // // app.use("/api/upload", uploadRoutes);
// // // // app.use("/api/gallery", galleryRoutes);
// // // // app.use("/api/contact", contactPageRoutes);
// // // // app.use("/api/testimonials", testimonialsRoutes);
// // // // app.use("/api/homeSlider", homeSliderRoutes);
// // // // app.use("/api/blogs", blogRoutes);
// // // // app.use("/api/dashboard", dashboardRoutes);
// // // // app.use("/api/comments", commentRoutes);
// // // // app.use("/api/bookConslution", bookConsultationRoutes);
// // // // app.use("/api/portfolio", portfolioRoutes);
// // // // app.use("/api/query", queryRoutes);

// // // // const PORT = process.env.PORT || 5000;
// // // // // Start the server and connect to the database
// // // // app.listen(PORT, () => {
// // // //   console.log(`🚀 Server running on port ${PORT}`);
// // // //   connectDB();
// // // // });


// // // import express from "express";
// // // import dotenv from "dotenv";
// // // import cors from "cors";
// // // import path from "path";

// // // import connectDB from "./config/db.js";

// // // import authRoutes from "./router/authRoutes.js";
// // // import uploadRoutes from "./router/uploadRoutes.js";
// // // import galleryRoutes from "./router/galleryRoutes.js";
// // // import contactPageRoutes from "./router/contactPageRoutes.js";
// // // import testimonialsRoutes from "./router/testimonialsRoutes.js";
// // // import homeSliderRoutes from "./router/homeSliderRoutes.js";
// // // import blogRoutes from "./router/blogRoutes.js";
// // // import dashboardRoutes from "./router/dashboardRoutes.js";
// // // import commentRoutes from "./router/commentRoutes.js";
// // // import bookConsultationRoutes from "./router/bookConsultationRoutes.js";
// // // import portfolioRoutes from "./router/portfolioRoutes.js";
// // // import queryRoutes from "./router/queryRoutes.js";

// // // import {
// // //   generalLimiter,
// // //   authLimiter,
// // // } from "./middlewares/rateLimiter.js";

// // // // Load environment variables
// // // dotenv.config();

// // // const app = express();

// // // /* =====================================================
// // //    CORS CONFIGURATION
// // // ===================================================== */

// // // const allowedOrigins = [
// // //   // React admin panel
// // //   "http://localhost:5173",

// // //   // Website using Live Server
// // //   "http://localhost:5500",
// // //   "http://127.0.0.1:5500",

// // //   // URLs from .env
// // //   process.env.CLIENT_URL,
// // //   process.env.ADMIN_URL,
// // //   process.env.WEBSITE_URL,
// // // ].filter(Boolean);

// // // app.use(
// // //   cors({
// // //     origin: (origin, callback) => {
// // //       // Allow Postman, mobile applications and server requests
// // //       if (!origin) {
// // //         return callback(null, true);
// // //       }

// // //       if (allowedOrigins.includes(origin)) {
// // //         return callback(null, true);
// // //       }

// // //       return callback(
// // //         new Error(`CORS blocked request from origin: ${origin}`),
// // //       );
// // //     },

// // //     credentials: true,

// // //     methods: [
// // //       "GET",
// // //       "POST",
// // //       "PUT",
// // //       "PATCH",
// // //       "DELETE",
// // //       "OPTIONS",
// // //     ],

// // //     allowedHeaders: [
// // //       "Content-Type",
// // //       "Authorization",
// // //     ],
// // //   }),
// // // );

// // // // Handle preflight requests
// // // app.options("*", cors());

// // // /* =====================================================
// // //    BODY PARSERS
// // // ===================================================== */

// // // app.use(
// // //   express.json({
// // //     limit: "50mb",
// // //   }),
// // // );

// // // app.use(
// // //   express.urlencoded({
// // //     limit: "50mb",
// // //     extended: true,
// // //   }),
// // // );

// // // /* =====================================================
// // //    PUBLIC STATIC FILES
// // // ===================================================== */

// // // // Makes files inside uploads folder publicly accessible
// // // //
// // // // Example:
// // // // http://localhost:5000/uploads/pdfs/portfolio.pdf

// // // app.use(
// // //   "/uploads",
// // //   express.static(
// // //     path.join(process.cwd(), "uploads"),
// // //   ),
// // // );

// // // /* =====================================================
// // //    RATE LIMITERS
// // // ===================================================== */

// // // // Enable these when required

// // // // Strict limiter for login and OTP routes
// // // // app.use("/api/auth", authLimiter);

// // // // General limiter for all API routes
// // // // app.use("/api", generalLimiter);

// // // /* =====================================================
// // //    API ROUTES
// // // ===================================================== */

// // // app.use("/api/auth", authRoutes);

// // // app.use("/api/upload", uploadRoutes);

// // // app.use("/api/gallery", galleryRoutes);

// // // app.use("/api/contact", contactPageRoutes);

// // // app.use("/api/testimonials", testimonialsRoutes);

// // // app.use("/api/homeSlider", homeSliderRoutes);

// // // app.use("/api/blogs", blogRoutes);

// // // app.use("/api/dashboard", dashboardRoutes);

// // // app.use("/api/comments", commentRoutes);

// // // app.use(
// // //   "/api/bookConslution",
// // //   bookConsultationRoutes,
// // // );

// // // app.use("/api/portfolio", portfolioRoutes);

// // // // Portfolio download lead/query routes
// // // app.use("/api/query", queryRoutes);

// // // /* =====================================================
// // //    BASIC SERVER ROUTE
// // // ===================================================== */

// // // app.get("/", (req, res) => {
// // //   return res.status(200).json({
// // //     success: true,
// // //     message: "ARV Backend API is running",
// // //   });
// // // });

// // // /* =====================================================
// // //    404 HANDLER
// // // ===================================================== */

// // // app.use((req, res) => {
// // //   return res.status(404).json({
// // //     success: false,
// // //     message: `Route not found: ${req.method} ${req.originalUrl}`,
// // //   });
// // // });

// // // /* =====================================================
// // //    GLOBAL ERROR HANDLER
// // // ===================================================== */

// // // app.use((error, req, res, next) => {
// // //   console.error("Global server error:", error);

// // //   // Multer file-size error
// // //   if (error.code === "LIMIT_FILE_SIZE") {
// // //     return res.status(400).json({
// // //       success: false,
// // //       message: "PDF file size must not exceed the allowed limit",
// // //     });
// // //   }

// // //   // Multer unexpected file field
// // //   if (error.code === "LIMIT_UNEXPECTED_FILE") {
// // //     return res.status(400).json({
// // //       success: false,
// // //       message:
// // //         "Unexpected file field. Use the field name 'pdf'.",
// // //     });
// // //   }

// // //   // Invalid PDF type or CORS error
// // //   if (
// // //     error.message === "Only PDF files are allowed" ||
// // //     error.message?.startsWith("CORS blocked")
// // //   ) {
// // //     return res.status(400).json({
// // //       success: false,
// // //       message: error.message,
// // //     });
// // //   }

// // //   return res.status(error.status || 500).json({
// // //     success: false,
// // //     message:
// // //       error.message || "Internal server error",
// // //   });
// // // });

// // // /* =====================================================
// // //    START SERVER
// // // ===================================================== */

// // // const PORT = process.env.PORT || 5000;

// // // const startServer = async () => {
// // //   try {
// // //     await connectDB();

// // //     app.listen(PORT, () => {
// // //       console.log(
// // //         `🚀 Server running on port ${PORT}`,
// // //       );

// // //       console.log(
// // //         `🌐 API URL: http://localhost:${PORT}`,
// // //       );

// // //       console.log(
// // //         `📄 Portfolio URL: http://localhost:${PORT}/uploads/pdfs/portfolio.pdf`,
// // //       );
// // //     });
// // //   } catch (error) {
// // //     console.error(
// // //       "❌ Server startup failed:",
// // //       error.message,
// // //     );

// // //     process.exit(1);
// // //   }
// // // };

// // // startServer();

// // import "dotenv/config";

// // import express from "express";
// // import cors from "cors";
// // import path from "path";

// // import connectDB from "./config/db.js";

// // import authRoutes from "./router/authRoutes.js";
// // import uploadRoutes from "./router/uploadRoutes.js";
// // import galleryRoutes from "./router/galleryRoutes.js";
// // import contactPageRoutes from "./router/contactPageRoutes.js";
// // import testimonialsRoutes from "./router/testimonialsRoutes.js";
// // import homeSliderRoutes from "./router/homeSliderRoutes.js";
// // import blogRoutes from "./router/blogRoutes.js";
// // import dashboardRoutes from "./router/dashboardRoutes.js";
// // import commentRoutes from "./router/commentRoutes.js";
// // import bookConsultationRoutes from "./router/bookConsultationRoutes.js";
// // import portfolioRoutes from "./router/portfolioRoutes.js";
// // import queryRoutes from "./router/queryRoutes.js";

// // const app = express();

// // /* =====================================================
// //    CORS CONFIGURATION
// // ===================================================== */

// // const environmentOrigins = [
// //   process.env.CLIENT_URL,
// //   process.env.ADMIN_URL,
// //   process.env.WEBSITE_URL,
// // ]
// //   .filter(Boolean)
// //   .flatMap((origin) =>
// //     origin.split(",").map((item) => item.trim())
// //   );

// // const allowedOrigins = [
// //   "http://localhost:5173",
// //   "http://localhost:5174",
// //   "http://localhost:5500",
// //   "http://127.0.0.1:5500",
// //   ...environmentOrigins,
// // ];

// // app.use(
// //   cors({
// //     origin: (origin, callback) => {
// //       // Allow Postman, mobile apps and server-to-server requests
// //       if (!origin) {
// //         return callback(null, true);
// //       }

// //       if (allowedOrigins.includes(origin)) {
// //         return callback(null, true);
// //       }

// //       return callback(
// //         new Error(
// //           `CORS blocked request from: ${origin}`
// //         )
// //       );
// //     },

// //     credentials: true,

// //     methods: [
// //       "GET",
// //       "POST",
// //       "PUT",
// //       "PATCH",
// //       "DELETE",
// //       "OPTIONS",
// //     ],

// //     allowedHeaders: [
// //       "Content-Type",
// //       "Authorization",
// //     ],
// //   })
// // );

// // /* =====================================================
// //    BODY PARSERS
// // ===================================================== */

// // app.use(
// //   express.json({
// //     limit: "50mb",
// //   })
// // );

// // app.use(
// //   express.urlencoded({
// //     limit: "50mb",
// //     extended: true,
// //   })
// // );

// // /* =====================================================
// //    PUBLIC UPLOADS
// // ===================================================== */

// // app.use(
// //   "/uploads",
// //   express.static(
// //     path.join(process.cwd(), "uploads")
// //   )
// // );

// // /* =====================================================
// //    API ROUTES
// // ===================================================== */

// // app.use("/api/auth", authRoutes);

// // app.use("/api/upload", uploadRoutes);

// // app.use("/api/gallery", galleryRoutes);

// // app.use("/api/contact", contactPageRoutes);

// // app.use("/api/testimonials", testimonialsRoutes);

// // app.use("/api/homeSlider", homeSliderRoutes);

// // app.use("/api/blogs", blogRoutes);

// // app.use("/api/dashboard", dashboardRoutes);

// // app.use("/api/comments", commentRoutes);

// // app.use(
// //   "/api/bookConslution",
// //   bookConsultationRoutes
// // );

// // app.use("/api/portfolio", portfolioRoutes);

// // app.use("/api/query", queryRoutes);

// // /* =====================================================
// //    SERVER STATUS
// // ===================================================== */

// // app.get("/", (req, res) => {
// //   return res.status(200).json({
// //     success: true,
// //     message: "ARV Backend API is running",
// //   });
// // });

// // /* =====================================================
// //    ROUTE NOT FOUND
// // ===================================================== */

// // app.use((req, res) => {
// //   return res.status(404).json({
// //     success: false,
// //     message: `Route not found: ${req.method} ${req.originalUrl}`,
// //   });
// // });

// // /* =====================================================
// //    GLOBAL ERROR HANDLER
// // ===================================================== */

// // app.use((error, req, res, next) => {
// //   console.error("Global server error:", error);

// //   if (error.code === "LIMIT_FILE_SIZE") {
// //     return res.status(400).json({
// //       success: false,
// //       message:
// //         "PDF file size must not exceed 10 MB",
// //     });
// //   }

// //   if (error.code === "LIMIT_UNEXPECTED_FILE") {
// //     return res.status(400).json({
// //       success: false,
// //       message:
// //         "Unexpected file field. Use the field name 'pdf'.",
// //     });
// //   }

// //   if (
// //     error.message === "Only PDF files are allowed"
// //   ) {
// //     return res.status(400).json({
// //       success: false,
// //       message: error.message,
// //     });
// //   }

// //   if (error.message?.startsWith("CORS blocked")) {
// //     return res.status(403).json({
// //       success: false,
// //       message: error.message,
// //     });
// //   }

// //   return res
// //     .status(error.status || 500)
// //     .json({
// //       success: false,
// //       message:
// //         error.message || "Internal server error",
// //     });
// // });

// // /* =====================================================
// //    START SERVER
// // ===================================================== */

// // const PORT = process.env.PORT || 5000;

// // const startServer = async () => {
// //   try {
// //     await connectDB();

// //     app.listen(PORT, () => {
// //       console.log(
// //         `🚀 Server running on port ${PORT}`
// //       );

// //       console.log(
// //         `🌐 API URL: http://localhost:${PORT}`
// //       );

// //       console.log(
// //         `📄 Portfolio download: http://localhost:${PORT}/api/query/download`
// //       );
// //     });
// //   } catch (error) {
// //     console.error(
// //       "❌ Server startup failed:",
// //       error.message
// //     );

// //     process.exit(1);
// //   }
// // };

// // startServer();

// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import path from "path";

// import connectDB from "./config/db.js";

// import authRoutes from "./router/authRoutes.js";
// import uploadRoutes from "./router/uploadRoutes.js";
// import galleryRoutes from "./router/galleryRoutes.js";
// import contactPageRoutes from "./router/contactPageRoutes.js";
// import testimonialsRoutes from "./router/testimonialsRoutes.js";
// import homeSliderRoutes from "./router/homeSliderRoutes.js";
// import blogRoutes from "./router/blogRoutes.js";
// import dashboardRoutes from "./router/dashboardRoutes.js";
// import commentRoutes from "./router/commentRoutes.js";
// import bookConsultationRoutes from "./router/bookConsultationRoutes.js";
// import portfolioRoutes from "./router/portfolioRoutes.js";
// import queryRoutes from "./router/queryRoutes.js";

// /* =====================================================
//    LOAD ENVIRONMENT VARIABLES
// ===================================================== */

// dotenv.config();

// /* =====================================================
//    CREATE EXPRESS APPLICATION
// ===================================================== */

// const app = express();

// /* =====================================================
//    CORS CONFIGURATION
// ===================================================== */

// const clientUrl = process.env.CLIENT_URL?.trim() || "*";

// /**
//  * CLIENT_URL can be:
//  *
//  * CLIENT_URL=*
//  *
//  * Or multiple URLs:
//  *
//  * CLIENT_URL=http://localhost:5173,http://localhost:5500
//  */

// const allowedOrigins =
//   clientUrl === "*"
//     ? []
//     : clientUrl
//         .split(",")
//         .map((origin) => origin.trim())
//         .filter(Boolean);

// const corsOptions = {
//   origin: (origin, callback) => {
//     // Allow Postman, mobile apps and server-to-server requests
//     if (!origin) {
//       return callback(null, true);
//     }

//     // Allow every frontend when CLIENT_URL=*
//     if (clientUrl === "*") {
//       return callback(null, true);
//     }

//     // Allow only configured origins
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }

//     return callback(
//       new Error(`CORS blocked request from origin: ${origin}`)
//     );
//   },

//   /**
//    * With CLIENT_URL=* credentials are disabled.
//    * JWT Authorization headers will still work.
//    */
//   credentials: clientUrl !== "*",

//   methods: [
//     "GET",
//     "POST",
//     "PUT",
//     "PATCH",
//     "DELETE",
//     "OPTIONS",
//   ],

//   allowedHeaders: [
//     "Content-Type",
//     "Authorization",
//     "X-Requested-With",
//   ],

//   exposedHeaders: ["Content-Disposition"],
// };

// app.use(cors(corsOptions));

// /* =====================================================
//    REQUEST BODY PARSERS
// ===================================================== */

// app.use(
//   express.json({
//     limit: "50mb",
//   })
// );

// app.use(
//   express.urlencoded({
//     extended: true,
//     limit: "50mb",
//   })
// );

// /* =====================================================
//    PUBLIC STATIC UPLOADS
// ===================================================== */

// /**
//  * Makes the uploads folder publicly accessible.
//  *
//  * Example:
//  * http://localhost:5000/uploads/pdfs/portfolio.pdf
//  */

// app.use(
//   "/uploads",
//   express.static(path.join(process.cwd(), "uploads"))
// );

// /* =====================================================
//    API ROUTES
// ===================================================== */

// app.use("/api/auth", authRoutes);

// app.use("/api/upload", uploadRoutes);

// app.use("/api/gallery", galleryRoutes);

// app.use("/api/contact", contactPageRoutes);

// app.use("/api/testimonials", testimonialsRoutes);

// app.use("/api/homeSlider", homeSliderRoutes);

// app.use("/api/blogs", blogRoutes);

// app.use("/api/dashboard", dashboardRoutes);

// app.use("/api/comments", commentRoutes);

// app.use(
//   "/api/bookConslution",
//   bookConsultationRoutes
// );

// app.use("/api/portfolio", portfolioRoutes);

// /**
//  * Query and portfolio PDF APIs:
//  *
//  * POST   /api/query
//  * GET    /api/query
//  * GET    /api/query/download
//  * GET    /api/query/portfolio-info
//  * POST   /api/query/upload-portfolio
//  * GET    /api/query/:id
//  * DELETE /api/query/:id
//  */

// app.use("/api/query", queryRoutes);

// /* =====================================================
//    SERVER STATUS ROUTE
// ===================================================== */

// app.get("/", (req, res) => {
//   return res.status(200).json({
//     success: true,
//     message: "ARV Backend API is running",
//     baseUrl:
//       process.env.BASE_URL ||
//       `${req.protocol}://${req.get("host")}`,
//   });
// });

// /* =====================================================
//    HEALTH CHECK ROUTE
// ===================================================== */

// app.get("/api/health", (req, res) => {
//   return res.status(200).json({
//     success: true,
//     message: "Server is healthy",
//     timestamp: new Date().toISOString(),
//   });
// });

// /* =====================================================
//    ROUTE NOT FOUND
// ===================================================== */

// app.use((req, res) => {
//   return res.status(404).json({
//     success: false,
//     message: `Route not found: ${req.method} ${req.originalUrl}`,
//   });
// });

// /* =====================================================
//    GLOBAL ERROR HANDLER
// ===================================================== */

// app.use((error, req, res, next) => {
//   console.error("Global server error:", error);

//   // Multer file-size error
//   if (error.code === "LIMIT_FILE_SIZE") {
//     return res.status(400).json({
//       success: false,
//       message: "PDF file size must not exceed 10 MB",
//     });
//   }

//   // Wrong Multer field name
//   if (error.code === "LIMIT_UNEXPECTED_FILE") {
//     return res.status(400).json({
//       success: false,
//       message:
//         "Unexpected file field. Use the field name 'pdf'.",
//     });
//   }

//   // PDF validation error
//   if (error.message === "Only PDF files are allowed") {
//     return res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }

//   // CORS error
//   if (error.message?.startsWith("CORS blocked")) {
//     return res.status(403).json({
//       success: false,
//       message: error.message,
//     });
//   }

//   return res.status(error.status || 500).json({
//     success: false,
//     message:
//       error.message || "Internal server error",
//   });
// });

// /* =====================================================
//    START SERVER
// ===================================================== */

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   try {
//     await connectDB();

//     app.listen(PORT, () => {
//       const baseUrl =
//         process.env.BASE_URL ||
//         `http://localhost:${PORT}`;

//       console.log(
//         `🚀 Server running on port ${PORT}`
//       );

//       console.log(`🌐 API URL: ${baseUrl}`);

//       console.log(
//         `📄 Portfolio download API: ${baseUrl}/api/query/download`
//       );

//       console.log(
//         `⬆️ Portfolio upload API: ${baseUrl}/api/query/upload-portfolio`
//       );

//       console.log(
//         `👥 Query list API: ${baseUrl}/api/query`
//       );
//     });
//   } catch (error) {
//     console.error(
//       "❌ Server startup failed:",
//       error.message
//     );

//     process.exit(1);
//   }
// };

// startServer();

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import connectDB from "./config/db.js";

import authRoutes from "./router/authRoutes.js";
import uploadRoutes from "./router/uploadRoutes.js";
import galleryRoutes from "./router/galleryRoutes.js";
import contactPageRoutes from "./router/contactPageRoutes.js";
import testimonialsRoutes from "./router/testimonialsRoutes.js";
import homeSliderRoutes from "./router/homeSliderRoutes.js";
import blogRoutes from "./router/blogRoutes.js";
import dashboardRoutes from "./router/dashboardRoutes.js";
import commentRoutes from "./router/commentRoutes.js";
import bookConsultationRoutes from "./router/bookConsultationRoutes.js";
import portfolioRoutes from "./router/portfolioRoutes.js";
import queryRoutes from "./router/queryRoutes.js";

/* =====================================================
   LOAD ENVIRONMENT VARIABLES
===================================================== */

dotenv.config();

/* =====================================================
   CREATE EXPRESS APPLICATION
===================================================== */

const app = express();

/*
 * Required when backend runs behind Render,
 * Nginx, IIS, or another reverse proxy.
 */
app.set("trust proxy", 1);

/* =====================================================
   CORS CONFIGURATION
===================================================== */

const clientUrl =
  process.env.CLIENT_URL?.trim() || "*";

/*
 * CLIENT_URL can be:
 *
 * CLIENT_URL=*
 *
 * Or multiple URLs:
 *
 * CLIENT_URL=http://localhost:5173,http://localhost:5500
 *
 * Live example:
 *
 * CLIENT_URL=https://your-admin.netlify.app,https://your-website.netlify.app
 */

const allowedOrigins =
  clientUrl === "*"
    ? []
    : clientUrl
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    /*
     * Allow requests without browser origin,
     * such as Postman, mobile applications,
     * server-to-server calls and curl.
     */
    if (!origin) {
      return callback(null, true);
    }

    /*
     * Allow all website origins when
     * CLIENT_URL is set to "*".
     */
    if (clientUrl === "*") {
      return callback(null, true);
    }

    /*
     * Allow configured frontend origins.
     */
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error(
        `CORS blocked request from origin: ${origin}`
      )
    );
  },

  /*
   * Credentials cannot be used with wildcard
   * Access-Control-Allow-Origin.
   */
  credentials: clientUrl !== "*",

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
    "X-Requested-With",
  ],

  exposedHeaders: [
    "Content-Disposition",
    "Content-Length",
  ],

  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

/* =====================================================
   REQUEST BODY PARSERS
===================================================== */

/*
 * These limits apply to JSON and URL-encoded
 * requests only.
 *
 * PDF uploads use multipart/form-data and are
 * handled separately by Multer.
 */
app.use(
  express.json({
    limit: "50mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

/* =====================================================
   PUBLIC STATIC UPLOADS
===================================================== */

/*
 * Keep this because other APIs may still use
 * local files from the uploads folder.
 *
 * The Portfolio PDF is now stored on Cloudinary
 * and does not depend on this folder.
 */
app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads")
  )
);

/* =====================================================
   API ROUTES
===================================================== */

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/upload",
  uploadRoutes
);

app.use(
  "/api/gallery",
  galleryRoutes
);

app.use(
  "/api/contact",
  contactPageRoutes
);

app.use(
  "/api/testimonials",
  testimonialsRoutes
);

app.use(
  "/api/homeSlider",
  homeSliderRoutes
);

app.use(
  "/api/blogs",
  blogRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/comments",
  commentRoutes
);

app.use(
  "/api/bookConslution",
  bookConsultationRoutes
);

app.use(
  "/api/portfolio",
  portfolioRoutes
);

/*
 * Query and Portfolio PDF APIs:
 *
 * POST   /api/query
 * GET    /api/query
 * POST   /api/query/upload-portfolio
 * GET    /api/query/portfolio-info
 * GET    /api/query/download
 * DELETE /api/query/:id
 *
 * No verifyJWT middleware is applied here.
 * Access is controlled inside queryRoutes.js.
 */
app.use(
  "/api/query",
  queryRoutes
);

/* =====================================================
   SERVER STATUS ROUTE
===================================================== */

app.get("/", (req, res) => {
  const baseUrl = (
    process.env.BASE_URL ||
    `${req.protocol}://${req.get("host")}`
  ).replace(/\/$/, "");

  return res.status(200).json({
    success: true,
    message: "ARV Backend API is running",
    baseUrl,
  });
});

/* =====================================================
   HEALTH CHECK ROUTE
===================================================== */

app.get(
  "/api/health",
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Server is healthy",
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

/*
 * Keep all four arguments.
 * Express identifies this as an error handler
 * because it contains error, req, res and next.
 */
app.use(
  (error, req, res, next) => {
    console.error(
      "Global server error:",
      error
    );

    /*
     * Multer or infrastructure-level file
     * size error.
     *
     * No application-level 10 MB limit is
     * configured for the Portfolio PDF.
     */
    if (
      error.code === "LIMIT_FILE_SIZE"
    ) {
      return res.status(413).json({
        success: false,
        message:
          "The uploaded file exceeds the maximum size supported by the server or Cloudinary account.",
      });
    }

    /*
     * Incorrect form-data field name.
     */
    if (
      error.code ===
      "LIMIT_UNEXPECTED_FILE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Unexpected file field. Use the field name 'pdf'.",
      });
    }

    /*
     * Invalid PDF upload.
     */
    if (
      error.message ===
        "Only PDF files are allowed." ||
      error.message ===
        "Only PDF files are allowed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only PDF files are allowed.",
      });
    }

    /*
     * CORS rejection.
     */
    if (
      error.message?.startsWith(
        "CORS blocked"
      )
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    /*
     * Invalid JSON body.
     */
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
      Number(error.status) >= 400 &&
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
  process.env.PORT || 5000;

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
        `📄 Portfolio download API: ${baseUrl}/api/query/download`
      );

      console.log(
        `⬆️ Portfolio upload API: ${baseUrl}/api/query/upload-portfolio`
      );

      console.log(
        `👥 Query list API: ${baseUrl}/api/query`
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