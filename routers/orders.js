const express = require("express");
const router = express.Router();
const Order = require("../modules/Order");
const { auth, authorize } = require("../middlewares/auth");

// 创建订单
router.post("/", auth, async (req, res,next) => {
  try {
    const { products } = req.body;

    // 计算总金额
    let totalAmount = 0;
    products.forEach((item) => {
      totalAmount += item.price * item.quantity;
    });

    // 生成订单号：时间戳 + 随机数
    const orderNo = "ORD" + Date.now() + Math.random().toString(36).slice(2, 6);

    const order = await Order.create({
      orderNo,
      user: req.user._id,
      products,
      totalAmount,
    });

    res.status(201).json({ success: true, data: order });
  } catch (e) {
    next(e);
  }
});

// 获取所有订单(管理员看所有,普通用户只看自己)
router.get("/", auth, async (req, res,next) => {
  try {
    const query = req.user.role === "admin" ? {} : { user: req.user._id };
    const orders = await Order.find(query)
      .populate("user", "username email")
      .populate("products.product", "name price image")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (e) {
    next(e);
  }
});

// 更新订单状态
router.put("/:id/status", auth, authorize("admin"), async (req, res,next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!order) {
      return res.status(404).json({ success: false, message: "订单不存在" });
    }
    res.json({ success: true, data: order });
  } catch (e) {
   next(e);
  }
});

module.exports = router;
