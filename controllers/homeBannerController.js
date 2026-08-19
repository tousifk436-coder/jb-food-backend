

import mongoose from "mongoose";

import HomeBanner from "../models/HomeBanner.modal.js";

import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

import {
  uploadImageSourceToCloudinary,
  deleteCloudinaryImages,
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
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : fallback;
};

const hasTextValue = (value) => {
  return (
    value !== undefined &&
    value !== null &&
    String(value).trim() !== ""
  );
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
   CREATE HOME BANNER
===================================================== */

const createHomeBanner = asyncHandler(
  async (req, res) => {
    const desktopFile =
      req.files?.desktopImage?.[0];

    const mobileFile =
      req.files?.mobileImage?.[0];

    const desktopImageUrl = String(
      req.body.desktopImageUrl || ""
    ).trim();

    const mobileImageUrl = String(
      req.body.mobileImageUrl || ""
    ).trim();

    const {
      eyebrow,
      title,
      highlightedText,
      description,

      desktopImageAlt,
      mobileImageAlt,

      primaryButtonLabel,
      primaryButtonUrl,

      secondaryButtonLabel,
      secondaryButtonUrl,

      textAlignment,
      overlayOpacity,
      order,
      isActive,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Banner title is required"
        )
      );
    }

    if (
      !desktopFile &&
      !desktopImageUrl
    ) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Upload desktopImage or provide desktopImageUrl"
        )
      );
    }

    const uploadedPublicIds = [];

    try {
      const desktopUpload =
        await uploadImageSourceToCloudinary(
          {
            file: desktopFile,

            imageUrl:
              desktopImageUrl,

            folder:
              "jb-general-exports/home-banners/desktop",
          }
        );

      uploadedPublicIds.push(
        desktopUpload.publicId
      );

      let mobileUpload = null;

      if (
        mobileFile ||
        mobileImageUrl
      ) {
        mobileUpload =
          await uploadImageSourceToCloudinary(
            {
              file: mobileFile,

              imageUrl:
                mobileImageUrl,

              folder:
                "jb-general-exports/home-banners/mobile",
            }
          );

        uploadedPublicIds.push(
          mobileUpload.publicId
        );
      }

      const banner =
        await HomeBanner.create({
          eyebrow:
            eyebrow?.trim() || "",

          title: title.trim(),

          highlightedText:
            highlightedText?.trim() || "",

          description:
            description?.trim() || "",

          desktopImage: buildImageData(
            desktopUpload,
            desktopImageAlt
          ),

          mobileImage: mobileUpload
            ? buildImageData(
                mobileUpload,
                mobileImageAlt
              )
            : null,

          primaryButton: {
            label:
              primaryButtonLabel?.trim() ||
              "Explore Products",

            url:
              primaryButtonUrl?.trim() ||
              "products.html",
          },

          secondaryButton: {
            label:
              secondaryButtonLabel?.trim() ||
              "Send Enquiry",

            url:
              secondaryButtonUrl?.trim() ||
              "bulk-order.html",
          },

          textAlignment: [
            "left",
            "center",
            "right",
          ].includes(textAlignment)
            ? textAlignment
            : "left",

          overlayOpacity: Math.min(
            1,
            Math.max(
              0,
              parseNumber(
                overlayOpacity,
                0.25
              )
            )
          ),

          order: parseNumber(
            order,
            0
          ),

          isActive: parseBoolean(
            isActive,
            true
          ),
        });

      return res.status(201).json(
        new apiResponse(
          201,
          banner,
          "Home banner created successfully"
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
   GET ACTIVE BANNERS — PUBLIC
===================================================== */

const getActiveHomeBanners =
  asyncHandler(async (req, res) => {
    const banners =
      await HomeBanner.find({
        isActive: true,
      })
        .sort({
          order: 1,
          createdAt: -1,
        })
        .lean();

    return res.status(200).json(
      new apiResponse(
        200,
        {
          banners,
          totalBanners:
            banners.length,
        },
        "Home banners fetched successfully"
      )
    );
  });

/* =====================================================
   GET ALL BANNERS — ADMIN
===================================================== */

const getAllHomeBanners = asyncHandler(
  async (req, res) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      isActive,
      isPagination = "true",
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
        Number(limit) || 10
      )
    );

    const filter = {};

    if (search?.trim()) {
      const regex = new RegExp(
        search.trim(),
        "i"
      );

      filter.$or = [
        {
          title: regex,
        },
        {
          eyebrow: regex,
        },
        {
          description: regex,
        },
      ];
    }

    if (
      isActive !== undefined
    ) {
      filter.isActive =
        parseBoolean(isActive);
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
    };

    const selectedSort =
      sortOptions[sortBy] ||
      sortOptions.order;

    const totalBanners =
      await HomeBanner.countDocuments(
        filter
      );

    let query =
      HomeBanner.find(filter).sort(
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

    const banners =
      await query.lean();

    return res.status(200).json(
      new apiResponse(
        200,
        {
          banners,
          totalBanners,

          totalPages:
            isPagination === "true"
              ? Math.ceil(
                  totalBanners /
                    limitNumber
                )
              : 1,

          currentPage:
            pageNumber,
        },
        "All home banners fetched successfully"
      )
    );
  }
);

/* =====================================================
   GET SINGLE BANNER — ADMIN
===================================================== */

const getHomeBannerById =
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
          "Invalid home banner ID"
        )
      );
    }

    const banner =
      await HomeBanner.findById(id);

    if (!banner) {
      return res.status(404).json(
        new apiResponse(
          404,
          null,
          "Home banner not found"
        )
      );
    }

    return res.status(200).json(
      new apiResponse(
        200,
        banner,
        "Home banner fetched successfully"
      )
    );
  });

