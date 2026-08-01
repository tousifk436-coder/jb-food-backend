import mongoose from "mongoose";

import Product from "../models/Product.modal.js";
import Category from "../models/Category.modal.js";

import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

import {
  uploadImageSourceToCloudinary,
  deleteCloudinaryImages,
} from "../utils/cloudinaryHelper.js";

/* =====================================================
   BASIC HELPERS
===================================================== */

const parseBoolean = (
  value,
  fallback = false
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return (
    String(value).toLowerCase() === "true"
  );
};

const parseNumber = (
  value,
  fallback = 0
) => {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
};

const escapeRegex = (value = "") => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

const createSlug = (value = "") => {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/* =====================================================
   ARRAY PARSERS

   Supports:
   ["Item 1", "Item 2"]

   Or:
   Item 1, Item 2

   Or values separated using new lines.
===================================================== */

const parseStringArray = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) =>
        String(item || "").trim()
      )
      .filter(Boolean);
  }

  const text = String(value).trim();

  if (!text) {
    return [];
  }

  try {
    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) =>
          String(item || "").trim()
        )
        .filter(Boolean);
    }
  } catch {
    // Continue with comma/new-line parsing.
  }

  return text
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseObjectArray = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(
      String(value)
    );

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    const error = new Error(
      "Specifications and variants must be valid JSON arrays"
    );

    error.statusCode = 400;

    throw error;
  }
};

/* =====================================================
   DATABASE HELPERS
===================================================== */

const getUniqueSlug = async (
  value,
  excludedProductId = null
) => {
  const baseSlug = createSlug(value);

  if (!baseSlug) {
    const error = new Error(
      "Unable to generate product slug"
    );

    error.statusCode = 400;

    throw error;
  }

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const filter = {
      slug,
    };

    if (excludedProductId) {
      filter._id = {
        $ne: excludedProductId,
      };
    }

    const existingProduct =
      await Product.exists(filter);

    if (!existingProduct) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
};

const findCategory = async (
  categoryValue
) => {
  const value = String(
    categoryValue || ""
  ).trim();

  if (!value) {
    return null;
  }

  if (
    mongoose.Types.ObjectId.isValid(
      value
    )
  ) {
    return Category.findById(value);
  }

  return Category.findOne({
    $or: [
      {
        slug: value.toLowerCase(),
      },
      {
        name: {
          $regex: new RegExp(
            `^${escapeRegex(value)}$`,
            "i"
          ),
        },
      },
    ],
  });
};

/* =====================================================
   IMAGE HELPERS
===================================================== */

const buildImageData = (
  uploadResult,
  alt = ""
) => {
  return {
    url: uploadResult.url,
    publicId: uploadResult.publicId,
    width: uploadResult.width,
    height: uploadResult.height,
    format: uploadResult.format,
    alt: String(alt || "").trim(),
  };
};

const uploadGalleryImages = async ({
  files = [],
  imageUrls = [],
  imageAlts = [],
  fallbackAlt = "",
  uploadedPublicIds = [],
}) => {
  const uploadedGallery = [];
  let altIndex = 0;

  for (const file of files) {
    const uploaded =
      await uploadImageSourceToCloudinary({
        file,

        folder:
          "jb-general-exports/products/gallery",
      });

    uploadedPublicIds.push(
      uploaded.publicId
    );

    uploadedGallery.push(
      buildImageData(
        uploaded,
        imageAlts[altIndex] ||
          fallbackAlt
      )
    );

    altIndex += 1;
  }

  for (const imageUrl of imageUrls) {
    const uploaded =
      await uploadImageSourceToCloudinary({
        imageUrl,

        folder:
          "jb-general-exports/products/gallery",
      });

    uploadedPublicIds.push(
      uploaded.publicId
    );

    uploadedGallery.push(
      buildImageData(
        uploaded,
        imageAlts[altIndex] ||
          fallbackAlt
      )
    );

    altIndex += 1;
  }

  return uploadedGallery;
};

/* =====================================================
   CREATE PRODUCT
===================================================== */

