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

const socialLinksSchema = new mongoose.Schema(
  {
    facebook: {
      type: String,
      trim: true,
      default: "",
    },

    instagram: {
      type: String,
      trim: true,
      default: "",
    },

    linkedin: {
      type: String,
      trim: true,
      default: "",
    },

    twitter: {
      type: String,
      trim: true,
      default: "",
    },

    youtube: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const siteSettingSchema = new mongoose.Schema(
  {
    /*
      This key ensures only one main website-settings
      document exists.
    */
    siteKey: {
      type: String,
      default: "main",
      unique: true,
      immutable: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
      default: "JB General Exports LLP",
    },

    tagline: {
      type: String,
      trim: true,
      default: "Import • Export • Global Trade",
    },

    logo: {
      type: imageSchema,
      default: null,
    },

    primaryPhone: {
      type: String,
      trim: true,
      default: "",
    },

    alternatePhone: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    alternateEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    whatsappNumber: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    topBarText: {
      type: String,
      trim: true,
      default: "",
    },

    footerDescription: {
      type: String,
      trim: true,
      default: "",
    },

    businessHours: {
      type: String,
      trim: true,
      default: "",
    },

    socialLinks: {
      type: socialLinksSchema,
      default: () => ({}),
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const SiteSetting = mongoose.model(
  "SiteSetting",
  siteSettingSchema
);

export default SiteSetting;