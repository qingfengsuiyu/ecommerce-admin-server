const errorHandler = (err, req, res, next) => {
  console.log("错误:", err.message);

  // Mongoose 验证错误 (比如必填字段为空)
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "数据验证失败",
      errors: message,
    });
  }

  // MongoDB 唯一索引冲突(比如用户名重复)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field}已经存在`,
    });
  }

  // Mongoose ObjectId 格式错误
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "请求参数格式有误",
    });
  }

  // 默认500错误
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "服务器内部错误",
  });
};

module.exports = errorHandler;
