const express = require("express");
const router = express.Router();
const Product = require("../modules/Product");
const { auth, authorize } = require("../middlewares/auth");

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// console.log(
//   "Cloudinary配置:",
//   process.env.CLOUDINARY_CLOUD_NAME ? "已加载" : "未加载",
// );
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ecommerce-admin",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

// 查:获取所有商品
router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 10, keyword = "" } = req.query;

    // 构建查询条件
    const query = {};
    if (keyword) {
      query.name = { $regex: keyword, $options: "i" };
    }

    // 计算跳过多少条
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
      },
    });
  } catch (e) {
    next(e);
  }
});

// 上传图片
router.post("/upload", auth, upload.single("image"), (req, res, next) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "请选择要上传的图片" });
  }

  res.json({
    success: true,
    message: "上传成功",
    data: { imageUrl: req.file.path },
  });
});

// 查:获取单个商品
router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "商品不存在" });
    }
    res.json({ success: true, data: product });
  } catch (e) {
    next(e);
  }
});

// 增:添加商品
router.post("/", auth, authorize("admin", "editor"), async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (e) {
    next(e);
  }
});

// 改:更新商品
router.put(
  "/:id",
  auth,
  authorize("admin", "editor"),
  async (req, res, next) => {
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!product) {
        return res.status(404).json({ success: false, message: "商品不存在" });
      }
      res.json({ success: true, data: product });
    } catch (e) {
      next(e);
    }
  },
);

// 删:删除商品
router.delete("/:id", auth, authorize("admin"), async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "商品不存在" });
    }
    res.json({ success: true, message: "删除成功" });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
