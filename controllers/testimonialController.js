// import Testimonial from "../models/Testimonial.js";

// // Create testimonial
// export const createTestimonial = async (req, res) => {
//   try {
//     const testimonial = await Testimonial.create(req.body);

//     res.status(201).json({
//       success: true,
//       message: "Testimonial created successfully",
//       data: testimonial,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to create testimonial",
//       error: error.message,
//     });
//   }
// };

// // Get all testimonials
// export const getTestimonials = async (req, res) => {
//   try {
//     const testimonials = await Testimonial.find()
//       .sort({ sortOrder: 1, createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: testimonials.length,
//       data: testimonials,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch testimonials",
//       error: error.message,
//     });
//   }
// };

// // Get single testimonial
// export const getTestimonialById = async (req, res) => {
//   try {
//     const testimonial = await Testimonial.findById(req.params.id);

//     if (!testimonial) {
//       return res.status(404).json({
//         success: false,
//         message: "Testimonial not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: testimonial,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch testimonial",
//       error: error.message,
//     });
//   }
// };

// // Update testimonial
// export const updateTestimonial = async (req, res) => {
//   try {
//     const testimonial = await Testimonial.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     if (!testimonial) {
//       return res.status(404).json({
//         success: false,
//         message: "Testimonial not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Testimonial updated successfully",
//       data: testimonial,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to update testimonial",
//       error: error.message,
//     });
//   }
// };

// // Delete testimonial
// export const deleteTestimonial = async (req, res) => {
//   try {
//     const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

//     if (!testimonial) {
//       return res.status(404).json({
//         success: false,
//         message: "Testimonial not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Testimonial deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete testimonial",
//       error: error.message,
//     });
//   }
// };

import Testimonial from "../models/Testimonial.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

/*
|--------------------------------------------------------------------------
| CREATE TESTIMONIAL
|--------------------------------------------------------------------------
*/
const createTestimonial = asyncHandler(async (req, res) => {
  const {
    name,
    designation,
    company,
    country,
    rating,
    message,
    image,
    isActive,
    sortOrder,
  } = req.body;

  // Required fields
  if (!name || !designation || !message) {
    return res.status(400).json(
      new apiResponse(
        400,
        null,
        "Name, designation and message are required"
      )
    );
  }

  // Rating validation
  if (rating !== undefined) {
    const numericRating = Number(rating);

    if (
      Number.isNaN(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Rating must be a number between 1 and 5"
        )
      );
    }
  }

  const testimonial = await Testimonial.create({
    name,
    designation,
    company: company || "",
    country: country || "",
    rating: rating !== undefined ? Number(rating) : 5,
    message,
    image: image || "",
    isActive: isActive !== undefined ? isActive : true,
    sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
  });

  return res.status(201).json(
    new apiResponse(
      201,
      testimonial,
      "Testimonial created successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| GET ALL TESTIMONIALS
|--------------------------------------------------------------------------
*/
const getTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find()
    .sort({
      sortOrder: 1,
      createdAt: -1,
    });

  return res.status(200).json(
    new apiResponse(
      200,
      testimonials,
      "Testimonials fetched successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| GET ACTIVE TESTIMONIALS
|--------------------------------------------------------------------------
*/
const getActiveTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({
    isActive: true,
  }).sort({
    sortOrder: 1,
    createdAt: -1,
  });

  return res.status(200).json(
    new apiResponse(
      200,
      testimonials,
      "Active testimonials fetched successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| GET SINGLE TESTIMONIAL
|--------------------------------------------------------------------------
*/
const getTestimonialById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const testimonial = await Testimonial.findById(id);

  if (!testimonial) {
    return res.status(404).json(
      new apiResponse(
        404,
        null,
        "Testimonial not found"
      )
    );
  }

  return res.status(200).json(
    new apiResponse(
      200,
      testimonial,
      "Testimonial fetched successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| UPDATE TESTIMONIAL
|--------------------------------------------------------------------------
*/
const updateTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const {
    name,
    designation,
    company,
    country,
    rating,
    message,
    image,
    isActive,
    sortOrder,
  } = req.body;

  // Rating validation if provided
  if (rating !== undefined) {
    const numericRating = Number(rating);

    if (
      Number.isNaN(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Rating must be a number between 1 and 5"
        )
      );
    }
  }

  const updateData = {};

  if (name !== undefined) updateData.name = name;
  if (designation !== undefined) updateData.designation = designation;
  if (company !== undefined) updateData.company = company;
  if (country !== undefined) updateData.country = country;
  if (rating !== undefined) updateData.rating = Number(rating);
  if (message !== undefined) updateData.message = message;
  if (image !== undefined) updateData.image = image;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);

  const testimonial = await Testimonial.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!testimonial) {
    return res.status(404).json(
      new apiResponse(
        404,
        null,
        "Testimonial not found"
      )
    );
  }

  return res.status(200).json(
    new apiResponse(
      200,
      testimonial,
      "Testimonial updated successfully"
    )
  );
});

/*
|--------------------------------------------------------------------------
| DELETE TESTIMONIAL
|--------------------------------------------------------------------------
*/
const deleteTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const testimonial = await Testimonial.findByIdAndDelete(id);

  if (!testimonial) {
    return res.status(404).json(
      new apiResponse(
        404,
        null,
        "Testimonial not found"
      )
    );
  }

  return res.status(200).json(
    new apiResponse(
      200,
      null,
      "Testimonial deleted successfully"
    )
  );
});

export {
  createTestimonial,
  getTestimonials,
  getActiveTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
};