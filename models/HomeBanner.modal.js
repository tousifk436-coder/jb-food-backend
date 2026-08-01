import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      required: true,
      trim: true,
    },

    alt: {
      type: String,
      trim: true,
      default: "",
    },

    width: {
      type: Number,
      default: 0,
    },

    height: {
      type: Number,
      default: 0,
    },

    format: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const buttonSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      trim: true,
      default: "",
    },

    url: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const homeBannerSchema = new mongoose.Schema(
  {
    eyebrow: {
      type: String,
      trim: true,
      default: "",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    highlightedText: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    desktopImage: {
      type: imageSchema,
      required: true,
    },

    mobileImage: {
      type: imageSchema,
      default: null,
    },

    primaryButton: {
      type: buttonSchema,
      default: () => ({
        label: "Explore Products",
        url: "products.html",
      }),
    },

    secondaryButton: {
      type: buttonSchema,
      default: () => ({
        label: "Send Enquiry",
        url: "bulk-order.html",
      }),
    },

    textAlignment: {
      type: String,
      enum: ["left", "center", "right"],
      default: "left",
    },

    overlayOpacity: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.25,
    },

    order: {
      type: Number,
      default: 0,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

homeBannerSchema.index({
  isActive: 1,
  order: 1,
  createdAt: -1,
});

const HomeBanner = mongoose.model(
  "HomeBanner",
  homeBannerSchema
);

export default HomeBanner;