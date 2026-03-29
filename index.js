require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const productRoutes = require("./routers/products");
const authRoutes = require("./routers/auth");
const orderRoutes = require("./routers/orders");
const dashboardRoutes = require("./routers/dashboard");
const userRoutes = require("./routers/users");
const errorHandler = require("./middlewares/errorHandler");
const cors = require("cors");
const categoryRoutes = require("./routers/categories");
const cardKeyRoutes = require("./routers/cardkeys");

const app = express();
app.use(express.json());
app.use("/uploads", express.static("public/uploads"));
app.use(cors());

// 链接数据库
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB 连接成功");
    app.listen(3000, () => {
      console.log("服务器启动了,访问 http://localhost:3000");
    });
  })
  .catch((err) => {
    console.log("数据库链接失败:", err);
  });

// 挂载路由，所有 /api/products 开头的请求都交给 productRoutes 处理,注意挂载的位置
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cardkeys", cardKeyRoutes);

// 放在所有 app.use 路由的最后面
app.use(errorHandler);
