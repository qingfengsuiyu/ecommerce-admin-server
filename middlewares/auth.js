// 认证中间件
const jwt = require("jsonwebtoken");
const User = require("../modules/User");

const auth = async (req, res, next) => {
  try {
    // 1.从请求头获取token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "请先登录" });
    }

    // 2.提取token(去掉 "Bearer "前缀)
    const token = authHeader.split(" ")[1];

    // 3.验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // 4.查找用户
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "用户不存在" });
    }
    // 5. 把用户信息挂到req上,后续路由就能用req.user了
    req.user = user;
    next();
  } catch (e) {
    res.status(401).json({ success: false, message: "token无效或已过期" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `角色 "${req.user.role}" 无权执行此操作`,
      });
    }
    next();
  };
};

module.exports = { auth, authorize };
