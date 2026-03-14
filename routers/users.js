const express = require("express");
const router = express.Router();
const User = require("../modules/User");
const { auth, authorize } = require("../middlewares/auth");

// 获取所有用户(仅管理员)
router.get("/", auth, authorize("admin"), async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({
      success: true,
      data: users,
    });
  } catch (e) {
    next(e);
  }
});

// 修改用户角色(仅管理员)
router.put("/:id/role", auth, authorize("admin"), async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "用户不存在" });
    }
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
