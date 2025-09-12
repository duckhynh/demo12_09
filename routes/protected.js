import express from "express";
import { protect } from "../middlewares/authJwt.js";

const router = express.Router();

router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Bạn đã truy cập được profile!",
    user: req.user,
  });
});

export default router;
