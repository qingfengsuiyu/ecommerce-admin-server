const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "用户名不能为空"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "邮箱不能为空"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "密码不能为空"],
    },
    role: {
      type: String,
      enum: ["admin", "editor", "viewer"],
      default: "viewer",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
