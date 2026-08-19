


import mongoose from "mongoose";
import bcrypt from "bcrypt";

import User from "../models/User.modal.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { generateOTP } from "../utils/generateOTP.js";
import { sendWhatsappOTP } from "../utils/sendOTP.js";

const OTP_EXPIRATION_TIME = 5 * 60 * 1000;

/*
  Supports both field names:

  Old schema:
  isNew

  Recommended schema:
  isFirstLogin
*/
const FIRST_LOGIN_FIELD = User.schema.path("isFirstLogin")
  ? "isFirstLogin"
  : "isNew";

const getFirstLoginStatus = (user) => {
  if (user?.isFirstLogin !== undefined) {
    return user.isFirstLogin;
  }

  if (user?.isNew !== undefined) {
    return user.isNew;
  }

  return false;
};

const setFirstLoginStatus = (user, value) => {
  user[FIRST_LOGIN_FIELD] = value;
};

const normalizePhone = (phone) => {
  return String(phone || "")
    .replace(/\s+/g, "")
    .trim();
};

const isValidPhone = (phone) => {
  return /^[0-9]{10}$/.test(phone);
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getSafeUserData = (user, authToken = null) => {
  const data = {
    _id: user._id,
    phone: user.phone,
    name: user.name,
    email: user.email,
    gender: user.gender,
    role: user.role,
    accountType: user.role,
    dob: user.dob,
    profilepic: user.profilepic,
    occupation: user.occupation,
    address: user.address,
    activeStatus: user.activeStatus,
    isNew: getFirstLoginStatus(user),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  if (authToken) {
    data.authToken = authToken;
  }

  return data;
};

/* =====================================================
   REGISTER OR LOGIN WITH OTP
===================================================== */

const registerOrLogin = asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body.phone);

  if (!phone) {
    return res.status(400).json(
      new apiResponse(
        400,
        null,
        "Phone number is required"
      )
    );
  }

  if (!isValidPhone(phone)) {
    return res.status(400).json(
      new apiResponse(
        400,
        null,
        "Phone number must contain exactly 10 digits"
      )
    );
  }

  let user = await User.findOne({ phone });

  if (user && user.activeStatus === false) {
    return res.status(403).json(
      new apiResponse(
        403,
        null,
        "Your account is inactive"
      )
    );
  }

  const otp =
    phone === "1111111111"
      ? "0101"
      : String(generateOTP());

  const otpExpiration = new Date(
    Date.now() + OTP_EXPIRATION_TIME
  );

  if (!user) {
    user = new User({
      phone,
      otp,
      otpExpiration,
      role: "User",
      activeStatus: true,
      [FIRST_LOGIN_FIELD]: true,
    });
  } else {
    user.otp = otp;
    user.otpExpiration = otpExpiration;
  }

  await user.save();

  /*
    OTP sending fails hone par registration request ko
    silently successful mat dikhana.
  */
  await sendWhatsappOTP(phone, otp);

  return res.status(user.isNew ? 201 : 200).json(
    new apiResponse(
      user.isNew ? 201 : 200,
      {
        _id: user._id,
        phone: user.phone,
        isNew: getFirstLoginStatus(user),
      },
      user.isNew
        ? "User created and OTP sent successfully"
        : "OTP sent successfully"
    )
  );
});

/* =====================================================
   VERIFY OTP
===================================================== */

const verifyOtp = asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const otp = String(req.body.otp || "").trim();

  if (!phone || !otp) {
    return res.status(400).json(
      new apiResponse(
        400,
        null,
        "Phone number and OTP are required"
      )
    );
  }

  const user = await User.findOne({ phone }).select(
    "+authToken"
  );

  if (!user) {
    return res.status(404).json(
      new apiResponse(
        404,
        null,
        "User not found"
      )
    );
  }

  if (user.activeStatus === false) {
    return res.status(403).json(
      new apiResponse(
        403,
        null,
        "Your account is inactive"
      )
    );
  }

  if (!user.otp || String(user.otp) !== otp) {
    return res.status(400).json(
      new apiResponse(
        400,
        null,
        "Invalid OTP"
      )
    );
  }

  if (
    !user.otpExpiration ||
    new Date() > new Date(user.otpExpiration)
  ) {
    return res.status(400).json(
      new apiResponse(
        400,
        null,
        "OTP has expired. Please request a new OTP"
      )
    );
  }

  const token = user.generateAuthToken();

  user.otp = undefined;
  user.otpExpiration = undefined;
  user.authToken = token;

  await user.save();

  return res.status(200).json(
    new apiResponse(
      200,
      getSafeUserData(user, token),
      "OTP verified successfully"
    )
  );
});

