// import mongoose from "mongoose";

// import Category from "../models/Category.modal.js";

// import { apiResponse } from "../utils/apiResponse.js";
// import { asyncHandler } from "../utils/asynchandler.js";

// import {
//   uploadBufferToCloudinary,
//   deleteCloudinaryImage,
// } from "../utils/cloudinaryHelper.js";

// /* =====================================================
//    HELPER FUNCTIONS
// ===================================================== */

// const parseBoolean = (value, fallback = false) => {
//   if (value === undefined || value === null || value === "") {
//     return fallback;
//   }

//   if (typeof value === "boolean") {
//     return value;
//   }

//   return String(value).toLowerCase() === "true";
// };

// const parseNumber = (value, fallback = 0) => {
//   const number = Number(value);

//   return Number.isFinite(number)
//     ? number
//     : fallback;
// };

// const createSlug = (value = "") => {
//   return String(value)
//     .normalize("NFKD")
//     .replace(/[\u0300-\u036f]/g, "")
//     .toLowerCase()
//     .trim()
//     .replace(/&/g, " and ")
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/^-+|-+$/g, "");
// };

// const escapeRegex = (value = "") => {
//   return String(value).replace(
//     /[.*+?^${}()|[\]\\]/g,
//     "\\$&"
//   );
// };

// const getUniqueSlug = async (
//   value,
//   excludedCategoryId = null
// ) => {
//   const baseSlug = createSlug(value);

//   if (!baseSlug) {
//     throw new Error(
//       "Unable to generate category slug"
//     );
//   }

//   let slug = baseSlug;
//   let counter = 1;

//   while (true) {
//     const filter = {
//       slug,
//     };

//     if (excludedCategoryId) {
//       filter._id = {
//         $ne: excludedCategoryId,
//       };
//     }

//     const existingCategory =
//       await Category.exists(filter);

//     if (!existingCategory) {
//       return slug;
//     }

//     slug = `${baseSlug}-${counter}`;
//     counter += 1;
//   }
// };

// const buildImageData = (
//   uploadResult,
//   alt = ""
// ) => {
//   return {
//     url: uploadResult.url,
//     publicId: uploadResult.publicId,
//     width: uploadResult.width,
//     height: uploadResult.height,
//     format: uploadResult.format,
//     alt: String(alt || "").trim(),
//   };
// };

// /* =====================================================
//    CREATE CATEGORY
// ===================================================== */

// const createCategory = asyncHandler(
//   async (req, res) => {
//     const {
//       name,
//       slug,
//       shortDescription,
//       imageAlt,
//       icon,
//       showOnHome,
//       order,
//       isActive,
//     } = req.body;

//     if (!name?.trim()) {
//       return res.status(400).json(
//         new apiResponse(
//           400,
//           null,
//           "Category name is required"
//         )
//       );
//     }

//     const categoryImage = req.file;

//     if (!categoryImage) {
//       return res.status(400).json(
//         new apiResponse(
//           400,
//           null,
//           "Category image is required. Use field name 'categoryImage'."
//         )
//       );
//     }

//     const existingName = await Category.findOne({
//       name: {
//         $regex: new RegExp(
//           `^${escapeRegex(name.trim())}$`,
//           "i"
//         ),
//       },
//     });

//     if (existingName) {
//       return res.status(409).json(
//         new apiResponse(
//           409,
//           null,
//           "Category with this name already exists"
//         )
//       );
//     }

//     const finalSlug = await getUniqueSlug(
//       slug?.trim() || name.trim()
//     );

//     let uploadedImage = null;

//     try {
//       uploadedImage =
//         await uploadBufferToCloudinary(
//           categoryImage.buffer,
//           {
//             folder:
//               "jb-general-exports/categories",
//           }
//         );

//       const category = await Category.create({
//         name: name.trim(),

//         slug: finalSlug,

//         shortDescription:
//           shortDescription?.trim() || "",

//         image: buildImageData(
//           uploadedImage,
//           imageAlt || name
//         ),

//         icon: icon?.trim() || "",

//         showOnHome: parseBoolean(
//           showOnHome,
//           true
//         ),

//         order: parseNumber(order, 0),

//         isActive: parseBoolean(
//           isActive,
//           true
//         ),
//       });

