import express from "express";
import { User } from "../models/user.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email đã tồn tại" });


    const user = await User.create({ username, email, password });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({ 
      user: { id: user._id, username: user.username, email: user.email },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
  
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });


    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });


    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      user: { id: user._id, username: user.username, email: user.email },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API cho đăng ký và đăng nhập
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký user mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo user thành công
 *       400:
 *         description: Lỗi validate
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login thành công, trả về token
 *       400:
 *         description: Sai email hoặc password
 */

export default router;
