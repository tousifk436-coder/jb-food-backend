import multer from "multer";
import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";

const temporaryUploadDirectory = path.join(
  os.tmpdir(),
  "arv-portfolio-pdf-uploads"
);

/*
 * Temporary disk storage is used instead
 * of memoryStorage so that large PDFs are
 * not loaded completely into server RAM.
 */
const storage = multer.diskStorage({
  destination: (
    req,
    file,
    callback
  ) => {
    try {
      fs.mkdirSync(
        temporaryUploadDirectory,
        {
          recursive: true,
        }
      );

      callback(
        null,
        temporaryUploadDirectory
      );
    } catch (error) {
      callback(error);
    }
  },

  filename: (
    req,
    file,
    callback
  ) => {
    const temporaryFileName =
      `${Date.now()}-${crypto.randomUUID()}.pdf`;

    callback(
      null,
      temporaryFileName
    );
  },
});

const pdfFileFilter = (
  req,
  file,
  callback
) => {
  const extension = path
    .extname(file.originalname || "")
    .toLowerCase();

  const acceptedMimeTypes = [
    "application/pdf",
    "application/x-pdf",
    "application/octet-stream",
  ];

  const hasPdfExtension =
    extension === ".pdf";

  const hasAcceptedMimeType =
    acceptedMimeTypes.includes(
      file.mimetype
    );

  if (
    !hasPdfExtension ||
    !hasAcceptedMimeType
  ) {
    return callback(
      new Error(
        "Only PDF files are allowed."
      ),
      false
    );
  }

  callback(null, true);
};

const uploadPortfolioPdf = multer({
  storage,
  fileFilter: pdfFileFilter,

  /*
   * No fileSize limit is defined here.
   * Cloudinary and hosting limits will
   * determine the final allowed size.
   */
});

export {
  uploadPortfolioPdf,
};