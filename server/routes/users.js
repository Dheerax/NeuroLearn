import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Get or create user (for demo, we use a single default user)
router.get("/me", async (req, res) => {
  try {
    let user = await User.findOne();

    if (!user) {
      // Create default user if none exists
      user = await User.create({
        name: "Student",
        avatar: "🧠",
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put("/me", async (req, res) => {
  try {
    const { name, avatar, preferences, profile, stats, gamification } =
      req.body;

    let user = await User.findOne();

    if (!user) {
      user = await User.create({ name, avatar });
    } else {
      if (name) user.name = name;
      if (avatar) user.avatar = avatar;
      if (preferences)
        user.preferences = { ...user.preferences, ...preferences };
      if (profile) user.profile = { ...user.profile, ...profile };
      if (stats) user.stats = { ...user.stats, ...stats };
      if (gamification)
        user.gamification = { ...user.gamification, ...gamification };
      await user.save();
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update preferences only
router.patch("/me/preferences", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      {},
      { $set: { preferences: req.body } },
      { new: true, upsert: true }
    );
    res.json(user.preferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update gamification stats
router.patch("/me/gamification", async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { xp, level, earnedBadges, focusSessions, breakdowns } = req.body;

    if (xp !== undefined) user.gamification.xp = xp;
    if (level !== undefined) user.gamification.level = level;
    if (focusSessions !== undefined)
      user.gamification.focusSessions = focusSessions;
    if (breakdowns !== undefined) user.gamification.breakdowns = breakdowns;
    if (earnedBadges) {
      // Add new badges without duplicates
      const existingIds = user.gamification.earnedBadges.map((b) => b.id);
      const newBadges = earnedBadges.filter((b) => !existingIds.includes(b.id));
      user.gamification.earnedBadges.push(...newBadges);
    }

    await user.save();
    res.json(user.gamification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