const createProduct = asyncHandler(
  async (req, res) => {
    const {
      name,
      slug,
      category,
      shortDescription,
      description,
      mainImageUrl,
      mainImageAlt,
      origin,
      minimumOrderQuantity,
      availability,
      enquiryButtonLabel,
      enquiryButtonUrl,
      metaTitle,
      metaDescription,
      order,
      isFeatured,
      showOnHome,
      isActive,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Product name is required"
        )
      );
    }

    if (!category) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Product category is required"
        )
      );
    }

    const categoryDocument =
      await findCategory(category);

    if (!categoryDocument) {
      return res.status(404).json(
        new apiResponse(
          404,
          null,
          "Selected category was not found"
        )
      );
    }

    const duplicateProduct =
      await Product.findOne({
        name: {
          $regex: new RegExp(
            `^${escapeRegex(
              name.trim()
            )}$`,
            "i"
          ),
        },
      });

    if (duplicateProduct) {
      return res.status(409).json(
        new apiResponse(
          409,
          null,
          "Product with this name already exists"
        )
      );
    }

    const mainImageFile =
      req.files?.mainImage?.[0];

    if (
      !mainImageFile &&
      !String(
        mainImageUrl || ""
      ).trim()
    ) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Upload mainImage or provide mainImageUrl"
        )
      );
    }

    const finalSlug =
      await getUniqueSlug(
        slug?.trim() || name.trim()
      );

    const galleryFiles =
      req.files?.galleryImages || [];

    const galleryImageUrls =
      parseStringArray(
        req.body.galleryImageUrls
      );

    const galleryImageAlts =
      parseStringArray(
        req.body.galleryImageAlts
      );

    const uploadedPublicIds = [];

    try {
      const uploadedMainImage =
        await uploadImageSourceToCloudinary({
          file: mainImageFile,

          imageUrl: String(
            mainImageUrl || ""
          ).trim(),

          folder:
            "jb-general-exports/products/main",
        });

      uploadedPublicIds.push(
        uploadedMainImage.publicId
      );

      const uploadedGalleryImages =
        await uploadGalleryImages({
          files: galleryFiles,

          imageUrls:
            galleryImageUrls,

          imageAlts:
            galleryImageAlts,

          fallbackAlt:
            name.trim(),

          uploadedPublicIds,
        });

      const product =
        await Product.create({
          name: name.trim(),

          slug: finalSlug,

          category:
            categoryDocument._id,

          shortDescription:
            shortDescription?.trim() ||
            "",

          description:
            description?.trim() || "",

          mainImage: buildImageData(
            uploadedMainImage,
            mainImageAlt || name
          ),

          galleryImages:
            uploadedGalleryImages,

          features: parseStringArray(
            req.body.features
          ),

          applications:
            parseStringArray(
              req.body.applications
            ),

          packagingOptions:
            parseStringArray(
              req.body
                .packagingOptions
            ),

          qualityNotes:
            parseStringArray(
              req.body.qualityNotes
            ),

          specifications:
            parseObjectArray(
              req.body.specifications
            ),

          variants: parseObjectArray(
            req.body.variants
          ),

          origin:
            origin?.trim() || "",

          minimumOrderQuantity:
            minimumOrderQuantity?.trim() ||
            "",

          availability:
            availability?.trim() || "",

          enquiryButtonLabel:
            enquiryButtonLabel?.trim() ||
            "Send Enquiry",

          enquiryButtonUrl:
            enquiryButtonUrl?.trim() ||
            "bulk-order.html",

          seo: {
            metaTitle:
              metaTitle?.trim() || "",

            metaDescription:
              metaDescription?.trim() ||
              "",

            metaKeywords:
              parseStringArray(
                req.body.metaKeywords
              ),
          },

          isFeatured:
            parseBoolean(
              isFeatured,
              false
            ),

          showOnHome:
            parseBoolean(
              showOnHome,
              false
            ),

          order: parseNumber(order, 0),

          isActive: parseBoolean(
            isActive,
            true
          ),
        });

      await product.populate(
        "category",
        "name slug image"
      );

      return res.status(201).json(
        new apiResponse(
          201,
          product,
          "Product created successfully"
        )
      );
    } catch (error) {
      await deleteCloudinaryImages(
        uploadedPublicIds
      );

      throw error;
    }
  }
);

/* =====================================================
   GET PUBLIC PRODUCTS
===================================================== */

