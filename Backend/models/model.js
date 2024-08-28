const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      // unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    imageName: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = new mongoose.model("Rishabh", userSchema);

module.exports = User;
