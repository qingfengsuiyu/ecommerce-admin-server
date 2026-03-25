const express = require("express");
const router = express.Router();
const User = require("../modules/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { auth } = require("../middlewares/auth");

// 注册
router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    // 1,检查用户是否存在
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "用户名或者邮箱已被注册" });
    }
    // 2.加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    // 3.创建用户
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    res.status(201).json({
      success: true,
      message: "注册成功",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    next(e);
  }
});

// 登录
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // 1.根据邮箱查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "邮箱或密码错误" });
    }

    // 2.对比密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: true, message: "邮箱或者密码错误" });
    }

    // 3.生成token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      message: "登录成功",
      data: {
        token,
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    next(e);
  }
});

// 获取当前用户信息
router.get("/me", auth, async (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      address: req.user.address,
    },
  });
});

// 更新个人信息
router.put("/profile", auth, async (req, res, next) => {
  try {
    const { username, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username, phone, address },
      {
        new: true,
      },
    ).select("-password");
    res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
