import express from "express";
import { User } from "../models/user.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"; 
import crypto from "crypto";


dotenv.config();

const router = express.Router();

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check username tồn tại chưa
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: "Username đã tồn tại" });
    }

    // Check email tồn tại chưa
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Tạo user mới
    const user = await User.create({ username, email, password });

    // Tạo JWT token
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


// Quên mật khẩu
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    // Tạo raw token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token lưu DB
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

   user.resetPasswordToken = hashedToken;
   user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });
    const checkUser = await User.findById(user._id);

    // Debug log
    console.log("Raw token gửi cho user:", resetToken);
    console.log("Hash lưu vào DB:", user.resetPasswordToken);
    console.log("Expire:", user.resetPasswordExpires);

    res.json({
      message: "Token reset đã được tạo",
      resetToken, // ⚡ Gửi về client để test, sau này gửi email
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reset mật khẩu
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Hash token user gửi
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Tìm user với token & chưa hết hạn
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token không hợp lệ hoặc hết hạn" });
    }

    // Cập nhật password mới
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Mật khẩu đã được đổi thành công ✅" });
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

/**
 * @swagger
 * /forgot-password:
 *   post:
 *     summary: Yêu cầu reset mật khẩu
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tạo reset token thành công
 *       404:
 *         description: User không tồn tại
 */

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Reset mật khẩu bằng token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset password thành công
 *       400:
 *         description: Token không hợp lệ hoặc hết hạn
 */


export default router;