//       return res.status(201).json(
//         new apiResponse(
//           201,
//           category,
//           "Category created successfully"
//         )
//       );
//     } catch (error) {
//       if (uploadedImage?.publicId) {
//         try {
//           await deleteCloudinaryImage(
//             uploadedImage.publicId
//           );
//         } catch (cloudinaryError) {
//           console.error(
//             "Cloudinary rollback failed:",
//             cloudinaryError.message
//           );
//         }
//       }

//       throw error;
//     }
//   }
// );

// /* =====================================================
//    GET PUBLIC CATEGORIES
// ===================================================== */

// const getCategories = asyncHandler(
//   async (req, res) => {
//     const {
//       search = "",
//       showOnHome,
//       limit = 50,
//     } = req.query;

//     const filter = {
//       isActive: true,
//     };

//     if (showOnHome !== undefined) {
//       filter.showOnHome = parseBoolean(
//         showOnHome
//       );
//     }

//     if (search.trim()) {
//       const regex = new RegExp(
//         escapeRegex(search.trim()),
//         "i"
//       );

//       filter.$or = [
//         {
//           name: regex,
//         },
//         {
//           shortDescription: regex,
//         },
//       ];
//     }

//     const limitNumber = Math.min(
//       100,
//       Math.max(1, Number(limit) || 50)
//     );

//     const categories = await Category.find(
//       filter
//     )
//       .sort({
//         order: 1,
//         createdAt: -1,
//       })
//       .limit(limitNumber)
//       .lean();

//     return res.status(200).json(
//       new apiResponse(
//         200,
//         {
//           categories,
//           totalCategories: categories.length,
//         },
//         "Categories fetched successfully"
//       )
//     );
//   }
// );

// /* =====================================================
//    GET PUBLIC CATEGORY BY SLUG
// ===================================================== */

// const getCategoryBySlug = asyncHandler(
//   async (req, res) => {
//     const slug = String(
//       req.params.slug || ""
//     )
//       .trim()
//       .toLowerCase();

//     const category = await Category.findOne({
//       slug,
//       isActive: true,
//     }).lean();

//     if (!category) {
//       return res.status(404).json(
//         new apiResponse(
//           404,
//           null,
//           "Category not found"
//         )
//       );
//     }

//     return res.status(200).json(
//       new apiResponse(
//         200,
//         category,
//         "Category fetched successfully"
//       )
//     );
//   }
// );

// /* =====================================================
//    GET ALL CATEGORIES FOR ADMIN
// ===================================================== */

// const getAllCategories = asyncHandler(
//   async (req, res) => {
//     const {
//       page = 1,
//       limit = 10,
//       search = "",
//       isActive,
//       showOnHome,
//       isPagination = "true",
//       sortBy = "order",
//     } = req.query;

//     const pageNumber = Math.max(
//       1,
//       Number(page) || 1
//     );

//     const limitNumber = Math.min(
//       100,
//       Math.max(1, Number(limit) || 10)
//     );

//     const filter = {};

//     if (isActive !== undefined) {
//       filter.isActive = parseBoolean(
//         isActive
//       );
//     }

//     if (showOnHome !== undefined) {
//       filter.showOnHome = parseBoolean(
//         showOnHome
//       );
//     }

//     if (search.trim()) {
//       const regex = new RegExp(
//         escapeRegex(search.trim()),
//         "i"
//       );

//       filter.$or = [
//         {
//           name: regex,
//         },
//         {
//           slug: regex,
//         },
//         {
//           shortDescription: regex,
//         },
//       ];
//     }

//     const sortOptions = {
//       order: {
//         order: 1,
//         createdAt: -1,
//       },

//       recent: {
//         createdAt: -1,
//       },

//       oldest: {
//         createdAt: 1,
//       },

//       name: {
//         name: 1,
//       },
//     };

//     const selectedSort =
//       sortOptions[sortBy] ||
//       sortOptions.order;

//     const totalCategories =
//       await Category.countDocuments(filter);

//     let query = Category.find(filter).sort(
//       selectedSort
//     );

//     if (isPagination === "true") {
//       query = query
//         .skip(
//           (pageNumber - 1) *
//             limitNumber
//         )
//         .limit(limitNumber);
//     }

//     const categories = await query.lean();

//     return res.status(200).json(
//       new apiResponse(
//         200,
//         {
//           categories,
//           totalCategories,

//           totalPages:
//             isPagination === "true"
//               ? Math.ceil(
//                   totalCategories /
//                     limitNumber
//                 )
//               : 1,

