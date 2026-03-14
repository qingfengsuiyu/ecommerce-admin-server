const express = require("express");
const router = express.Router();
const Product = require("../modules/Product");
const Order = require("../modules/Order");
const User = require("../modules/User");
const { auth, authorize } = require("../middlewares/auth");

// 获取统计数据(仅管理员)

router.get("/stats", auth, authorize("admin"), async (req, res,next) => {
  try {
    // 1.基础统计
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();

    // 2.订单金额统计(使用聚合查询)
    const amountStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          avgOrderAmount: { $avg: "$totalAmount" },
        },
      },
    ]);

    // 3.各订单状态查询
    const orderStatusStats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue: amountStats[0]?.totalRevenue || 0,
        avgOrderAmount: Math.round(amountStats[0]?.avgOrderAmount || 0),
        orderStatusStats,
      },
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