const getProducts = asyncHandler(
  async (req, res) => {
    const {
      page = 1,
      limit = 12,
      search = "",
      category,
      featured,
      showOnHome,
      sortBy = "order",
    } = req.query;

    const pageNumber = Math.max(
      1,
      Number(page) || 1
    );

    const limitNumber = Math.min(
      100,
      Math.max(
        1,
        Number(limit) || 12
      )
    );

    const filter = {
      isActive: true,
    };

    if (category) {
      const categoryDocument =
        await findCategory(category);

      if (!categoryDocument) {
        return res.status(404).json(
          new apiResponse(
            404,
            null,
            "Category not found"
          )
        );
      }

      filter.category =
        categoryDocument._id;
    }

    if (featured !== undefined) {
      filter.isFeatured =
        parseBoolean(featured);
    }

    if (showOnHome !== undefined) {
      filter.showOnHome =
        parseBoolean(showOnHome);
    }

    if (search.trim()) {
      const regex = new RegExp(
        escapeRegex(search.trim()),
        "i"
      );

      filter.$or = [
        {
          name: regex,
        },
        {
          shortDescription:
            regex,
        },
        {
          description: regex,
        },
        {
          features: regex,
        },
      ];
    }

    const sortOptions = {
      order: {
        order: 1,
        createdAt: -1,
      },

      recent: {
        createdAt: -1,
      },

      oldest: {
        createdAt: 1,
      },

      name: {
        name: 1,
      },
    };

    const selectedSort =
      sortOptions[sortBy] ||
      sortOptions.order;

    const totalProducts =
      await Product.countDocuments(
        filter
      );

    const products =
      await Product.find(filter)
        .populate(
          "category",
          "name slug image"
        )
        .sort(selectedSort)
        .skip(
          (pageNumber - 1) *
            limitNumber
        )
        .limit(limitNumber)
        .lean();

    return res.status(200).json(
      new apiResponse(
        200,
        {
          products,
          totalProducts,

          totalPages: Math.ceil(
            totalProducts /
              limitNumber
          ),

          currentPage: pageNumber,
        },
        "Products fetched successfully"
      )
    );
  }
);

/* =====================================================
   GET PRODUCT BY SLUG — PUBLIC
===================================================== */

const getProductBySlug = asyncHandler(
  async (req, res) => {
    const slug = String(
      req.params.slug || ""
    )
      .trim()
      .toLowerCase();

    const product =
      await Product.findOne({
        slug,
        isActive: true,
      })
        .populate(
          "category",
          "name slug image"
        )
        .lean();

    if (!product) {
      return res.status(404).json(
        new apiResponse(
          404,
          null,
          "Product not found"
        )
      );
    }

    return res.status(200).json(
      new apiResponse(
        200,
        product,
        "Product fetched successfully"
      )
    );
  }
);

/* =====================================================
   GET ALL PRODUCTS — ADMIN
===================================================== */

const getAllProducts = asyncHandler(
  async (req, res) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      category,
      isActive,
      isFeatured,
      showOnHome,
      sortBy = "order",
      isPagination = "true",
    } = req.query;

    const pageNumber = Math.max(
      1,
      Number(page) || 1
    );

    const limitNumber = Math.min(
      100,
      Math.max(
        1,
        Number(limit) || 10
      )
    );

    const filter = {};

    if (category) {
      const categoryDocument =
        await findCategory(category);

      if (!categoryDocument) {
        return res.status(404).json(
          new apiResponse(
            404,
            null,
            "Category not found"
          )
        );
      }

      filter.category =
        categoryDocument._id;
    }

    if (isActive !== undefined) {
      filter.isActive =
        parseBoolean(isActive);
    }

    if (isFeatured !== undefined) {
      filter.isFeatured =
        parseBoolean(isFeatured);
    }

    if (showOnHome !== undefined) {
      filter.showOnHome =
        parseBoolean(showOnHome);
    }

    if (search.trim()) {
      const regex = new RegExp(
        escapeRegex(search.trim()),
        "i"
      );

      filter.$or = [
        {
          name: regex,
        },
        {
          slug: regex,
        },
        {
          shortDescription:
            regex,
        },
      ];
    }

    const sortOptions = {
      order: {
        order: 1,
        createdAt: -1,
      },

      recent: {
        createdAt: -1,
      },

      oldest: {
        createdAt: 1,
      },

      name: {
        name: 1,
      },
    };

    const selectedSort =
      sortOptions[sortBy] ||
      sortOptions.order;

    const totalProducts =
      await Product.countDocuments(
        filter
      );

    let query = Product.find(filter)
      .populate(
        "category",
        "name slug image"
      )
      .sort(selectedSort);

    if (isPagination === "true") {
      query = query
        .skip(
          (pageNumber - 1) *
            limitNumber
        )
        .limit(limitNumber);
    }

    const products =
      await query.lean();

    return res.status(200).json(
      new apiResponse(
        200,
        {
          products,
          totalProducts,

          totalPages:
            isPagination === "true"
              ? Math.ceil(
                  totalProducts /
                    limitNumber
                )
              : 1,

          currentPage: pageNumber,
        },
        "All products fetched successfully"
      )
    );
  }
);

