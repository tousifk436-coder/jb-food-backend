// import { Readable } from "stream";

// import cloudinary from "../config/cloudinary.js";

// /**
//  * Upload an in-memory Multer file to Cloudinary.
//  */
// export const uploadBufferToCloudinary = (
//   fileBuffer,
//   options = {}
// ) => {
//   return new Promise((resolve, reject) => {
//     if (!fileBuffer) {
//       return reject(
//         new Error("Image buffer is required")
//       );
//     }

//     const uploadOptions = {
//       folder:
//         options.folder ||
//         "jb-general-exports",

//       resource_type: "image",

//       use_filename: true,
//       unique_filename: true,
//       overwrite: false,

//       transformation: [
//         {
//           quality: "auto",
//           fetch_format: "auto",
//         },
//       ],

//       ...options,
//     };

//     const uploadStream =
//       cloudinary.uploader.upload_stream(
//         uploadOptions,
//         (error, result) => {
//           if (error) {
//             return reject(error);
//           }

//           resolve({
//             url: result.secure_url,
//             publicId: result.public_id,
//             width: result.width,
//             height: result.height,
//             format: result.format,
//             bytes: result.bytes,
//           });
//         }
//       );

//     Readable.from(fileBuffer).pipe(uploadStream);
//   });
// };

// /**
//  * Delete an image from Cloudinary.
//  */
// export const deleteCloudinaryImage = async (
//   publicId
// ) => {
//   if (!publicId) {
//     return null;
//   }

//   return cloudinary.uploader.destroy(
//     publicId,
//     {
//       resource_type: "image",
//       invalidate: true,
//     }
//   );
// };

// /**
//  * Delete multiple Cloudinary images.
//  */
// export const deleteCloudinaryImages = async (
//   publicIds = []
// ) => {
//   const validPublicIds = publicIds.filter(Boolean);

//   if (!validPublicIds.length) {
//     return [];
//   }

//   return Promise.allSettled(
//     validPublicIds.map((publicId) =>
//       deleteCloudinaryImage(publicId)
//     )
//   );
// };

import cloudinary from "../config/cloudinary.js";

/* =====================================================
   COMMON HELPERS
===================================================== */

const normalizeUploadResult = (result) => {
  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width || 0,
    height: result.height || 0,
    format: result.format || "",
    bytes: result.bytes || 0,
  };
};

const getUploadOptions = (options = {}) => {
  return {
    folder:
      options.folder ||
      "jb-general-exports",

    resource_type: "image",

    use_filename: true,
    unique_filename: true,
    overwrite: false,

    ...options,
  };
};

export const isValidRemoteImageUrl = (value) => {
  if (!value || typeof value !== "string") {
    return false;
  }

  try {
    const parsedUrl = new URL(value.trim());

    return (
      parsedUrl.protocol === "http:" ||
      parsedUrl.protocol === "https:"
    );
  } catch {
    return false;
  }
};

/* =====================================================
   UPLOAD LOCAL FILE BUFFER TO CLOUDINARY
===================================================== */

export const uploadBufferToCloudinary = (
  fileBuffer,
  options = {}
) => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer) {
      const error = new Error(
        "Image file buffer is required"
      );

      error.statusCode = 400;

      return reject(error);
    }

    const uploadStream =
      cloudinary.uploader.upload_stream(
        getUploadOptions(options),
        (error, result) => {
          if (error) {
            return reject(error);
          }

          resolve(
            normalizeUploadResult(result)
          );
        }
      );

    uploadStream.end(fileBuffer);
  });
};

/* =====================================================
   IMPORT EXTERNAL IMAGE URL INTO CLOUDINARY
===================================================== */

export const uploadUrlToCloudinary = async (
  imageUrl,
  options = {}
) => {
  const normalizedUrl = String(
    imageUrl || ""
  ).trim();

  if (
    !isValidRemoteImageUrl(normalizedUrl)
  ) {
    const error = new Error(
      "A valid HTTP or HTTPS image URL is required"
    );

    error.statusCode = 400;

    throw error;
  }

  const result =
    await cloudinary.uploader.upload(
      normalizedUrl,
      getUploadOptions(options)
    );

  return normalizeUploadResult(result);
};

/* =====================================================
   UPLOAD FROM FILE OR URL

   Local file receives priority when both are supplied.
===================================================== */

export const uploadImageSourceToCloudinary =
  async ({
    file,
    imageUrl,
    folder,
    options = {},
  }) => {
    if (file?.buffer) {
      return uploadBufferToCloudinary(
        file.buffer,
        {
          folder,
          ...options,
        }
      );
    }

    if (
      imageUrl &&
      String(imageUrl).trim()
    ) {
      return uploadUrlToCloudinary(
        String(imageUrl).trim(),
        {
          folder,
          ...options,
        }
      );
    }

    const error = new Error(
      "Please upload an image file or provide an image URL"
    );

    error.statusCode = 400;

    throw error;
  };

/* =====================================================
   DELETE SINGLE CLOUDINARY IMAGE
===================================================== */

export const deleteCloudinaryImage = async (
  publicId
) => {
  if (!publicId) {
    return null;
  }

  return cloudinary.uploader.destroy(
    publicId,
    {
      resource_type: "image",
      invalidate: true,
    }
  );
};

/* =====================================================
   DELETE MULTIPLE CLOUDINARY IMAGES
===================================================== */

export const deleteCloudinaryImages = async (
  publicIds = []
) => {
  const validPublicIds = publicIds.filter(
    Boolean
  );

  if (!validPublicIds.length) {
    return [];
  }

  return Promise.allSettled(
    validPublicIds.map((publicId) =>
      deleteCloudinaryImage(publicId)
    )
  );
};