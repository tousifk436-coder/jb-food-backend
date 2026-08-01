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

const specificationSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },

    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const variantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    order: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: true,
  }
);

const seoSchema = new mongoose.Schema(
  {
    metaTitle: {
      type: String,
      trim: true,
      default: "",
    },

    metaDescription: {
      type: String,
      trim: true,
      default: "",
    },

    metaKeywords: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    shortDescription: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    mainImage: {
      type: imageSchema,
      required: true,
    },

    galleryImages: {
      type: [imageSchema],
      default: [],
    },

    features: {
      type: [String],
      default: [],
    },

    applications: {
      type: [String],
      default: [],
    },

    packagingOptions: {
      type: [String],
      default: [],
    },

    qualityNotes: {
      type: [String],
      default: [],
    },

    specifications: {
      type: [specificationSchema],
      default: [],
    },

    variants: {
      type: [variantSchema],
      default: [],
    },

    origin: {
      type: String,
      trim: true,
      default: "",
    },

    minimumOrderQuantity: {
      type: String,
      trim: true,
      default: "",
    },

    availability: {
      type: String,
      trim: true,
      default: "",
    },

    enquiryButtonLabel: {
      type: String,
      trim: true,
      default: "Send Enquiry",
    },

    enquiryButtonUrl: {
      type: String,
      trim: true,
      default: "bulk-order.html",
    },

    seo: {
      type: seoSchema,
      default: () => ({}),
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    showOnHome: {
      type: Boolean,
      default: false,
      index: true,
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

productSchema.index({
  isActive: 1,
  isFeatured: 1,
  showOnHome: 1,
  order: 1,
});

productSchema.index({
  name: "text",
  shortDescription: "text",
  description: "text",
});

const Product = mongoose.model(
  "Product",
  productSchema
);

export default Product;