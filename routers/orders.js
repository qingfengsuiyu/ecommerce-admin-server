const express = require("express");
const router = express.Router();
const Order = require("../modules/Order");
const { auth, authorize } = require("../middlewares/auth");
const sendEmail = require("../utils/email");
const CardKey = require("../modules/CardKey");

// 创建订单
router.post("/", auth, async (req, res, next) => {
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
router.get("/", auth, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, keyword = "" } = req.query;
    const query = req.user.role === "admin" ? {} : { user: req.user._id };
    if (keyword) {
      query.orderNo = { $regex: keyword, $options: "i" };
    }
    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate("user", "username email")
      .populate("products.product", "name price image")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
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

// 更新订单状态
router.put("/:id/status", auth, authorize("admin"), async (req, res, next) => {
  try {
    const { status } = req.body;
    // 更新状态
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    // 如果为发货状态
    if (status === "shipped") {
      const orderDetail = await Order.findById(req.params.id)
        .populate("user", "email")
        .populate("products.product", "name");

      const email = orderDetail.user.email;

      // 一个订单多个商品
      // 用于存放多个卡密信息,最后统一发送出去
      const cardKeyContents = [];
      for (const item of orderDetail.products) {
        const productId = item.product._id;
        // 查找这个商品的可用卡密
        // 找到了 → 使用次数+1，把内容存到 cardKeyContents
        // 没找到 → 记录"该商品暂无卡密"
        // 查找可用卡密
        const cardKey = await CardKey.findOne({
          product: productId,
          isValid: true,
          $expr: { $lt: ["$currentUsageTime", "$maxUsageTime"] },
        });

        if (cardKey) {
          // 使用次数 +1
          cardKey.currentUsageTime += 1;
          // 如果用完了，标记为不可用
          if (cardKey.currentUsageTime >= cardKey.maxUsageTime) {
            cardKey.isValid = false;
          }
          await cardKey.save();
          cardKeyContents.push({
            name: item.product.name,
            content: cardKey.content,
          });
        } else {
          cardKeyContents.push({
            name: item.product.name,
            content: "该商品暂无卡密，请联系客服",
          });
        }
      }

      const finalContext = cardKeyContents
        .map((item) => `${item.name}：${item.content}`)
        .join("\n");

      // 发邮件，把卡密内容发给用户
      await sendEmail(
        email,
        "您的订单已发货",
        "您购买的商品信息：" + finalContext,
      );
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "订单不存在" });
    }
    res.json({ success: true, data: order });
  } catch (e) {
    next(e);
  }
});

// 获取单个订单详情
router.get("/:id", auth, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "username email")
      .populate("products.product", "name price image");

    if (!order) {
      return res.status(404).json({ success: false, message: "订单不存在" });
    }

    // 普通用户只能看自己的订单
    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "无权查看此订单" });
    }

    res.json({ success: true, data: order });
  } catch (e) {
    next(e);
  }
});

// 用户支付订单（模拟支付）
router.put("/:id/pay", auth, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "订单不存在" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "无权操作此订单" });
    }
    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "只有待支付的订单才能支付" });
    }

    order.status = "paid";
    await order.save();
    res.json({ success: true, data: order });
  } catch (e) {
    next(e);
  }
});

// 用户取消订单
router.put("/:id/cancel", auth, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "订单不存在" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "无权操作此订单" });
    }
    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "只有待支付的订单才能取消" });
    }

    order.status = "cancelled";
    await order.save();
    res.json({ success: true, data: order });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
