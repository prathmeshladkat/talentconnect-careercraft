import express from "express";
import db from "../db.js";
const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const [[{ totalCourses }]] = await db.query(
      "SELECT COUNT(*) AS totalCourses FROM courses"
    );
    const [[{ totalPartners }]] = await db.query(
      "SELECT COUNT(*) AS totalPartners FROM partners"
    );
    const [[{ totalSuccessStories }]] = await db.query(
      "SELECT COUNT(*) AS totalSuccessStories FROM success_stories"
    );
    const [[{ totalUsers }]] = await db.query(
      "SELECT COUNT(*) AS totalUsers FROM users"
    );

    res.json({
      totalCourses,
      totalPartners,
      totalSuccessStories,
      totalUsers,
    });
  } catch (err) {
    console.error("stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
