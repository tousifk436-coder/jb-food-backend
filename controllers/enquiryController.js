import mongoose from "mongoose";

import Enquiry from "../models/Enquiry.modal.js";

import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

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

const escapeRegex = (value = "") => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

const normalizeText = (value = "") => {
  return String(value || "").trim();
};

const normalizeEmail = (value = "") => {
  return normalizeText(value).toLowerCase();
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
};

const getClientIpAddress = (req) => {
  const forwardedFor =
    req.headers["x-forwarded-for"];

  if (forwardedFor) {
    return String(forwardedFor)
      .split(",")[0]
      .trim();
  }

  return (
    req.socket?.remoteAddress ||
    req.ip ||
    ""
  );
};

const allowedSources = [
  "Home Page",
  "Contact Page",
  "Business Enquiry Page",
  "Product Page",
  "Other",
];

const allowedStatuses = [
  "New",
  "Contacted",
  "In Discussion",
  "Quoted",
  "Closed",
  "Rejected",
];

/* =====================================================
   CREATE ENQUIRY — PUBLIC
===================================================== */

const createEnquiry = asyncHandler(
  async (req, res) => {
    const name = normalizeText(
      req.body.name ||
        req.body.fullName
    );

    const email = normalizeEmail(
      req.body.email
    );

    const phone = normalizeText(
      req.body.phone ||
        req.body.mobile
    );

    const message = normalizeText(
      req.body.message ||
        req.body.requirementDetails ||
        req.body.description
    );

    if (!name) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Name is required"
        )
      );
    }

    if (!email) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Email is required"
        )
      );
    }

    if (!isValidEmail(email)) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Please provide a valid email address"
        )
      );
    }

    if (!phone) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Phone or WhatsApp number is required"
        )
      );
    }

    if (!message) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Requirement details are required"
        )
      );
    }

    const requestedSource =
      normalizeText(req.body.source);

    const source = allowedSources.includes(
      requestedSource
    )
      ? requestedSource
      : "Other";

    const enquiry = await Enquiry.create({
      name,

      company: normalizeText(
        req.body.company ||
          req.body.companyName
      ),

      email,

      phone,

      country: normalizeText(
        req.body.country
      ),

      subject: normalizeText(
        req.body.subject
      ),

      tradeType: normalizeText(
        req.body.tradeType
      ),

      category: normalizeText(
        req.body.category
      ),

      product: normalizeText(
        req.body.product ||
          req.body.productName
      ),

      quantity: normalizeText(
        req.body.quantity
      ),

      packaging: normalizeText(
        req.body.packaging
      ),

      destination: normalizeText(
        req.body.destination
      ),

      message,

      source,

      status: "New",

      isRead: false,

      ipAddress:
        getClientIpAddress(req),

      userAgent: normalizeText(
        req.headers["user-agent"]
      ),
    });

    return res.status(201).json(
      new apiResponse(
        201,
        {
          _id: enquiry._id,
          name: enquiry.name,
          email: enquiry.email,
          phone: enquiry.phone,
          product: enquiry.product,
          source: enquiry.source,
          status: enquiry.status,
          createdAt: enquiry.createdAt,
        },
        "Your enquiry has been submitted successfully"
      )
    );
  }
);

/* =====================================================
   GET ALL ENQUIRIES — ADMIN
===================================================== */

const getAllEnquiries = asyncHandler(
  async (req, res) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      source,
      tradeType,
      category,
      isRead,
      dateFrom,
      dateTo,
      sortBy = "recent",
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

    if (
      status &&
      allowedStatuses.includes(status)
    ) {
      filter.status = status;
    }

    if (
      source &&
      allowedSources.includes(source)
    ) {
      filter.source = source;
    }

    if (tradeType) {
      filter.tradeType = {
        $regex: new RegExp(
          `^${escapeRegex(
            normalizeText(tradeType)
          )}$`,
          "i"
        ),
      };
    }

    if (category) {
      filter.category = {
        $regex: new RegExp(
          `^${escapeRegex(
            normalizeText(category)
          )}$`,
          "i"
        ),
      };
    }

    if (isRead !== undefined) {
      filter.isRead = parseBoolean(
        isRead
      );
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};

      if (dateFrom) {
        const startDate = new Date(
          dateFrom
        );

        if (!Number.isNaN(startDate.getTime())) {
          startDate.setHours(
            0,
            0,
            0,
            0
          );

          filter.createdAt.$gte =
            startDate;
        }
      }

      if (dateTo) {
        const endDate = new Date(
          dateTo
        );

        if (!Number.isNaN(endDate.getTime())) {
          endDate.setHours(
            23,
            59,
            59,
            999
          );

          filter.createdAt.$lte =
            endDate;
        }
      }

      if (
        Object.keys(filter.createdAt)
          .length === 0
      ) {
        delete filter.createdAt;
      }
    }

    if (normalizeText(search)) {
      const regex = new RegExp(
        escapeRegex(
          normalizeText(search)
        ),
        "i"
      );

      filter.$or = [
        {
          name: regex,
        },
        {
          company: regex,
        },
        {
          email: regex,
        },
        {
          phone: regex,
        },
        {
          country: regex,
        },
        {
          subject: regex,
        },
        {
          tradeType: regex,
        },
        {
          category: regex,
        },
        {
          product: regex,
        },
        {
          message: regex,
        },
      ];
    }

    const sortOptions = {
      recent: {
        createdAt: -1,
      },

      oldest: {
        createdAt: 1,
      },

      name: {
        name: 1,
      },

      status: {
        status: 1,
        createdAt: -1,
      },
    };

    const selectedSort =
      sortOptions[sortBy] ||
      sortOptions.recent;

    const totalEnquiries =
      await Enquiry.countDocuments(
        filter
      );

    let query = Enquiry.find(
      filter
    ).sort(selectedSort);

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

    const enquiries =
      await query.lean();

    const statusCounts =
      await Enquiry.aggregate([
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
      ]);

    const counts = {
      total:
        await Enquiry.countDocuments(),

      unread:
        await Enquiry.countDocuments({
          isRead: false,
        }),

      new:
        await Enquiry.countDocuments({
          status: "New",
        }),

      contacted:
        await Enquiry.countDocuments({
          status: "Contacted",
        }),

      inDiscussion:
        await Enquiry.countDocuments({
          status:
            "In Discussion",
        }),

      quoted:
        await Enquiry.countDocuments({
          status: "Quoted",
        }),

      closed:
        await Enquiry.countDocuments({
          status: "Closed",
        }),

      rejected:
        await Enquiry.countDocuments({
          status: "Rejected",
        }),
    };

    return res.status(200).json(
      new apiResponse(
        200,
        {
          enquiries,

          totalEnquiries,

          totalPages:
            isPagination === "true"
              ? Math.ceil(
                  totalEnquiries /
                    limitNumber
                )
              : 1,

          currentPage: pageNumber,

          counts,

          statusCounts,
        },
        "Enquiries fetched successfully"
      )
    );
  }
);

