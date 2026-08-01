import mongoose from "mongoose";

import FAQ from "../models/FAQ.modal.js";

import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

/* =====================================================
   HELPERS
===================================================== */

const parseBoolean = (value, fallback = false) => {
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

const parseNumber = (value, fallback = 0) => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : fallback;
};

const escapeRegex = (value = "") => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

/* =====================================================
   CREATE FAQ
===================================================== */

const createFAQ = asyncHandler(async (req, res) => {
  const {
    question,
    answer,
    category,
    order,
    isActive,
  } = req.body;

  const normalizedQuestion = String(
    question || ""
  ).trim();

  const normalizedAnswer = String(
    answer || ""
  ).trim();

  if (!normalizedQuestion) {
    return res.status(400).json(
      new apiResponse(
        400,
        null,
        "FAQ question is required"
      )
    );
  }

  if (!normalizedAnswer) {
    return res.status(400).json(
      new apiResponse(
        400,
        null,
        "FAQ answer is required"
      )
    );
  }

  const existingFAQ = await FAQ.findOne({
    question: {
      $regex: new RegExp(
        `^${escapeRegex(normalizedQuestion)}$`,
        "i"
      ),
    },
  });

  if (existingFAQ) {
    return res.status(409).json(
      new apiResponse(
        409,
        null,
        "This FAQ question already exists"
      )
    );
  }

  const faq = await FAQ.create({
    question: normalizedQuestion,

    answer: normalizedAnswer,

    category:
      String(category || "General").trim() ||
      "General",

    order: parseNumber(order, 0),

    isActive: parseBoolean(
      isActive,
      true
    ),
  });

  return res.status(201).json(
    new apiResponse(
      201,
      faq,
      "FAQ created successfully"
    )
  );
});

/* =====================================================
   GET PUBLIC FAQS
===================================================== */

const getFAQs = asyncHandler(async (req, res) => {
  const {
    limit = 10,
    category,
    search = "",
  } = req.query;

  const filter = {
    isActive: true,
  };

  if (category) {
    filter.category = {
      $regex: new RegExp(
        `^${escapeRegex(
          String(category).trim()
        )}$`,
        "i"
      ),
    };
  }

  if (String(search).trim()) {
    const regex = new RegExp(
      escapeRegex(String(search).trim()),
      "i"
    );

    filter.$or = [
      {
        question: regex,
      },
      {
        answer: regex,
      },
      {
        category: regex,
      },
    ];
  }

  const limitNumber = Math.min(
    100,
    Math.max(1, Number(limit) || 10)
  );

  const faqs = await FAQ.find(filter)
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
        faqs,
        totalFAQs: faqs.length,
      },
      "FAQs fetched successfully"
    )
  );
});

/* =====================================================
   GET PUBLIC FAQ BY ID
===================================================== */

const getFAQById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new apiResponse(
        400,
        null,
        "Invalid FAQ ID"
      )
    );
  }

  const faq = await FAQ.findOne({
    _id: id,
    isActive: true,
  }).lean();

  if (!faq) {
    return res.status(404).json(
      new apiResponse(
        404,
        null,
        "FAQ not found"
      )
    );
  }

  return res.status(200).json(
    new apiResponse(
      200,
      faq,
      "FAQ fetched successfully"
    )
  );
});

/* =====================================================
   GET ALL FAQS FOR ADMIN
===================================================== */

