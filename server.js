import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import protectedRoutes from "./routes/protected.js";

dotenv.config(); // load biến môi trường

// Kết nối MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());           // cho phép front-end gọi API
app.use(express.json());   // parse JSON body

// Mount route
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);

// Route test nhanh
app.get("/", (req, res) => {
  res.send("Server chạy OK 🚀");
});

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên port ${PORT}`);
});
