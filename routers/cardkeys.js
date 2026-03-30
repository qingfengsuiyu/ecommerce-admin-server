const express = require("express");
const router = express.Router();
const CardKey = require("../modules/CardKey");
const { auth, authorize } = require("../middlewares/auth");

router.get("/", auth, authorize("admin"), async (req, res, next) => {
  try {
    const cardKeys = await CardKey.find({})
      .populate("product", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: cardKeys });
  } catch (e) {
    next(e);
  }
});

router.post("/", auth, authorize("admin"), async (req, res, next) => {
  try {
    const { product, content, maxUsageTime } = req.body;
    const cardKey = await CardKey.create({ product, content, maxUsageTime });
    res.status(201).json({ success: true, data: cardKey });
  } catch (e) {
    next(e);
  }
});

// 退货接口
router.patch("/:id", auth, async (req, res, next) => {
  try {
    const id = req.params.id;
    const card = await CardKey.findById(id);
    if (!card) {
      throw new Error("卡密不存在");
    }

    if (card.currentUsageTime <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "使用次数已为0，无法退货" });
    }

    // 使用次数+1
    card.currentUsageTime -= 1;

    // 判断是否仍然有效
    if (card.currentUsageTime < card.maxUsageTime) {
      card.isValid = true;
    } else {
      card.isValid = false;
    }

    await card.save();
    res.json({ success: true, message: "退货成功" });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
