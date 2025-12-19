import express from "express";
import { auth } from "../middleware/auth.js";
import FocusSession from "../models/FocusSession.js";
import UserFocusStats from "../models/UserFocusStats.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// =====================
// SESSION ENDPOINTS
// =====================

/**
 * POST /api/focus/sessions/start
 * Start a new focus session
 */
router.post("/sessions/start", async (req, res) => {
  try {
    const {
      plannedDuration,
      sessionType,
      focusMode,
      preSessionGoal,
      ambientSounds,
      linkedTaskId,
    } = req.body;

    // Check for existing active session
    const existingSession = await FocusSession.getActiveSession(req.user.id);
    if (existingSession) {
      return res.status(400).json({
        message: "You already have an active session",
        session: existingSession,
      });
    }

    const session = new FocusSession({
      userId: req.user.id,
      startTime: new Date(),
      plannedDuration: plannedDuration || 25,
      sessionType: sessionType || "standard",
      focusMode: focusMode || "default",
      preSessionGoal,
      ambientSounds: ambientSounds || [],
      linkedTaskId,
      status: "active",
    });

    await session.save();

    res.status(201).json({
      message: "Focus session started",
      session,
    });
  } catch (error) {
    console.error("Error starting session:", error);
    res.status(500).json({ message: "Failed to start session" });
  }
});

/**
 * PUT /api/focus/sessions/:id/end
 * End a focus session
 */
router.put("/sessions/:id/end", async (req, res) => {
  try {
    const { completed, postSessionNotes, accomplishments, userRating, tags } =
      req.body;

    const session = await FocusSession.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.status === "completed") {
      return res.status(400).json({ message: "Session already ended" });
    }

    // Update session
    session.endTime = new Date();
    session.status = completed ? "completed" : "abandoned";
    session.completed = completed;
    session.postSessionNotes = postSessionNotes;
    session.accomplishments = accomplishments || [];
    session.userRating = userRating;
    session.tags = tags || [];

    // Calculate XP
    const baseXp = 10;
    const minuteXp = Math.floor(session.actualDuration * 2);
    const completionBonus = completed ? 25 : 0;
    const scoreBonus = session.focusScore >= 80 ? 15 : 0;

    session.xpEarned = baseXp + minuteXp + completionBonus + scoreBonus;

    await session.save();

    // Update user stats
    const stats = await UserFocusStats.getOrCreate(req.user.id);
    await stats.updateAfterSession(session);

    res.json({
      message: "Session ended",
      session,
      xpEarned: session.xpEarned,
      focusScore: session.focusScore,
    });
  } catch (error) {
    console.error("Error ending session:", error);
    res.status(500).json({ message: "Failed to end session" });
  }
});

/**
 * POST /api/focus/sessions/:id/pause
 * Pause the current session
 */
router.post("/sessions/:id/pause", async (req, res) => {
  try {
    const session = await FocusSession.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: "active",
    });

    if (!session) {
      return res.status(404).json({ message: "Active session not found" });
    }

    session.status = "paused";
    session.breaks.push({
      startTime: new Date(),
      type: "manual",
    });

    await session.save();

    res.json({ message: "Session paused", session });
  } catch (error) {
    console.error("Error pausing session:", error);
    res.status(500).json({ message: "Failed to pause session" });
  }
});

/**
 * POST /api/focus/sessions/:id/resume
 * Resume a paused session
 */
router.post("/sessions/:id/resume", async (req, res) => {
  try {
    const session = await FocusSession.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: "paused",
    });

    if (!session) {
      return res.status(404).json({ message: "Paused session not found" });
    }

    // End the current break
    const currentBreak = session.breaks[session.breaks.length - 1];
    if (currentBreak && !currentBreak.endTime) {
      currentBreak.endTime = new Date();
      currentBreak.duration = Math.round(
        (currentBreak.endTime - currentBreak.startTime) / 1000 / 60
      );
    }

    session.status = "active";
    await session.save();

    res.json({ message: "Session resumed", session });
  } catch (error) {
    console.error("Error resuming session:", error);
    res.status(500).json({ message: "Failed to resume session" });
  }
});

