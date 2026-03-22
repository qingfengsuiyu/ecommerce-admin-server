const express = require("express");
const router = express.Router();
const Category = require("../modules/Category");
const { auth, authorize } = require("../middlewares/auth");

// 获取所有分类(公开)
router.get("/", async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ success: true, data: categories });
  } catch (e) {
    next(e);
  }
});

// 创建分类（仅管理员）
router.post("/", auth, authorize("admin"), async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (e) {
    next(e);
  }
});

// 删除分类（仅管理员）

router.delete("/:id", auth, authorize("admin"), async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "分类不存在" });
    }
    res.json({ success: true, message: "删除成功" });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