//           currentPage: pageNumber,
//         },
//         "All categories fetched successfully"
//       )
//     );
//   }
// );

// /* =====================================================
//    GET CATEGORY BY ID FOR ADMIN
// ===================================================== */

// const getCategoryById = asyncHandler(
//   async (req, res) => {
//     const { id } = req.params;

//     if (
//       !mongoose.Types.ObjectId.isValid(id)
//     ) {
//       return res.status(400).json(
//         new apiResponse(
//           400,
//           null,
//           "Invalid category ID"
//         )
//       );
//     }

//     const category =
//       await Category.findById(id);

//     if (!category) {
//       return res.status(404).json(
//         new apiResponse(
//           404,
//           null,
//           "Category not found"
//         )
//       );
//     }

//     return res.status(200).json(
//       new apiResponse(
//         200,
//         category,
//         "Category fetched successfully"
//       )
//     );
//   }
// );

// /* =====================================================
//    UPDATE CATEGORY
// ===================================================== */

// const updateCategory = asyncHandler(
//   async (req, res) => {
//     const { id } = req.params;

//     if (
//       !mongoose.Types.ObjectId.isValid(id)
//     ) {
//       return res.status(400).json(
//         new apiResponse(
//           400,
//           null,
//           "Invalid category ID"
//         )
//       );
//     }

//     const category =
//       await Category.findById(id);

//     if (!category) {
//       return res.status(404).json(
//         new apiResponse(
//           404,
//           null,
//           "Category not found"
//         )
//       );
//     }

//     const newImageFile = req.file;

//     let newUploadedImage = null;

//     try {
//       if (newImageFile) {
//         newUploadedImage =
//           await uploadBufferToCloudinary(
//             newImageFile.buffer,
//             {
//               folder:
//                 "jb-general-exports/categories",
//             }
//           );
//       }

//       const oldImagePublicId =
//         category.image?.publicId;

//       if (req.body.name !== undefined) {
//         const updatedName = String(
//           req.body.name
//         ).trim();

//         if (!updatedName) {
//           if (newUploadedImage?.publicId) {
//             await deleteCloudinaryImage(
//               newUploadedImage.publicId
//             );
//           }

//           return res.status(400).json(
//             new apiResponse(
//               400,
//               null,
//               "Category name cannot be empty"
//             )
//           );
//         }

//         const duplicateCategory =
//           await Category.findOne({
//             _id: {
//               $ne: id,
//             },

//             name: {
//               $regex: new RegExp(
//                 `^${escapeRegex(
//                   updatedName
//                 )}$`,
//                 "i"
//               ),
//             },
//           });

//         if (duplicateCategory) {
//           if (newUploadedImage?.publicId) {
//             await deleteCloudinaryImage(
//               newUploadedImage.publicId
//             );
//           }

//           return res.status(409).json(
//             new apiResponse(
//               409,
//               null,
//               "Category with this name already exists"
//             )
//           );
//         }

//         category.name = updatedName;
//       }

//       if (req.body.slug !== undefined) {
//         category.slug =
//           await getUniqueSlug(
//             req.body.slug ||
//               category.name,
//             id
//           );
//       }

//       if (
//         req.body.regenerateSlug ===
//         "true"
//       ) {
//         category.slug =
//           await getUniqueSlug(
//             category.name,
//             id
//           );
//       }

//       if (
//         req.body.shortDescription !==
//         undefined
//       ) {
//         category.shortDescription =
//           String(
//             req.body.shortDescription
//           ).trim();
//       }

//       if (req.body.icon !== undefined) {
//         category.icon = String(
//           req.body.icon
//         ).trim();
//       }

//       if (
//         req.body.showOnHome !== undefined
//       ) {
//         category.showOnHome =
//           parseBoolean(
//             req.body.showOnHome,
//             category.showOnHome
//           );
//       }

//       if (req.body.order !== undefined) {
//         category.order = parseNumber(
//           req.body.order,
//           category.order
//         );
//       }

//       if (
//         req.body.isActive !== undefined
//       ) {
//         category.isActive =
//           parseBoolean(
//             req.body.isActive,
//             category.isActive
//           );
//       }

//       if (newUploadedImage) {
//         category.image = buildImageData(
//           newUploadedImage,
//           req.body.imageAlt ||
//             category.image?.alt ||
//             category.name
//         );
//       } else if (
//         req.body.imageAlt !== undefined
//       ) {
//         category.image.alt = String(
//           req.body.imageAlt
//         ).trim();
//       }

