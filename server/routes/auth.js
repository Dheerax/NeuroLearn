import express from "express";
import User from "../models/User.js";
import { auth, generateToken } from "../middleware/auth.js";

const router = express.Router();

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists with this email" });
    }

    // Create user
    const user = await User.create({
      name: name || "Student",
      email: email.toLowerCase(),
      password,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user (protected)
router.get("/me", auth, async (req, res) => {
  try {
    res.json(req.user.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile (protected)
router.put("/me", auth, async (req, res) => {
  try {
    const { name, avatar, preferences, profile, onboardingComplete } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (onboardingComplete !== undefined)
      user.onboardingComplete = onboardingComplete;
    if (preferences) {
      user.preferences = { ...user.preferences.toObject(), ...preferences };
    }
    if (profile) {
      user.profile = { ...user.profile.toObject(), ...profile };
    }

    await user.save();
    res.json(user.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update gamification (protected)
router.patch("/me/gamification", auth, async (req, res) => {
  try {
    const user = req.user;
    const {
      xp,
      level,
      earnedBadges,
      focusSessions,
      breakdowns,
      currentStreak,
    } = req.body;

    if (xp !== undefined) user.gamification.xp = xp;
    if (level !== undefined) user.gamification.level = level;
    if (focusSessions !== undefined)
      user.gamification.focusSessions = focusSessions;
    if (breakdowns !== undefined) user.gamification.breakdowns = breakdowns;
    if (currentStreak !== undefined) user.stats.currentStreak = currentStreak;

    if (earnedBadges && Array.isArray(earnedBadges)) {
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
