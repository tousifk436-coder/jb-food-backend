import mongoose from "mongoose";

const portfolioPdfSchema =
  new mongoose.Schema(
    {
      /*
       * Only one document will be maintained
       * for the main Portfolio PDF.
       */
      key: {
        type: String,
        required: true,
        unique: true,
        default: "main-portfolio",
        trim: true,
      },

      pdfUrl: {
        type: String,
        required: true,
        trim: true,
      },

      publicId: {
        type: String,
        required: true,
        trim: true,
      },

      assetId: {
        type: String,
        default: "",
        trim: true,
      },

      resourceType: {
        type: String,
        default: "raw",
        trim: true,
      },

      originalName: {
        type: String,
        default: "ARV-Portfolio.pdf",
        trim: true,
      },

      bytes: {
        type: Number,
        default: 0,
        min: 0,
      },

      cloudinaryVersion: {
        type: Number,
        default: 0,
      },

      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "PortfolioPdf",
  portfolioPdfSchema
);