//       await category.save();

//       if (
//         newUploadedImage &&
//         oldImagePublicId
//       ) {
//         try {
//           await deleteCloudinaryImage(
//             oldImagePublicId
//           );
//         } catch (cloudinaryError) {
//           console.error(
//             "Old category image deletion failed:",
//             cloudinaryError.message
//           );
//         }
//       }

//       return res.status(200).json(
//         new apiResponse(
//           200,
//           category,
//           "Category updated successfully"
//         )
//       );
//     } catch (error) {
//       if (newUploadedImage?.publicId) {
//         try {
//           await deleteCloudinaryImage(
//             newUploadedImage.publicId
//           );
//         } catch (cloudinaryError) {
//           console.error(
//             "New category image rollback failed:",
//             cloudinaryError.message
//           );
//         }
//       }

//       throw error;
//     }
//   }
// );

// /* =====================================================
//    DELETE CATEGORY
// ===================================================== */

// const deleteCategory = asyncHandler(
//   async (req, res) => {
//     const { id } = req.params;

//     if (
//       !mongoose.Types.ObjectId.isValid(id)
//     ) {
//       return res.status(400).json(
//         new apiResponse(
//           400,
//           null,
//           "Invalid category ID"
//         )
//       );
//     }

//     const category =
//       await Category.findById(id);

//     if (!category) {
//       return res.status(404).json(
//         new apiResponse(
//           404,
//           null,
//           "Category not found"
//         )
//       );
//     }

//     const imagePublicId =
//       category.image?.publicId;

//     await Category.findByIdAndDelete(id);

//     if (imagePublicId) {
//       try {
//         await deleteCloudinaryImage(
//           imagePublicId
//         );
//       } catch (cloudinaryError) {
//         console.error(
//           "Category image deletion failed:",
//           cloudinaryError.message
//         );
//       }
//     }

//     return res.status(200).json(
//       new apiResponse(
//         200,
//         category,
//         "Category deleted successfully"
//       )
//     );
//   }
// );

// export {
//   createCategory,
//   getCategories,
//   getCategoryBySlug,
//   getAllCategories,
//   getCategoryById,
//   updateCategory,
//   deleteCategory,
// };

import mongoose from "mongoose";

import Category from "../models/Category.modal.js";

import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

import {
  uploadImageSourceToCloudinary,
  deleteCloudinaryImage,
} from "../utils/cloudinaryHelper.js";

/* =====================================================
   HELPERS
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
    String(value).toLowerCase() ===
    "true"
  );
};

const parseNumber = (
  value,
  fallback = 0
) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const createSlug = (value = "") => {
  return String(value)
    .normalize("NFKD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(/^-+|-+$/g, "");
};

const escapeRegex = (value = "") => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

const getUniqueSlug = async (
  value,
  excludedCategoryId = null
) => {
  const baseSlug =
    createSlug(value);

  if (!baseSlug) {
    const error = new Error(
      "Unable to generate category slug"
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

    if (excludedCategoryId) {
      filter._id = {
        $ne: excludedCategoryId,
      };
    }

    const existingCategory =
      await Category.exists(filter);

    if (!existingCategory) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;

    counter += 1;
  }
};

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

/* =====================================================
   CREATE CATEGORY
===================================================== */