/* =====================================================
   GET PRODUCT BY ID — ADMIN
===================================================== */

const getProductById = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Invalid product ID"
        )
      );
    }

    const product =
      await Product.findById(id).populate(
        "category",
        "name slug image"
      );

    if (!product) {
      return res.status(404).json(
        new apiResponse(
          404,
          null,
          "Product not found"
        )
      );
    }

    return res.status(200).json(
      new apiResponse(
        200,
        product,
        "Product fetched successfully"
      )
    );
  }
);

/* =====================================================
   UPDATE PRODUCT
===================================================== */

const updateProduct = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Invalid product ID"
        )
      );
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json(
        new apiResponse(
          404,
          null,
          "Product not found"
        )
      );
    }

    let updatedName = product.name;

    if (req.body.name !== undefined) {
      updatedName = String(
        req.body.name
      ).trim();

      if (!updatedName) {
        return res.status(400).json(
          new apiResponse(
            400,
            null,
            "Product name cannot be empty"
          )
        );
      }

      const duplicateProduct =
        await Product.findOne({
          _id: {
            $ne: id,
          },

          name: {
            $regex: new RegExp(
              `^${escapeRegex(
                updatedName
              )}$`,
              "i"
            ),
          },
        });

      if (duplicateProduct) {
        return res.status(409).json(
          new apiResponse(
            409,
            null,
            "Product with this name already exists"
          )
        );
      }
    }

    let updatedSlug = product.slug;

    if (req.body.slug !== undefined) {
      updatedSlug =
        await getUniqueSlug(
          req.body.slug ||
            updatedName,
          id
        );
    }

    if (
      parseBoolean(
        req.body.regenerateSlug,
        false
      )
    ) {
      updatedSlug =
        await getUniqueSlug(
          updatedName,
          id
        );
    }

    let updatedCategory =
      product.category;

    if (req.body.category) {
      const categoryDocument =
        await findCategory(
          req.body.category
        );

      if (!categoryDocument) {
        return res.status(404).json(
          new apiResponse(
            404,
            null,
            "Selected category was not found"
          )
        );
      }

      updatedCategory =
        categoryDocument._id;
    }

    const mainImageFile =
      req.files?.mainImage?.[0];

    const mainImageUrl = String(
      req.body.mainImageUrl || ""
    ).trim();

    const galleryFiles =
      req.files?.galleryImages || [];

    const galleryImageUrls =
      parseStringArray(
        req.body.galleryImageUrls
      );

    const galleryImageAlts =
      parseStringArray(
        req.body.galleryImageAlts
      );

    const removeGalleryPublicIds =
      parseStringArray(
        req.body
          .removeGalleryPublicIds
      );

    const replaceGallery =
      parseBoolean(
        req.body.replaceGallery,
        false
      );

    const hasMainReplacement =
      Boolean(mainImageFile) ||
      Boolean(mainImageUrl);

    const hasNewGallery =
      galleryFiles.length > 0 ||
      galleryImageUrls.length > 0;

    const newlyUploadedPublicIds = [];

    try {
      let newMainImage = null;

      if (hasMainReplacement) {
        const uploadedMainImage =
          await uploadImageSourceToCloudinary(
            {
              file: mainImageFile,

              imageUrl:
                mainImageUrl,

              folder:
                "jb-general-exports/products/main",
            }
          );

        newlyUploadedPublicIds.push(
          uploadedMainImage.publicId
        );

        newMainImage =
          buildImageData(
            uploadedMainImage,

            req.body.mainImageAlt ||
              product.mainImage?.alt ||
              updatedName
          );
      }

      let newGalleryImages = [];

      if (hasNewGallery) {
        newGalleryImages =
          await uploadGalleryImages({
            files: galleryFiles,

            imageUrls:
              galleryImageUrls,

            imageAlts:
              galleryImageAlts,

            fallbackAlt:
              updatedName,

            uploadedPublicIds:
              newlyUploadedPublicIds,
          });
      }

      const oldMainImagePublicId =
        product.mainImage?.publicId;

      const originalGallery =
        [...product.galleryImages];

      let finalGallery =
        originalGallery;

      let galleryImagesToDelete = [];

      if (replaceGallery) {
        galleryImagesToDelete =
          originalGallery
            .map(
              (image) =>
                image.publicId
            )
            .filter(Boolean);

        finalGallery =
          newGalleryImages;
      } else {
        if (
          removeGalleryPublicIds.length
        ) {
          galleryImagesToDelete =
            originalGallery
              .filter((image) =>
                removeGalleryPublicIds.includes(
                  image.publicId
                )
              )
              .map(
                (image) =>
                  image.publicId
              );

          finalGallery =
            originalGallery.filter(
              (image) =>
                !removeGalleryPublicIds.includes(
                  image.publicId
                )
            );
        }

        finalGallery = [
          ...finalGallery,
          ...newGalleryImages,
        ];
      }

      product.name = updatedName;
      product.slug = updatedSlug;
      product.category =
        updatedCategory;

      if (
        req.body.shortDescription !==
        undefined
      ) {
        product.shortDescription =
          String(
            req.body.shortDescription
          ).trim();
      }

      if (
        req.body.description !==
        undefined
      ) {
        product.description =
          String(
            req.body.description
          ).trim();
      }

      if (newMainImage) {
        product.mainImage =
          newMainImage;
      } else if (
        req.body.mainImageAlt !==
        undefined
      ) {
        product.mainImage.alt =
          String(
            req.body.mainImageAlt
          ).trim();
      }

      product.galleryImages =
        finalGallery;

      const arrayFields = [
        "features",
        "applications",
        "packagingOptions",
        "qualityNotes",
      ];

      for (const field of arrayFields) {
        if (
          req.body[field] !== undefined
        ) {
          product[field] =
            parseStringArray(
              req.body[field]
            );
        }
      }

      if (
        req.body.specifications !==
        undefined
      ) {
        product.specifications =
          parseObjectArray(
            req.body.specifications
          );
      }

      if (
        req.body.variants !==
        undefined
      ) {
        product.variants =
          parseObjectArray(
            req.body.variants
          );
      }

      const stringFields = [
        "origin",
        "minimumOrderQuantity",
        "availability",
        "enquiryButtonLabel",
        "enquiryButtonUrl",
      ];

      for (const field of stringFields) {
        if (
          req.body[field] !== undefined
        ) {
          product[field] = String(
            req.body[field]
          ).trim();
        }
      }

      if (
        req.body.metaTitle !==
        undefined
      ) {
        product.seo.metaTitle =
          String(
            req.body.metaTitle
          ).trim();
      }

      if (
        req.body.metaDescription !==
        undefined
      ) {
        product.seo.metaDescription =
          String(
            req.body.metaDescription
          ).trim();
      }

      if (
        req.body.metaKeywords !==
        undefined
      ) {
        product.seo.metaKeywords =
          parseStringArray(
            req.body.metaKeywords
          );
      }

      if (
        req.body.isFeatured !==
        undefined
      ) {
        product.isFeatured =
          parseBoolean(
            req.body.isFeatured,
            product.isFeatured
          );
      }

      if (
        req.body.showOnHome !==
        undefined
      ) {
        product.showOnHome =
          parseBoolean(
            req.body.showOnHome,
            product.showOnHome
          );
      }

      if (
        req.body.order !== undefined
      ) {
        product.order =
          parseNumber(
            req.body.order,
            product.order
          );
      }

      if (
        req.body.isActive !==
        undefined
      ) {
        product.isActive =
          parseBoolean(
            req.body.isActive,
            product.isActive
          );
      }

      await product.save();

      const oldImagesToDelete = [
        ...galleryImagesToDelete,
      ];

      if (
        newMainImage &&
        oldMainImagePublicId
      ) {
        oldImagesToDelete.push(
          oldMainImagePublicId
        );
      }

      await deleteCloudinaryImages(
        oldImagesToDelete
      );

      await product.populate(
        "category",
        "name slug image"
      );

      return res.status(200).json(
        new apiResponse(
          200,
          product,
          "Product updated successfully"
        )
      );
    } catch (error) {
      await deleteCloudinaryImages(
        newlyUploadedPublicIds
      );

      throw error;
    }
  }
);

/* =====================================================
   DELETE PRODUCT
===================================================== */

const deleteProduct = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Invalid product ID"
        )
      );
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json(
        new apiResponse(
          404,
          null,
          "Product not found"
        )
      );
    }

    const publicIds = [
      product.mainImage?.publicId,

      ...product.galleryImages.map(
        (image) => image.publicId
      ),
    ].filter(Boolean);

    await Product.findByIdAndDelete(id);

    await deleteCloudinaryImages(
      publicIds
    );

    return res.status(200).json(
      new apiResponse(
        200,
        product,
        "Product deleted successfully"
      )
    );
  }
);

export {
  createProduct,
  getProducts,
  getProductBySlug,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};