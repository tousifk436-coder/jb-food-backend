// // import multer from "multer";
// // import path from "path";
// // import fs from "fs";

// // const uploadPath = path.join(process.cwd(), "uploads", "pdfs");

// // if (!fs.existsSync(uploadPath)) {
// //   fs.mkdirSync(uploadPath, { recursive: true });
// // }

// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, uploadPath);
// //   },

// //   filename: (req, file, cb) => {
// //     const uniqueName = `${Date.now()}-${Math.round(
// //       Math.random() * 1e9
// //     )}${path.extname(file.originalname)}`;

// //     cb(null, uniqueName);
// //   },
// // });

// // const fileFilter = (req, file, cb) => {
// //   if (file.mimetype === "application/pdf") {
// //     cb(null, true);
// //   } else {
// //     cb(new Error("Only PDF files are allowed"), false);
// //   }
// // };

// // const upload = multer({
// //   storage,
// //   fileFilter,
// //   limits: {
// //     fileSize: 5 * 1024 * 1024,
// //   },
// // });

// // export default upload;

// import multer from "multer";
// import path from "path";
// import fs from "fs";

// const uploadPath = path.join(process.cwd(), "uploads", "pdfs");

// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath, {
//     recursive: true,
//   });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadPath);
//   },

//   filename: (req, file, cb) => {
//     cb(null, "portfolio.pdf");
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const isPdf =
//     file.mimetype === "application/pdf" &&
//     path.extname(file.originalname).toLowerCase() === ".pdf";

//   if (!isPdf) {
//     return cb(new Error("Only PDF files are allowed"), false);
//   }

//   cb(null, true);
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 10 * 1024 * 1024,
//   },
// });

// export default upload;

import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = path.join(
  process.cwd(),
  "uploads",
  "pdfs"
);

// Create folder automatically
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    // New PDF replaces the previous portfolio
    cb(null, "portfolio.pdf");
  },
});

const fileFilter = (req, file, cb) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  const isPdf =
    file.mimetype === "application/pdf" &&
    extension === ".pdf";

  if (!isPdf) {
    return cb(
      new Error("Only PDF files are allowed"),
      false
    );
  }

  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

export default upload;