const createCategory = asyncHandler(
  async (req, res) => {
    const {
      name,
      slug,
      shortDescription,
      imageAlt,
      icon,
      showOnHome,
      order,
      isActive,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Category name is required"
        )
      );
    }

    const categoryImage =
      req.file;

    const categoryImageUrl =
      String(
        req.body
          .categoryImageUrl || ""
      ).trim();

    if (
      !categoryImage &&
      !categoryImageUrl
    ) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Upload categoryImage or provide categoryImageUrl"
        )
      );
    }

    const existingName =
      await Category.findOne({
        name: {
          $regex: new RegExp(
            `^${escapeRegex(
              name.trim()
            )}$`,
            "i"
          ),
        },
      });

    if (existingName) {
      return res.status(409).json(
        new apiResponse(
          409,
          null,
          "Category with this name already exists"
        )
      );
    }

    const finalSlug =
      await getUniqueSlug(
        slug?.trim() ||
          name.trim()
      );

    let uploadedImage = null;

    try {
      uploadedImage =
        await uploadImageSourceToCloudinary(
          {
            file:
              categoryImage,

            imageUrl:
              categoryImageUrl,

            folder:
              "jb-general-exports/categories",
          }
        );

      const category =
        await Category.create({
          name: name.trim(),

          slug: finalSlug,

          shortDescription:
            shortDescription?.trim() ||
            "",

          image: buildImageData(
            uploadedImage,
            imageAlt || name
          ),

          icon:
            icon?.trim() || "",

          showOnHome:
            parseBoolean(
              showOnHome,
              true
            ),

          order:
            parseNumber(
              order,
              0
            ),

          isActive:
            parseBoolean(
              isActive,
              true
            ),
        });

      return res.status(201).json(
        new apiResponse(
          201,
          category,
          "Category created successfully"
        )
      );
    } catch (error) {
      if (
        uploadedImage?.publicId
      ) {
        try {
          await deleteCloudinaryImage(
            uploadedImage.publicId
          );
        } catch (
          cloudinaryError
        ) {
          console.error(
            "Cloudinary rollback failed:",
            cloudinaryError.message
          );
        }
      }

      throw error;
    }
  }
);

/* =====================================================
   GET PUBLIC CATEGORIES
===================================================== */

const getCategories = asyncHandler(
  async (req, res) => {
    const {
      search = "",
      showOnHome,
      limit = 50,
    } = req.query;

    const filter = {
      isActive: true,
    };

    if (
      showOnHome !== undefined
    ) {
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
      ];
    }

    const limitNumber =
      Math.min(
        100,
        Math.max(
          1,
          Number(limit) || 50
        )
      );

    const categories =
      await Category.find(filter)
        .sort({
          order: 1,
          createdAt: -1,
        })
        .limit(limitNumber)
        .lean();

    return res.status(200).json(
      new apiResponse(
        200,
        {
          categories,

          totalCategories:
            categories.length,
        },
        "Categories fetched successfully"
      )
    );
  }
);

/* =====================================================
   GET PUBLIC CATEGORY BY SLUG
===================================================== */

const getCategoryBySlug =
  asyncHandler(async (req, res) => {
    const slug = String(
      req.params.slug || ""
    )
      .trim()
      .toLowerCase();

    const category =
      await Category.findOne({
        slug,
        isActive: true,
      }).lean();

    if (!category) {
      return res.status(404).json(
        new apiResponse(
          404,
          null,
          "Category not found"
        )
      );
    }

    return res.status(200).json(
      new apiResponse(
        200,
        category,
        "Category fetched successfully"
      )
    );
  });

/* =====================================================
   GET ALL CATEGORIES — ADMIN
===================================================== */

const getAllCategories = asyncHandler(
  async (req, res) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      isActive,
      showOnHome,
      isPagination = "true",
      sortBy = "order",
    } = req.query;

    const pageNumber = Math.max(
      1,
      Number(page) || 1
    );

    const limitNumber =
      Math.min(
        100,
        Math.max(
          1,
          Number(limit) || 10
        )
      );

    const filter = {};

    if (
      isActive !== undefined
    ) {
      filter.isActive =
        parseBoolean(isActive);
    }

    if (
      showOnHome !== undefined
    ) {
      filter.showOnHome =
        parseBoolean(
          showOnHome
        );
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

    const totalCategories =
      await Category.countDocuments(
        filter
      );

    let query =
      Category.find(filter).sort(
        selectedSort
      );

    if (
      isPagination === "true"
    ) {
      query = query
        .skip(
          (pageNumber - 1) *
            limitNumber
        )
        .limit(limitNumber);
    }

    const categories =
      await query.lean();

    return res.status(200).json(
      new apiResponse(
        200,
        {
          categories,
          totalCategories,

          totalPages:
            isPagination === "true"
              ? Math.ceil(
                  totalCategories /
                    limitNumber
                )
              : 1,

          currentPage:
            pageNumber,
        },
        "All categories fetched successfully"
      )
    );
  }
);

/* =====================================================
   GET CATEGORY BY ID — ADMIN
===================================================== */

const getCategoryById =
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Invalid category ID"
        )
      );
    }

    const category =
      await Category.findById(id);

    if (!category) {
      return res.status(404).json(
        new apiResponse(
          404,
          null,
          "Category not found"
        )
      );
    }

    return res.status(200).json(
      new apiResponse(
        200,
        category,
        "Category fetched successfully"
      )
    );
  });