/* =====================================================
   UPDATE HOME BANNER
===================================================== */

const updateHomeBanner = asyncHandler(
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
          "Invalid home banner ID"
        )
      );
    }

    const banner =
      await HomeBanner.findById(id);

    if (!banner) {
      return res.status(404).json(
        new apiResponse(
          404,
          null,
          "Home banner not found"
        )
      );
    }

    if (
      req.body.title !== undefined &&
      !String(
        req.body.title
      ).trim()
    ) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Banner title cannot be empty"
        )
      );
    }

    const newDesktopFile =
      req.files?.desktopImage?.[0];

    const newMobileFile =
      req.files?.mobileImage?.[0];

    const desktopImageUrl = String(
      req.body.desktopImageUrl || ""
    ).trim();

    const mobileImageUrl = String(
      req.body.mobileImageUrl || ""
    ).trim();

    const hasDesktopReplacement =
      Boolean(newDesktopFile) ||
      Boolean(desktopImageUrl);

    const hasMobileReplacement =
      Boolean(newMobileFile) ||
      Boolean(mobileImageUrl);

    const removeMobileImage =
      parseBoolean(
        req.body.removeMobileImage,
        false
      );

    const newlyUploadedPublicIds =
      [];

    let newDesktopImage = null;
    let newMobileImage = null;

    try {
      if (
        hasDesktopReplacement
      ) {
        const result =
          await uploadImageSourceToCloudinary(
            {
              file:
                newDesktopFile,

              imageUrl:
                desktopImageUrl,

              folder:
                "jb-general-exports/home-banners/desktop",
            }
          );

        newlyUploadedPublicIds.push(
          result.publicId
        );

        newDesktopImage =
          buildImageData(
            result,

            req.body
              .desktopImageAlt ||
              banner.desktopImage
                ?.alt
          );
      }

      if (
        hasMobileReplacement
      ) {
        const result =
          await uploadImageSourceToCloudinary(
            {
              file:
                newMobileFile,

              imageUrl:
                mobileImageUrl,

              folder:
                "jb-general-exports/home-banners/mobile",
            }
          );

        newlyUploadedPublicIds.push(
          result.publicId
        );

        newMobileImage =
          buildImageData(
            result,

            req.body
              .mobileImageAlt ||
              banner.mobileImage
                ?.alt
          );
      }

      const oldDesktopPublicId =
        banner.desktopImage
          ?.publicId;

      const oldMobilePublicId =
        banner.mobileImage
          ?.publicId;

      if (
        req.body.eyebrow !==
        undefined
      ) {
        banner.eyebrow =
          String(
            req.body.eyebrow
          ).trim();
      }

      if (
        req.body.title !==
        undefined
      ) {
        banner.title = String(
          req.body.title
        ).trim();
      }

      if (
        req.body
          .highlightedText !==
        undefined
      ) {
        banner.highlightedText =
          String(
            req.body
              .highlightedText
          ).trim();
      }

      if (
        req.body.description !==
        undefined
      ) {
        banner.description =
          String(
            req.body.description
          ).trim();
      }

      if (newDesktopImage) {
        banner.desktopImage =
          newDesktopImage;
      } else if (
        req.body
          .desktopImageAlt !==
        undefined
      ) {
        banner.desktopImage.alt =
          String(
            req.body
              .desktopImageAlt
          ).trim();
      }

      if (newMobileImage) {
        banner.mobileImage =
          newMobileImage;
      } else if (
        banner.mobileImage &&
        req.body.mobileImageAlt !==
          undefined
      ) {
        banner.mobileImage.alt =
          String(
            req.body.mobileImageAlt
          ).trim();
      }

      if (
        removeMobileImage &&
        !newMobileImage
      ) {
        banner.mobileImage = null;
      }

      if (
        req.body
          .primaryButtonLabel !==
        undefined
      ) {
        banner.primaryButton.label =
          String(
            req.body
              .primaryButtonLabel
          ).trim();
      }

      if (
        req.body.primaryButtonUrl !==
        undefined
      ) {
        banner.primaryButton.url =
          String(
            req.body
              .primaryButtonUrl
          ).trim();
      }

      if (
        req.body
          .secondaryButtonLabel !==
        undefined
      ) {
        banner.secondaryButton.label =
          String(
            req.body
              .secondaryButtonLabel
          ).trim();
      }

      if (
        req.body
          .secondaryButtonUrl !==
        undefined
      ) {
        banner.secondaryButton.url =
          String(
            req.body
              .secondaryButtonUrl
          ).trim();
      }

      if (
        req.body.textAlignment !==
          undefined &&
        [
          "left",
          "center",
          "right",
        ].includes(
          req.body.textAlignment
        )
      ) {
        banner.textAlignment =
          req.body.textAlignment;
      }

      if (
        req.body.overlayOpacity !==
        undefined
      ) {
        banner.overlayOpacity =
          Math.min(
            1,
            Math.max(
              0,
              parseNumber(
                req.body
                  .overlayOpacity,
                banner.overlayOpacity
              )
            )
          );
      }

      if (
        req.body.order !==
        undefined
      ) {
        banner.order =
          parseNumber(
            req.body.order,
            banner.order
          );
      }

      if (
        req.body.isActive !==
        undefined
      ) {
        banner.isActive =
          parseBoolean(
            req.body.isActive,
            banner.isActive
          );
      }

      await banner.save();

      const oldImagesToDelete =
        [];

      if (
        newDesktopImage &&
        oldDesktopPublicId
      ) {
        oldImagesToDelete.push(
          oldDesktopPublicId
        );
      }

      if (
        newMobileImage &&
        oldMobilePublicId
      ) {
        oldImagesToDelete.push(
          oldMobilePublicId
        );
      }

      if (
        removeMobileImage &&
        !newMobileImage &&
        oldMobilePublicId
      ) {
        oldImagesToDelete.push(
          oldMobilePublicId
        );
      }

      await deleteCloudinaryImages(
        oldImagesToDelete
      );

      return res.status(200).json(
        new apiResponse(
          200,
          banner,
          "Home banner updated successfully"
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
   DELETE HOME BANNER
===================================================== */

const deleteHomeBanner = asyncHandler(
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
          "Invalid home banner ID"
        )
      );
    }

    const banner =
      await HomeBanner.findById(id);

    if (!banner) {
      return res.status(404).json(
        new apiResponse(
          404,
          null,
          "Home banner not found"
        )
      );
    }

    const publicIds = [
      banner.desktopImage
        ?.publicId,

      banner.mobileImage
        ?.publicId,
    ].filter(Boolean);

    await HomeBanner.findByIdAndDelete(
      id
    );

    await deleteCloudinaryImages(
      publicIds
    );

    return res.status(200).json(
      new apiResponse(
        200,
        banner,
        "Home banner deleted successfully"
      )
    );
  }
);

export {
  createHomeBanner,
  getActiveHomeBanners,
  getAllHomeBanners,
  getHomeBannerById,
  updateHomeBanner,
  deleteHomeBanner,
};