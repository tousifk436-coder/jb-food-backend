import SiteSetting from "../models/SiteSetting.modal.js";

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

  return String(value).toLowerCase() === "true";
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

const getDefaultSettings = () => {
  return {
    siteKey: "main",
    companyName: "JB General Exports LLP",
    tagline: "Import • Export • Global Trade",
    logo: null,
    primaryPhone: "9406478888",
    alternatePhone: "9406578888",
    email: "jbgeneralexportsllp@gmail.com",
    alternateEmail: "",
    whatsappNumber: "919406478888",
    address: "",
    topBarText:
      "Import • Export • Global Business Partnerships",
    footerDescription:
      "JB General Exports LLP supports importers, exporters, distributors and business buyers through practical sourcing and trade coordination.",
    businessHours: "",
    socialLinks: {
      facebook: "",
      instagram: "",
      linkedin: "",
      twitter: "",
      youtube: "",
    },
    isActive: true,
  };
};

/* =====================================================
   GET PUBLIC SITE SETTINGS
===================================================== */

const getSiteSettings = asyncHandler(
  async (req, res) => {
    let settings = await SiteSetting.findOne({
      siteKey: "main",
      isActive: true,
    }).lean();

    /*
      Return useful default content when the settings
      document has not yet been created.
    */
    if (!settings) {
      settings = getDefaultSettings();
    }

    return res.status(200).json(
      new apiResponse(
        200,
        settings,
        "Site settings fetched successfully"
      )
    );
  }
);

/* =====================================================
   GET SETTINGS FOR ADMIN
===================================================== */

const getAdminSiteSettings = asyncHandler(
  async (req, res) => {
    let settings = await SiteSetting.findOne({
      siteKey: "main",
    });

    if (!settings) {
      settings = await SiteSetting.create(
        getDefaultSettings()
      );
    }

    return res.status(200).json(
      new apiResponse(
        200,
        settings,
        "Admin site settings fetched successfully"
      )
    );
  }
);

/* =====================================================
   CREATE OR UPDATE SITE SETTINGS
===================================================== */

const updateSiteSettings = asyncHandler(
  async (req, res) => {
    let settings = await SiteSetting.findOne({
      siteKey: "main",
    });

    if (!settings) {
      settings = new SiteSetting(
        getDefaultSettings()
      );
    }

    const logoFile = req.file;

    const logoUrl = String(
      req.body.logoUrl || ""
    ).trim();

    const hasNewLogo =
      Boolean(logoFile) ||
      Boolean(logoUrl);

    const removeLogo = parseBoolean(
      req.body.removeLogo,
      false
    );

    let uploadedLogo = null;

    const oldLogoPublicId =
      settings.logo?.publicId;

    try {
      /*
        Local file receives priority when both local file
        and logo URL are supplied.
      */
      if (hasNewLogo) {
        uploadedLogo =
          await uploadImageSourceToCloudinary(
            {
              file: logoFile,
              imageUrl: logoUrl,
              folder:
                "jb-general-exports/site-settings/logo",
            }
          );
      }

      const stringFields = [
        "companyName",
        "tagline",
        "primaryPhone",
        "alternatePhone",
        "email",
        "alternateEmail",
        "whatsappNumber",
        "address",
        "topBarText",
        "footerDescription",
        "businessHours",
      ];

      for (const field of stringFields) {
        if (req.body[field] !== undefined) {
          settings[field] = String(
            req.body[field]
          ).trim();
        }
      }

      if (
        req.body.companyName !== undefined &&
        !String(
          req.body.companyName
        ).trim()
      ) {
        if (uploadedLogo?.publicId) {
          await deleteCloudinaryImage(
            uploadedLogo.publicId
          );
        }

        return res.status(400).json(
          new apiResponse(
            400,
            null,
            "Company name cannot be empty"
          )
        );
      }

      if (uploadedLogo) {
        settings.logo = buildImageData(
          uploadedLogo,
          req.body.logoAlt ||
            settings.companyName
        );
      } else if (
        settings.logo &&
        req.body.logoAlt !== undefined
      ) {
        settings.logo.alt = String(
          req.body.logoAlt
        ).trim();
      }

      if (
        removeLogo &&
        !uploadedLogo
      ) {
        settings.logo = null;
      }

      const socialFields = [
        "facebook",
        "instagram",
        "linkedin",
        "twitter",
        "youtube",
      ];

      for (const field of socialFields) {
        if (req.body[field] !== undefined) {
          settings.socialLinks[field] =
            String(req.body[field]).trim();
        }
      }

      if (req.body.isActive !== undefined) {
        settings.isActive = parseBoolean(
          req.body.isActive,
          settings.isActive
        );
      }

      await settings.save();

      /*
        Delete old Cloudinary logo only after MongoDB
        settings are saved successfully.
      */
      if (
        uploadedLogo &&
        oldLogoPublicId
      ) {
        try {
          await deleteCloudinaryImage(
            oldLogoPublicId
          );
        } catch (cloudinaryError) {
          console.error(
            "Old logo deletion failed:",
            cloudinaryError.message
          );
        }
      }

      if (
        removeLogo &&
        !uploadedLogo &&
        oldLogoPublicId
      ) {
        try {
          await deleteCloudinaryImage(
            oldLogoPublicId
          );
        } catch (cloudinaryError) {
          console.error(
            "Logo deletion failed:",
            cloudinaryError.message
          );
        }
      }

      return res.status(200).json(
        new apiResponse(
          200,
          settings,
          "Site settings updated successfully"
        )
      );
    } catch (error) {
      /*
        Remove newly uploaded image when database save
        or validation fails.
      */
      if (uploadedLogo?.publicId) {
        try {
          await deleteCloudinaryImage(
            uploadedLogo.publicId
          );
        } catch (cloudinaryError) {
          console.error(
            "New logo rollback failed:",
            cloudinaryError.message
          );
        }
      }

      throw error;
    }
  }
);

export {
  getSiteSettings,
  getAdminSiteSettings,
  updateSiteSettings,
};