const mongoose = require("mongoose");

const cardKeySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    content: {
      type: String,
      required: [true, "卡密内容不能为空"],
    },
    maxUsageTime: {
      type: Number,
      required: true,
    },
    currentUsageTime: {
      type: Number,
      default: 0,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("CardKey", cardKeySchema);