/**
 * POST /api/focus/sessions/:id/break
 * Log a scheduled break
 */
router.post("/sessions/:id/break", async (req, res) => {
  try {
    const { type, activity } = req.body;

    const session = await FocusSession.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.breaks.push({
      startTime: new Date(),
      type: type || "scheduled",
      activity: activity || "none",
    });

    session.status = "paused";
    await session.save();

    res.json({ message: "Break started", session });
  } catch (error) {
    console.error("Error starting break:", error);
    res.status(500).json({ message: "Failed to start break" });
  }
});

/**
 * POST /api/focus/distraction
 * Log a distraction event
 */
router.post("/distraction", async (req, res) => {
  try {
    const { confidence, action } = req.body;

    const session = await FocusSession.getActiveSession(req.user.id);

    if (!session) {
      return res.status(404).json({ message: "No active session" });
    }

    session.distractionEvents.push({
      timestamp: new Date(),
      confidence: confidence || 0.5,
      action: action || "dismissed",
    });

    await session.save();

    res.json({
      message: "Distraction logged",
      totalDistractions: session.distractionEvents.length,
    });
  } catch (error) {
    console.error("Error logging distraction:", error);
    res.status(500).json({ message: "Failed to log distraction" });
  }
});

/**
 * GET /api/focus/sessions
 * Get session history
 */
