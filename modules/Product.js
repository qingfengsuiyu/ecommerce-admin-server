const mongoose = require("mongoose");

// Schema:定义商品的数据结构
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "上面名称不能为空"],
    },
    price: {
      type: Number,
      required: [true, "价格不能为空"],
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Product", productSchema);
