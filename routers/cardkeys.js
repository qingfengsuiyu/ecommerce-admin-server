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






module.exports = router;
