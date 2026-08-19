
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    otp: {
      type: String,
    },

    otpExpiration: {
      type: Date,
    },

    isNew: {
      type: Boolean,
      default: true,
      required: true,
    },

    name: {
      type: String,
      trim: true,
    },

    gender: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
      required: true,
    },

    dob: {
      type: Date,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    profilepic: {
      type: String,
      trim: true,
    },

    occupation: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    activeStatus: {
      type: Boolean,
      default: true,
    },

    password: {
      type: String,
      select: false,
    },

    fcmToken: {
      type: String,
      trim: true,
    },

    authToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  }
);

/*
  Compatibility field.

  Existing APIs may use accountType,
  while MongoDB stores the actual value in role.
*/
UserSchema.virtual("accountType").get(function () {
  return this.role;
});

/*
  Compare login password.
*/
UserSchema.methods.matchPassword = async function (password) {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(password, this.password);
};

/*
  Generate JWT access token.
*/
UserSchema.methods.generateAuthToken = function () {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in environment variables");
  }

  return jwt.sign(
    {
      userId: this._id,
      role: this.role,
      accountType: this.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const User = mongoose.model("User", UserSchema);

export default User;