const getAllFAQs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    category,
    isActive,
    sortBy = "order",
    isPagination = "true",
  } = req.query;

  const pageNumber = Math.max(
    1,
    Number(page) || 1
  );

  const limitNumber = Math.min(
    100,
    Math.max(1, Number(limit) || 10)
  );

  const filter = {};

  if (isActive !== undefined) {
    filter.isActive = parseBoolean(isActive);
  }

  if (category) {
    filter.category = {
      $regex: new RegExp(
        `^${escapeRegex(
          String(category).trim()
        )}$`,
        "i"
      ),
    };
  }

  if (String(search).trim()) {
    const regex = new RegExp(
      escapeRegex(String(search).trim()),
      "i"
    );

    filter.$or = [
      {
        question: regex,
      },
      {
        answer: regex,
      },
      {
        category: regex,
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

    question: {
      question: 1,
    },
  };

  const selectedSort =
    sortOptions[sortBy] ||
    sortOptions.order;

  const totalFAQs =
    await FAQ.countDocuments(filter);

  let query = FAQ.find(filter).sort(
    selectedSort
  );

  if (isPagination === "true") {
    query = query
      .skip(
        (pageNumber - 1) *
          limitNumber
      )
      .limit(limitNumber);
  }

  const faqs = await query.lean();

  return res.status(200).json(
    new apiResponse(
      200,
      {
        faqs,
        totalFAQs,

        totalPages:
          isPagination === "true"
            ? Math.ceil(
                totalFAQs /
                  limitNumber
              )
            : 1,

        currentPage: pageNumber,
      },
      "All FAQs fetched successfully"
    )
  );
});

/* =====================================================
   GET FAQ BY ID FOR ADMIN
===================================================== */

const getAdminFAQById = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Invalid FAQ ID"
        )
      );
    }

    const faq = await FAQ.findById(id);

    if (!faq) {
      return res.status(404).json(
        new apiResponse(
          404,
          null,
          "FAQ not found"
        )
      );
    }

    return res.status(200).json(
      new apiResponse(
        200,
        faq,
        "FAQ fetched successfully"
      )
    );
  }
);

/* =====================================================
   UPDATE FAQ
===================================================== */

const updateFAQ = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new apiResponse(
        400,
        null,
        "Invalid FAQ ID"
      )
    );
  }

  const faq = await FAQ.findById(id);

  if (!faq) {
    return res.status(404).json(
      new apiResponse(
        404,
        null,
        "FAQ not found"
      )
    );
  }

  if (req.body.question !== undefined) {
    const updatedQuestion = String(
      req.body.question
    ).trim();

    if (!updatedQuestion) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "FAQ question cannot be empty"
        )
      );
    }

    const duplicateFAQ = await FAQ.findOne({
      _id: {
        $ne: id,
      },

      question: {
        $regex: new RegExp(
          `^${escapeRegex(
            updatedQuestion
          )}$`,
          "i"
        ),
      },
    });

    if (duplicateFAQ) {
      return res.status(409).json(
        new apiResponse(
          409,
          null,
          "This FAQ question already exists"
        )
      );
    }

    faq.question = updatedQuestion;
  }

  if (req.body.answer !== undefined) {
    const updatedAnswer = String(
      req.body.answer
    ).trim();

    if (!updatedAnswer) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "FAQ answer cannot be empty"
        )
      );
    }

    faq.answer = updatedAnswer;
  }

  if (req.body.category !== undefined) {
    faq.category =
      String(req.body.category).trim() ||
      "General";
  }

  if (req.body.order !== undefined) {
    faq.order = parseNumber(
      req.body.order,
      faq.order
    );
  }

  if (req.body.isActive !== undefined) {
    faq.isActive = parseBoolean(
      req.body.isActive,
      faq.isActive
    );
  }

  await faq.save();

  return res.status(200).json(
    new apiResponse(
      200,
      faq,
      "FAQ updated successfully"
    )
  );
});

/* =====================================================
   DELETE FAQ
===================================================== */

const deleteFAQ = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(
      new apiResponse(
        400,
        null,
        "Invalid FAQ ID"
      )
    );
  }

  const faq = await FAQ.findById(id);

  if (!faq) {
    return res.status(404).json(
      new apiResponse(
        404,
        null,
        "FAQ not found"
      )
    );
  }

  await FAQ.findByIdAndDelete(id);

  return res.status(200).json(
    new apiResponse(
      200,
      faq,
      "FAQ deleted successfully"
    )
  );
});

export {
  createFAQ,
  getFAQs,
  getFAQById,
  getAllFAQs,
  getAdminFAQById,
  updateFAQ,
  deleteFAQ,
};