/* =====================================================
   UPDATE CATEGORY
===================================================== */

const updateCategory = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Invalid category ID"
        )
      );
    }

    const category =
      await Category.findById(id);

    if (!category) {
      return res.status(404).json(
        new apiResponse(
          404,
          null,
          "Category not found"
        )
      );
    }

    let updatedName =
      category.name;

    if (
      req.body.name !== undefined
    ) {
      updatedName = String(
        req.body.name
      ).trim();

      if (!updatedName) {
        return res.status(400).json(
          new apiResponse(
            400,
            null,
            "Category name cannot be empty"
          )
        );
      }

      const duplicateCategory =
        await Category.findOne({
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

      if (duplicateCategory) {
        return res.status(409).json(
          new apiResponse(
            409,
            null,
            "Category with this name already exists"
          )
        );
      }
    }

    let updatedSlug =
      category.slug;

    if (
      req.body.slug !== undefined
    ) {
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

    const newImageFile =
      req.file;

    const categoryImageUrl =
      String(
        req.body
          .categoryImageUrl || ""
      ).trim();

    const hasNewImage =
      Boolean(newImageFile) ||
      Boolean(categoryImageUrl);

    let newUploadedImage = null;

    try {
      if (hasNewImage) {
        newUploadedImage =
          await uploadImageSourceToCloudinary(
            {
              file:
                newImageFile,

              imageUrl:
                categoryImageUrl,

              folder:
                "jb-general-exports/categories",
            }
          );
      }

      const oldImagePublicId =
        category.image
          ?.publicId;

      category.name =
        updatedName;

      category.slug =
        updatedSlug;

      if (
        req.body
          .shortDescription !==
        undefined
      ) {
        category.shortDescription =
          String(
            req.body
              .shortDescription
          ).trim();
      }

      if (
        req.body.icon !==
        undefined
      ) {
        category.icon =
          String(
            req.body.icon
          ).trim();
      }

      if (
        req.body.showOnHome !==
        undefined
      ) {
        category.showOnHome =
          parseBoolean(
            req.body.showOnHome,
            category.showOnHome
          );
      }

      if (
        req.body.order !==
        undefined
      ) {
        category.order =
          parseNumber(
            req.body.order,
            category.order
          );
      }

      if (
        req.body.isActive !==
        undefined
      ) {
        category.isActive =
          parseBoolean(
            req.body.isActive,
            category.isActive
          );
      }

      if (newUploadedImage) {
        category.image =
          buildImageData(
            newUploadedImage,

            req.body.imageAlt ||
              category.image?.alt ||
              category.name
          );
      } else if (
        req.body.imageAlt !==
        undefined
      ) {
        category.image.alt =
          String(
            req.body.imageAlt
          ).trim();
      }

      await category.save();

      if (
        newUploadedImage &&
        oldImagePublicId
      ) {
        try {
          await deleteCloudinaryImage(
            oldImagePublicId
          );
        } catch (
          cloudinaryError
        ) {
          console.error(
            "Old category image deletion failed:",
            cloudinaryError.message
          );
        }
      }

      return res.status(200).json(
        new apiResponse(
          200,
          category,
          "Category updated successfully"
        )
      );
    } catch (error) {
      if (
        newUploadedImage?.publicId
      ) {
        try {
          await deleteCloudinaryImage(
            newUploadedImage.publicId
          );
        } catch (
          cloudinaryError
        ) {
          console.error(
            "New category image rollback failed:",
            cloudinaryError.message
          );
        }
      }

      throw error;
    }
  }
);

/* =====================================================
   DELETE CATEGORY
===================================================== */

const deleteCategory = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Invalid category ID"
        )
      );
    }

    const category =
      await Category.findById(id);

    if (!category) {
      return res.status(404).json(
        new apiResponse(
          404,
          null,
          "Category not found"
        )
      );
    }

    const imagePublicId =
      category.image?.publicId;

    await Category.findByIdAndDelete(
      id
    );

    if (imagePublicId) {
      try {
        await deleteCloudinaryImage(
          imagePublicId
        );
      } catch (
        cloudinaryError
      ) {
        console.error(
          "Category image deletion failed:",
          cloudinaryError.message
        );
      }
    }

    return res.status(200).json(
      new apiResponse(
        200,
        category,
        "Category deleted successfully"
      )
    );
  }
);

export {
  createCategory,
  getCategories,
  getCategoryBySlug,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};