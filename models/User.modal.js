// // import mongoose from "mongoose";
// // import jwt from "jsonwebtoken";
// // import bcrypt from "bcrypt";

// // const UserSchema = new mongoose.Schema(
// //   {
// //     phone: {
// //       type: String,
// //       required: true,
// //     },
// //     otp: {
// //       type: String,
// //     },
// //     isNew: {
// //       type: Boolean,
// //       default: true,
// //       required: true,
// //     },
// //     otpExpiration: {
// //       type: Date,
// //     },
// //     name: {
// //       type: String,
// //     },
// //     gender: {
// //       type: String,
// //     },
// //     role: {   // changed from roll -> role
// //       type: String,
// //       enum: ["User", "Admin"],
// //       default: "User",
// //       required: true,
// //     },
// //     dob: {
// //       type: Date,
// //     },
// //     email: {
// //       type: String,
// //       trim: true,
// //       lowercase: true,
// //     },
// //     profilepic: {
// //       type: String,
// //     },
// //     occupation: {
// //       type: String,
// //     },
// //     address: {
// //       type: String,
// //     },
// //     activeStatus: {
// //       type: Boolean,
// //       default: true,
// //     },
// //     password: {
// //       type: String,
// //     },
// //     fcmToken: {
// //       type: String,
// //     },
// //     authToken: {
// //       type: String,
// //     },
// //   },
// //   {
// //     timestamps: true,
// //   }
// // );

// // UserSchema.methods.matchPassword = async function (password) {
// //   return await bcrypt.compare(password, this.password);
// // };

// // UserSchema.methods.generateAuthToken = function () {
// //   const token = jwt.sign(
// //     { userId: this._id, accountType: this.accountType },
// //     process.env.JWT_SECRET
// //   );
// //   return token;
// // };

// // const User = mongoose.model("User", UserSchema);

// // export default User;

// import mongoose from "mongoose";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";

// const UserSchema = new mongoose.Schema(
//   {
//     phone: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     otp: {
//       type: String,
//     },

//     isNew: {
//       type: Boolean,
//       default: true,
//       required: true,
//     },

//     otpExpiration: {
//       type: Date,
//     },

//     name: {
//       type: String,
//       trim: true,
//     },

//     gender: {
//       type: String,
//       trim: true,
//     },

//     role: {
//       type: String,
//       enum: ["User", "Admin"],
//       default: "User",
//       required: true,
//     },

//     dob: {
//       type: Date,
//     },

//     email: {
//       type: String,
//       trim: true,
//       lowercase: true,
//     },

//     profilepic: {
//       type: String,
//       trim: true,
//     },

//     occupation: {
//       type: String,
//       trim: true,
//     },

//     address: {
//       type: String,
//       trim: true,
//     },

//     activeStatus: {
//       type: Boolean,
//       default: true,
//     },

//     password: {
//       type: String,
//     },

//     fcmToken: {
//       type: String,
//     },

//     authToken: {
//       type: String,
//     },
//   },
//   {
//     timestamps: true,
//     toJSON: {
//       virtuals: true,
//     },
//     toObject: {
//       virtuals: true,
//     },
//   }
// );

// /*
//  * Compatibility virtual.
//  *
//  * Your previous authentication code uses accountType,
//  * while the actual database field is role.
//  */
// UserSchema.virtual("accountType").get(function () {
//   return this.role;
// });

// UserSchema.methods.matchPassword = async function (password) {
//   if (!this.password) {
//     return false;
//   }

//   return bcrypt.compare(password, this.password);
// };

// UserSchema.methods.generateAuthToken = function () {
//   return jwt.sign(
//     {
//       userId: this._id,
//       role: this.role,

//       /*
//        * Keep accountType inside the token so old frontend
//        * or admin code continues to work.
//        */
//       accountType: this.role,
//     },
//     process.env.JWT_SECRET
//   );
// };

// const User = mongoose.model("User", UserSchema);

// export default User;



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