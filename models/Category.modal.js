import mongoose from "mongoose";

const categoryImageSchema = new mongoose.Schema(
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

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },

    shortDescription: {
      type: String,
      trim: true,
      default: "",
    },

    image: {
      type: categoryImageSchema,
      required: true,
    },

    icon: {
      type: String,
      trim: true,
      default: "",
    },

    showOnHome: {
      type: Boolean,
      default: true,
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

categorySchema.index({
  isActive: 1,
  showOnHome: 1,
  order: 1,
});

const Category = mongoose.model(
  "Category",
  categorySchema
);

export default Category;