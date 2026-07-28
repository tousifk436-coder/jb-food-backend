// // import mongoose from "mongoose";

// // const querySchema = new mongoose.Schema(
// //   {
// //     name: {
// //       type: String,
// //       required: true,
// //       trim: true,
// //     },
// //     phone: {
// //       type: String,
// //       required: true,
// //       trim: true,
// //     },
// //     pdf: {
// //       type: String,
// //       required: true,
// //     },
// //   },
// //   { timestamps: true }
// // );

// // export default mongoose.model("Query", querySchema);

// import mongoose from "mongoose";

// const querySchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     phone: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     pdf: {
//       type: String,
//       default: "/uploads/pdfs/portfolio.pdf",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export default mongoose.model("Query", querySchema);

import mongoose from "mongoose";

const querySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    pdf: {
      type: String,
      default: "/uploads/pdfs/portfolio.pdf",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Query", querySchema);