/* =====================================================
   RESEND OTP
===================================================== */

const resendOtp = asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body.phone);

  if (!phone) {
    return res.status(400).json(
      new apiResponse(
        400,
        null,
        "Phone number is required"
      )
    );
  }

  if (!isValidPhone(phone)) {
    return res.status(400).json(
      new apiResponse(
        400,
        null,
        "Phone number must contain exactly 10 digits"
      )
    );
  }

  const user = await User.findOne({ phone });

  if (!user) {
    return res.status(404).json(
      new apiResponse(
        404,
        null,
        "User not found"
      )
    );
  }

  if (user.activeStatus === false) {
    return res.status(403).json(
      new apiResponse(
        403,
        null,
        "Your account is inactive"
      )
    );
  }

  const otp =
    phone === "1111111111"
      ? "0101"
      : String(generateOTP());

  user.otp = otp;
  user.otpExpiration = new Date(
    Date.now() + OTP_EXPIRATION_TIME
  );

  await user.save();
  await sendWhatsappOTP(phone, otp);

  return res.status(200).json(
    new apiResponse(
      200,
      {
        phone: user.phone,
      },
      "OTP resent successfully"
    )
  );
});

/* =====================================================
   LOGIN WITH PASSWORD
===================================================== */

const loginWithPassword = asyncHandler(
  async (req, res) => {
    const phone = normalizePhone(req.body.phone);
    const password = String(
      req.body.password || ""
    );

    if (!phone || !password) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Phone number and password are required"
        )
      );
    }

    /*
      Important:

      User model mein password select:false hai,
      isliye +password use karna necessary hai.
    */
    const user = await User.findOne({ phone }).select(
      "+password +authToken"
    );

    if (!user) {
      return res.status(404).json(
        new apiResponse(
          404,
          null,
          "User not found"
        )
      );
    }

    if (user.activeStatus === false) {
      return res.status(403).json(
        new apiResponse(
          403,
          null,
          "Your account is inactive"
        )
      );
    }

    if (!user.password) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Password has not been created for this user"
        )
      );
    }

    const isPasswordCorrect =
      await user.matchPassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json(
        new apiResponse(
          401,
          null,
          "Invalid phone number or password"
        )
      );
    }

    const token = user.generateAuthToken();

    user.authToken = token;

    await user.save();

    return res.status(200).json(
      new apiResponse(
        200,
        getSafeUserData(user, token),
        "Login successful"
      )
    );
  }
);

/* =====================================================
   CREATE USER
===================================================== */

const createUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    gender,
    dob,
    role = "User",
    address,
    password,
    occupation,
    profilepic,
    activeStatus = true,
  } = req.body;

  const phone = normalizePhone(req.body.phone);

  if (!phone) {
    return res.status(400).json(
      new apiResponse(
        400,
        null,
        "Phone number is required"
      )
    );
  }

  if (!isValidPhone(phone)) {
    return res.status(400).json(
      new apiResponse(
        400,
        null,
        "Phone number must contain exactly 10 digits"
      )
    );
  }

  if (!password) {
    return res.status(400).json(
      new apiResponse(
        400,
        null,
        "Password is required"
      )
    );
  }

  if (String(password).length < 6) {
    return res.status(400).json(
      new apiResponse(
        400,
        null,
        "Password must contain at least 6 characters"
      )
    );
  }

  if (!["User", "Admin"].includes(role)) {
    return res.status(400).json(
      new apiResponse(
        400,
        null,
        "Role must be User or Admin"
      )
    );
  }

  const normalizedEmail = email
    ? String(email).trim().toLowerCase()
    : undefined;

  const duplicateConditions = [{ phone }];

  if (normalizedEmail) {
    duplicateConditions.push({
      email: normalizedEmail,
    });
  }

  const existingUser = await User.findOne({
    $or: duplicateConditions,
  });

  if (existingUser) {
    return res.status(409).json(
      new apiResponse(
        409,
        null,
        "User with this phone number or email already exists"
      )
    );
  }

  const hashedPassword = await bcrypt.hash(
    String(password),
    10
  );

  const newUser = await User.create({
    phone,
    name: name
      ? String(name).trim()
      : undefined,
    email: normalizedEmail,
    gender,
    dob,
    role,
    address,
    occupation,
    profilepic,
    password: hashedPassword,
    activeStatus:
      activeStatus === false ||
      String(activeStatus).toLowerCase() === "false"
        ? false
        : true,
    [FIRST_LOGIN_FIELD]: false,
  });

  return res.status(201).json(
    new apiResponse(
      201,
      getSafeUserData(newUser),
      "User created successfully"
    )
  );
});

/* =====================================================
   GET ALL USERS
===================================================== */

const getAllUsers = asyncHandler(async (req, res) => {
  const {
    isPagination = "true",
    page = 1,
    limit = 10,
    search = "",
    sortBy = "recent",
    role,
    activeStatus,
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

  if (role && ["User", "Admin"].includes(role)) {
    filter.role = role;
  }

  if (activeStatus !== undefined) {
    filter.activeStatus =
      String(activeStatus).toLowerCase() === "true";
  }

  if (String(search).trim()) {
    const regex = new RegExp(
      String(search).trim(),
      "i"
    );

    filter.$or = [
      { name: regex },
      { phone: regex },
      { email: regex },
      { occupation: regex },
    ];
  }

  const sort =
    sortBy === "oldest"
      ? { createdAt: 1 }
      : { createdAt: -1 };

  const totalUsers =
    await User.countDocuments(filter);

  let query = User.find(filter)
    .select(
      "-password -otp -otpExpiration -authToken"
    )
    .sort(sort);

  if (isPagination === "true") {
    query = query
      .skip(
        (pageNumber - 1) * limitNumber
      )
      .limit(limitNumber);
  }

  const users = await query.lean();

  return res.status(200).json(
    new apiResponse(
      200,
      {
        users,
        totalUsers,
        totalPages:
          isPagination === "true"
            ? Math.ceil(
                totalUsers / limitNumber
              )
            : 1,
        currentPage: pageNumber,
      },
      "Users fetched successfully"
    )
  );
});

/* =====================================================
   GET LOGGED-IN PROFILE
===================================================== */

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(
    req.user._id
  ).select(
    "-password -otp -otpExpiration -authToken"
  );

  if (!user) {
    return res.status(404).json(
      new apiResponse(
        404,
        null,
        "User not found"
      )
    );
  }

  return res.status(200).json(
    new apiResponse(
      200,
      getSafeUserData(user),
      "Profile fetched successfully"
    )
  );
});

/* =====================================================
   UPDATE USER
===================================================== */

const updateUserById = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Invalid user ID"
        )
      );
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json(
        new apiResponse(
          404,
          null,
          "User not found"
        )
      );
    }

    const allowedFields = [
      "name",
      "email",
      "gender",
      "dob",
      "profilepic",
      "occupation",
      "address",
      "activeStatus",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (
          field === "email" &&
          req.body[field]
        ) {
          user[field] = String(
            req.body[field]
          )
            .trim()
            .toLowerCase();
        } else {
          user[field] = req.body[field];
        }
      }
    }

    setFirstLoginStatus(user, false);

    await user.save();

    return res.status(200).json(
      new apiResponse(
        200,
        getSafeUserData(user),
        "User updated successfully"
      )
    );
  }
);

/* =====================================================
   UPDATE USER ROLE
===================================================== */

