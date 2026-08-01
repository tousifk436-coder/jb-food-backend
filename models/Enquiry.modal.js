import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    company: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    country: {
      type: String,
      trim: true,
      default: "",
    },

    subject: {
      type: String,
      trim: true,
      default: "",
    },

    tradeType: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    category: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    product: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    quantity: {
      type: String,
      trim: true,
      default: "",
    },

    packaging: {
      type: String,
      trim: true,
      default: "",
    },

    destination: {
      type: String,
      trim: true,
      default: "",
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    source: {
      type: String,
      enum: [
        "Home Page",
        "Contact Page",
        "Business Enquiry Page",
        "Product Page",
        "Other",
      ],
      default: "Other",
      index: true,
    },

    status: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "In Discussion",
        "Quoted",
        "Closed",
        "Rejected",
      ],
      default: "New",
      index: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    adminNotes: {
      type: String,
      trim: true,
      default: "",
    },

    ipAddress: {
      type: String,
      trim: true,
      default: "",
    },

    userAgent: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

enquirySchema.index({
  status: 1,
  isRead: 1,
  createdAt: -1,
});

enquirySchema.index({
  source: 1,
  createdAt: -1,
});

const Enquiry = mongoose.model(
  "Enquiry",
  enquirySchema
);

export default Enquiry;