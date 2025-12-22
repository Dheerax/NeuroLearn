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

// Export all user settings as JSON
router.get("/me/settings/export", async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      version: "1.0",
      settings: {
        name: user.name,
        avatar: user.avatar,
        preferences: user.preferences,
        profile: user.profile,
      },
    };

    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import settings from JSON
router.post("/me/settings/import", async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings) {
      return res.status(400).json({ error: "No settings data provided" });
    }

    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Apply imported settings
    if (settings.name) user.name = settings.name;
    if (settings.avatar) user.avatar = settings.avatar;
    if (settings.preferences) {
      user.preferences = {
        ...(user.preferences.toObject?.() || user.preferences),
        ...settings.preferences,
      };
    }
    if (settings.profile) {
      user.profile = {
        ...(user.profile.toObject?.() || user.profile),
        ...settings.profile,
      };
    }

    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset settings to defaults
router.post("/me/settings/reset", async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Reset to defaults
    user.preferences = {
      learningStyle: "visual",
      breakInterval: 25,
      breakDuration: 5,
      theme: "light",
      notifications: true,
      soundEnabled: true,
      focusIntensity: "medium",
      accessibility: {
        fontSize: "medium",
        dyslexiaFont: false,
        highContrast: false,
        reducedMotion: false,
        screenReader: false,
        colorBlindMode: "none",
      },
      privacy: {
        analyticsEnabled: true,
        shareProgress: false,
        showStreak: true,
      },
      keyboardShortcuts: {
        enabled: true,
        customBindings: new Map(),
      },
      advancedNotifications: {
        dailyReminder: true,
        dailyReminderTime: "09:00",
        weeklyReport: true,
        achievementAlerts: true,
        focusEndSound: "chime",
      },
      session: {
        autoStartTimer: false,
        showTimeRemaining: true,
        pauseOnInactivity: true,
      },
    };

    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all custom scenarios
router.get("/me/scenarios", async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user.customScenarios || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new custom scenario
router.post("/me/scenarios", async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { title, desc, icon, gradient } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const newScenario = {
      id: `custom-${Date.now()}`,
      title,
      desc: desc || "",
      icon: icon || "MessageCircle",
      gradient: gradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      createdAt: new Date(),
    };

    user.customScenarios.push(newScenario);
    await user.save();

    res.status(201).json(newScenario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a custom scenario
router.delete("/me/scenarios/:id", async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const scenarioId = req.params.id;
    const index = user.customScenarios.findIndex((s) => s.id === scenarioId);

    if (index === -1) {
      return res.status(404).json({ error: "Scenario not found" });
    }

    user.customScenarios.splice(index, 1);
    await user.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