router.get("/sessions", async (req, res) => {
  try {
    const { limit = 20, offset = 0, startDate, endDate } = req.query;

    const query = { userId: req.user.id };

    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const sessions = await FocusSession.find(query)
      .sort({ startTime: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await FocusSession.countDocuments(query);

    res.json({
      sessions,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
});

/**
 * GET /api/focus/sessions/active
 * Get current active session if any
 */
router.get("/sessions/active", async (req, res) => {
  try {
    const session = await FocusSession.getActiveSession(req.user.id);
    res.json({ session });
  } catch (error) {
    console.error("Error fetching active session:", error);
    res.status(500).json({ message: "Failed to fetch active session" });
  }
});

/**
 * GET /api/focus/sessions/today
 * Get today's sessions
 */
router.get("/sessions/today", async (req, res) => {
  try {
    const sessions = await FocusSession.getTodaySessions(req.user.id);

    const totalMinutes = sessions.reduce(
      (sum, s) => sum + (s.actualDuration || 0),
      0
    );
    const completedCount = sessions.filter((s) => s.completed).length;
    const avgScore =
      sessions.length > 0
        ? Math.round(
            sessions.reduce((sum, s) => sum + (s.focusScore || 0), 0) /
              sessions.length
          )
        : 0;

    res.json({
      sessions,
      summary: {
        totalSessions: sessions.length,
        completedSessions: completedCount,
        totalMinutes,
        averageFocusScore: avgScore,
      },
    });
  } catch (error) {
    console.error("Error fetching today sessions:", error);
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
});

// =====================
// STATS ENDPOINTS
// =====================

/**
 * GET /api/focus/stats
 * Get user's focus statistics
 */
router.get("/stats", async (req, res) => {
  try {
    const stats = await UserFocusStats.getOrCreate(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

/**
 * GET /api/focus/stats/daily
 * Get today's stats with goal progress
 */
router.get("/stats/daily", async (req, res) => {
  try {
    const stats = await UserFocusStats.getOrCreate(req.user.id);
    const sessions = await FocusSession.getTodaySessions(req.user.id);

    const todayMinutes = sessions.reduce(
      (sum, s) => sum + (s.actualDuration || 0),
      0
    );
    const goalProgress = Math.round(
      (todayMinutes / stats.dailyGoalMinutes) * 100
    );

    res.json({
      todayMinutes,
      dailyGoal: stats.dailyGoalMinutes,
      goalProgress: Math.min(goalProgress, 100),
      sessionsToday: sessions.length,
      currentStreak: stats.currentStreak,
      averageFocusScore: stats.averageFocusScore,
    });
  } catch (error) {
    console.error("Error fetching daily stats:", error);
    res.status(500).json({ message: "Failed to fetch daily stats" });
  }
});

/**
 * GET /api/focus/stats/weekly
 * Get this week's breakdown
 */
router.get("/stats/weekly", async (req, res) => {
  try {
    const stats = await UserFocusStats.getOrCreate(req.user.id);

    // Get sessions from last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const sessions = await FocusSession.getSessionsInRange(
      req.user.id,
      weekAgo,
      new Date()
    );

    // Group by day
    const dailyBreakdown = {};
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    sessions.forEach((session) => {
      const day = days[new Date(session.startTime).getDay()];
      if (!dailyBreakdown[day]) {
        dailyBreakdown[day] = {
          minutes: 0,
          sessions: 0,
          avgScore: 0,
          scores: [],
        };
      }
      dailyBreakdown[day].minutes += session.actualDuration || 0;
      dailyBreakdown[day].sessions += 1;
      if (session.focusScore) {
        dailyBreakdown[day].scores.push(session.focusScore);
      }
    });

    // Calculate averages
    Object.keys(dailyBreakdown).forEach((day) => {
      const scores = dailyBreakdown[day].scores;
      dailyBreakdown[day].avgScore =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;
      delete dailyBreakdown[day].scores;
    });

    const totalMinutes = sessions.reduce(
      (sum, s) => sum + (s.actualDuration || 0),
      0
    );
    const weeklyGoalProgress = Math.round(
      (totalMinutes / stats.weeklyGoalMinutes) * 100
    );

    res.json({
      totalMinutes,
      totalSessions: sessions.length,
      weeklyGoal: stats.weeklyGoalMinutes,
      goalProgress: Math.min(weeklyGoalProgress, 100),
      dailyBreakdown,
      bestHours: stats.bestHours,
      currentStreak: stats.currentStreak,
    });
  } catch (error) {
    console.error("Error fetching weekly stats:", error);
    res.status(500).json({ message: "Failed to fetch weekly stats" });
  }
});

/**
 * GET /api/focus/insights
 * Get AI-ready insights data
 */
router.get("/insights", async (req, res) => {
  try {
    const stats = await UserFocusStats.getOrCreate(req.user.id);
    const insights = stats.getInsightsData();

    // Generate recommendations
    const recommendations = [];

    if (insights.bestHours.length > 0) {
      const hourStr = insights.bestHours.map((h) => `${h}:00`).join(", ");
      recommendations.push(
        `Your peak focus hours are around ${hourStr}. Schedule important tasks then!`
      );
    }

    if (insights.completionRate < 70) {
      recommendations.push(
        "Try shorter sessions to improve your completion rate."
      );
    }

    if (insights.distractionRate > 2) {
      recommendations.push(
        "Consider using the distraction-blocking features more often."
      );
    }

    if (insights.currentStreak >= 3) {
      recommendations.push(
        `Great job on your ${insights.currentStreak}-day streak! Keep it going!`
      );
    }

    res.json({
      ...insights,
      recommendations,
      focusProfile: stats.focusProfile,
    });
  } catch (error) {
    console.error("Error fetching insights:", error);
    res.status(500).json({ message: "Failed to fetch insights" });
  }
});

/**
 * PUT /api/focus/goals
 * Update daily/weekly goals
 */
router.put("/goals", async (req, res) => {
  try {
    const { dailyGoalMinutes, weeklyGoalMinutes } = req.body;

    const stats = await UserFocusStats.getOrCreate(req.user.id);

    if (dailyGoalMinutes) {
      stats.dailyGoalMinutes = dailyGoalMinutes;
    }
    if (weeklyGoalMinutes) {
      stats.weeklyGoalMinutes = weeklyGoalMinutes;
    }

    await stats.save();

    res.json({ message: "Goals updated", stats });
  } catch (error) {
    console.error("Error updating goals:", error);
    res.status(500).json({ message: "Failed to update goals" });
  }
});

/**
 * GET /api/focus/achievements
 * Get focus-related milestones/achievements
 */
router.get("/achievements", async (req, res) => {
  try {
    const stats = await UserFocusStats.getOrCreate(req.user.id);

    res.json({
      milestones: stats.milestones,
      totalXpFromFocus: stats.totalXpFromFocus,
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({ message: "Failed to fetch achievements" });
  }
});

export default router;