/* =====================================================
   GET SINGLE ENQUIRY — ADMIN
===================================================== */

const getEnquiryById = asyncHandler(
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
          "Invalid enquiry ID"
        )
      );
    }

    const enquiry =
      await Enquiry.findById(id);

    if (!enquiry) {
      return res.status(404).json(
        new apiResponse(
          404,
          null,
          "Enquiry not found"
        )
      );
    }

    /*
      Opening the enquiry in the admin panel
      automatically marks it as read.
    */
    if (!enquiry.isRead) {
      enquiry.isRead = true;
      enquiry.readAt = new Date();

      await enquiry.save();
    }

    return res.status(200).json(
      new apiResponse(
        200,
        enquiry,
        "Enquiry fetched successfully"
      )
    );
  }
);

/* =====================================================
   UPDATE ENQUIRY — ADMIN
===================================================== */

const updateEnquiry = asyncHandler(
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
          "Invalid enquiry ID"
        )
      );
    }

    const enquiry =
      await Enquiry.findById(id);

    if (!enquiry) {
      return res.status(404).json(
        new apiResponse(
          404,
          null,
          "Enquiry not found"
        )
      );
    }

    if (
      req.body.status !== undefined
    ) {
      if (
        !allowedStatuses.includes(
          req.body.status
        )
      ) {
        return res.status(400).json(
          new apiResponse(
            400,
            null,
            `Status must be one of: ${allowedStatuses.join(
              ", "
            )}`
          )
        );
      }

      enquiry.status =
        req.body.status;
    }

    if (
      req.body.adminNotes !==
      undefined
    ) {
      enquiry.adminNotes =
        normalizeText(
          req.body.adminNotes
        );
    }

    if (
      req.body.isRead !== undefined
    ) {
      enquiry.isRead =
        parseBoolean(
          req.body.isRead,
          enquiry.isRead
        );

      enquiry.readAt =
        enquiry.isRead
          ? enquiry.readAt ||
            new Date()
          : null;
    }

    const editableFields = [
      "name",
      "company",
      "email",
      "phone",
      "country",
      "subject",
      "tradeType",
      "category",
      "product",
      "quantity",
      "packaging",
      "destination",
      "message",
    ];

    for (const field of editableFields) {
      if (
        req.body[field] !== undefined
      ) {
        enquiry[field] =
          field === "email"
            ? normalizeEmail(
                req.body[field]
              )
            : normalizeText(
                req.body[field]
              );
      }
    }

    if (
      req.body.source !== undefined
    ) {
      if (
        !allowedSources.includes(
          req.body.source
        )
      ) {
        return res.status(400).json(
          new apiResponse(
            400,
            null,
            `Source must be one of: ${allowedSources.join(
              ", "
            )}`
          )
        );
      }

      enquiry.source =
        req.body.source;
    }

    await enquiry.save();

    return res.status(200).json(
      new apiResponse(
        200,
        enquiry,
        "Enquiry updated successfully"
      )
    );
  }
);

/* =====================================================
   DELETE ENQUIRY — ADMIN
===================================================== */

const deleteEnquiry = asyncHandler(
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
          "Invalid enquiry ID"
        )
      );
    }

    const enquiry =
      await Enquiry.findById(id);

    if (!enquiry) {
      return res.status(404).json(
        new apiResponse(
          404,
          null,
          "Enquiry not found"
        )
      );
    }

    await Enquiry.findByIdAndDelete(
      id
    );

    return res.status(200).json(
      new apiResponse(
        200,
        enquiry,
        "Enquiry deleted successfully"
      )
    );
  }
);

export {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiry,
  deleteEnquiry,
};