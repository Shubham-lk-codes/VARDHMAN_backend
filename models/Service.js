const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Point title is required"],
  },
  description: {
    type: String,
    required: [true, "Point description is required"],
  },
});

const serviceSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: {
        values: ["CA SERVICES", "COMPANY SECRETARIES (CS) SERVICES", "LAW SERVICES"],
        message: "{VALUE} is not a valid category"
      },
      required: [true, "Category is required"],
    },
    title: {
      type: String,
      required: [true, "Service title is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    points: [pointSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);