const updateUserRole = asyncHandler(
  async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!isValidObjectId(userId)) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Invalid user ID"
        )
      );
    }

    if (!["User", "Admin"].includes(role)) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Role must be User or Admin"
        )
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json(
        new apiResponse(
          404,
          null,
          "User not found"
        )
      );
    }

    user.role = role;

    await user.save();

    return res.status(200).json(
      new apiResponse(
        200,
        getSafeUserData(user),
        "User role updated successfully"
      )
    );
  }
);

/* =====================================================
   CREATE PASSWORD
===================================================== */

const createPassword = asyncHandler(
  async (req, res) => {
    const phone = normalizePhone(
      req.body.phone || req.user?.phone
    );

    const password = String(
      req.body.password || ""
    );

    if (!phone || !password) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Phone number and password are required"
        )
      );
    }

    if (password.length < 6) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Password must contain at least 6 characters"
        )
      );
    }

    const user = await User.findOne({
      phone,
    }).select("+password");

    if (!user) {
      return res.status(404).json(
        new apiResponse(
          404,
          null,
          "User not found"
        )
      );
    }

    if (user.password) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Password is already set for this user"
        )
      );
    }

    user.password = await bcrypt.hash(
      password,
      10
    );

    setFirstLoginStatus(user, false);

    await user.save();

    return res.status(200).json(
      new apiResponse(
        200,
        null,
        "Password created successfully"
      )
    );
  }
);

/* =====================================================
   UPDATE PASSWORD
===================================================== */

const updatePassword = asyncHandler(
  async (req, res) => {
    const phone = normalizePhone(
      req.body.phone || req.user?.phone
    );

    const oldPassword = String(
      req.body.oldPassword || ""
    );

    const newPassword = String(
      req.body.newPassword || ""
    );

    if (
      !phone ||
      !oldPassword ||
      !newPassword
    ) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Phone number, old password and new password are required"
        )
      );
    }

    if (newPassword.length < 6) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "New password must contain at least 6 characters"
        )
      );
    }

    const user = await User.findOne({
      phone,
    }).select("+password");

    if (!user) {
      return res.status(404).json(
        new apiResponse(
          404,
          null,
          "User not found"
        )
      );
    }

    if (!user.password) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Password has not been created for this user"
        )
      );
    }

    const isCorrectPassword =
      await user.matchPassword(oldPassword);

    if (!isCorrectPassword) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Old password is incorrect"
        )
      );
    }

    user.password = await bcrypt.hash(
      newPassword,
      10
    );

    await user.save();

    return res.status(200).json(
      new apiResponse(
        200,
        null,
        "Password updated successfully"
      )
    );
  }
);

/* =====================================================
   RESET PASSWORD
===================================================== */

const resetPassword = asyncHandler(
  async (req, res) => {
    const phone = normalizePhone(
      req.body.phone || req.user?.phone
    );

    const password = String(
      req.body.password ||
        req.body.newPassword ||
        ""
    );

    if (!phone || !password) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Phone number and new password are required"
        )
      );
    }

    if (password.length < 6) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "New password must contain at least 6 characters"
        )
      );
    }

    const user = await User.findOne({
      phone,
    }).select("+password");

    if (!user) {
      return res.status(404).json(
        new apiResponse(
          404,
          null,
          "User not found"
        )
      );
    }

    user.password = await bcrypt.hash(
      password,
      10
    );

    setFirstLoginStatus(user, false);

    await user.save();

    return res.status(200).json(
      new apiResponse(
        200,
        null,
        "Password reset successfully"
      )
    );
  }
);

/* =====================================================
   DELETE USER
===================================================== */

const deleteUser = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json(
        new apiResponse(
          400,
          null,
          "Invalid user ID"
        )
      );
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json(
        new apiResponse(
          404,
          null,
          "User not found"
        )
      );
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json(
      new apiResponse(
        200,
        null,
        "User deleted successfully"
      )
    );
  }
);

export {
  registerOrLogin,
  verifyOtp,
  resendOtp,
  loginWithPassword,
  createUser,
  getAllUsers,
  getProfile,
  updateUserById,
  updateUserRole,
  createPassword,
  updatePassword,
  resetPassword,
  deleteUser,
};