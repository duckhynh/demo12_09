import express from "express";
import { protect } from "../middlewares/authJwt.js";

const router = express.Router();

router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Bạn đã truy cập được profile!",
    user: req.user,
  });
});

/**
 * @swagger
 * tags:
 *   name: Protected
 *   description: API cần JWT token
 */

/**
 * @swagger
 * /api/protected/data:
 *   get:
 *     summary: Lấy dữ liệu bảo vệ (cần token)
 *     tags: [Protected]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về dữ liệu thành công
 *       401:
 *         description: Không có token hoặc token sai
 */

export default router;
