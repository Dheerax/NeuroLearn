import mongoose from "mongoose";

const hourlyStatsSchema = new mongoose.Schema({
  hour: { type: Number, min: 0, max: 23 }, // 0-23
  totalMinutes: { type: Number, default: 0 },
  sessionCount: { type: Number, default: 0 },
  avgFocusScore: { type: Number, default: 0 },
  completionRate: { type: Number, default: 0 }, // 0-100%
});

const dailyStatsSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  totalMinutes: { type: Number, default: 0 },
  sessionCount: { type: Number, default: 0 },
  avgFocusScore: { type: Number, default: 0 },
});

const weeklyStatsSchema = new mongoose.Schema({
  weekStart: { type: Date, required: true },
  totalMinutes: { type: Number, default: 0 },
  sessions: { type: Number, default: 0 },
  completedSessions: { type: Number, default: 0 },
  avgFocusScore: { type: Number, default: 0 },
  avgSessionLength: { type: Number, default: 0 },
  totalDistractions: { type: Number, default: 0 },
  mostProductiveHour: { type: Number },
  mostUsedSounds: [{ type: String }],
});

const milestoneSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "first_session",
      "ten_sessions",
      "fifty_sessions",
      "hundred_sessions",
      "one_hour_total",
      "ten_hours_total",
      "fifty_hours_total",
      "hundred_hours_total",
      "three_day_streak",
      "seven_day_streak",
      "thirty_day_streak",
      "perfect_score",
      "no_distractions",
      "deep_work_master",
      "early_bird",
      "night_owl",
      "consistent_schedule",
    ],
  },
  achievedAt: { type: Date, default: Date.now },
  xpAwarded: { type: Number, default: 0 },
});

const userFocusStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // ===== LIFETIME STATS =====
    totalFocusTime: { type: Number, default: 0 }, // total minutes
    totalSessions: { type: Number, default: 0 },
    completedSessions: { type: Number, default: 0 },
    abandonedSessions: { type: Number, default: 0 },
    averageSessionLength: { type: Number, default: 0 }, // minutes
    averageFocusScore: { type: Number, default: 0 },
    longestSession: { type: Number, default: 0 }, // minutes
    longestFocusStreak: { type: Number, default: 0 }, // minutes without distraction

    // ===== STREAK DATA =====
    currentStreak: { type: Number, default: 0 }, // consecutive days
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },

    // ===== BEHAVIOR PATTERNS =====
    // Best hours for focus (analyzed from historical data)
    hourlyStats: [hourlyStatsSchema],
    bestHours: [{ type: Number }], // top 3 most productive hours

    // Best days of week
    dailyStats: [dailyStatsSchema],
    bestDays: [{ type: String }], // top 3 most productive days

    // Preferences learned from behavior
    preferredSessionLength: { type: Number, default: 25 },
    preferredFocusMode: { type: String, default: "default" },
    preferredSounds: [{ type: String }],
    preferredBreakLength: { type: Number, default: 5 },

    // ===== WEEKLY TRACKING =====
    weeklyStats: [weeklyStatsSchema],

    // ===== DAILY GOALS =====
    dailyGoalMinutes: { type: Number, default: 60 },
    weeklyGoalMinutes: { type: Number, default: 300 },
    todayMinutes: { type: Number, default: 0 },
    todayDate: { type: Date },
    thisWeekMinutes: { type: Number, default: 0 },
    weekStartDate: { type: Date },

    // ===== DISTRACTION ANALYSIS =====
    totalDistractions: { type: Number, default: 0 },
    averageDistractionsPerSession: { type: Number, default: 0 },
    distractionTrend: {
      type: String,
      enum: ["improving", "stable", "declining"],
      default: "stable",
    },
    mostDistractedHours: [{ type: Number }],

    // ===== BREAK PATTERNS =====
    totalBreaksTaken: { type: Number, default: 0 },
    averageBreakLength: { type: Number, default: 0 },
    preferredBreakActivities: [{ type: String }],

    // ===== GAMIFICATION =====
    totalXpFromFocus: { type: Number, default: 0 },
    milestones: [milestoneSchema],

    // ===== AI INSIGHTS DATA =====
    // Data formatted for LLM consumption
    focusProfile: {
      type: { type: String }, // 'early_bird', 'night_owl', 'consistent', 'variable'
      strengths: [{ type: String }],
      areasToImprove: [{ type: String }],
      recommendations: [{ type: String }],
      lastAnalyzed: { type: Date },
    },

    // Session type preferences
    sessionTypeBreakdown: {
      quick: {
        count: { type: Number, default: 0 },
        avgScore: { type: Number, default: 0 },
      },
      standard: {
        count: { type: Number, default: 0 },
        avgScore: { type: Number, default: 0 },
      },
      deep_work: {
        count: { type: Number, default: 0 },
        avgScore: { type: Number, default: 0 },
      },
      ultra: {
        count: { type: Number, default: 0 },
        avgScore: { type: Number, default: 0 },
      },
    },
  },
  { timestamps: true }
);

// Static method to get or create stats for a user
userFocusStatsSchema.statics.getOrCreate = async function (userId) {
  let stats = await this.findOne({ userId });
  if (!stats) {
    stats = await this.create({ userId });
  }
  return stats;
};

// Method to update stats after a session ends
userFocusStatsSchema.methods.updateAfterSession = async function (session) {
  // Update totals
  this.totalSessions += 1;
  this.totalFocusTime += session.actualDuration || 0;
  this.totalDistractions += session.totalDistractions || 0;

  if (session.completed) {
    this.completedSessions += 1;
  } else if (session.status === "abandoned") {
    this.abandonedSessions += 1;
  }

  // Update averages
  this.averageSessionLength = Math.round(
    this.totalFocusTime / this.totalSessions
  );
  this.averageDistractionsPerSession =
    this.totalDistractions / this.totalSessions;

  // Update longest session
  if (session.actualDuration > this.longestSession) {
    this.longestSession = session.actualDuration;
  }

  // Update average focus score
  if (session.focusScore) {
    const prevTotal = this.averageFocusScore * (this.totalSessions - 1);
    this.averageFocusScore = Math.round(
      (prevTotal + session.focusScore) / this.totalSessions
    );
  }

  // Update streak
  await this.updateStreak();

  // Update today's progress
  await this.updateDailyProgress(session.actualDuration || 0);

  // Update hourly stats
  const hour = new Date(session.startTime).getHours();
  await this.updateHourlyStats(hour, session);

  // Update session type breakdown
  const sessionType = session.sessionType || "standard";
  if (this.sessionTypeBreakdown[sessionType]) {
    const typeStats = this.sessionTypeBreakdown[sessionType];
    const newCount = typeStats.count + 1;
    typeStats.avgScore = Math.round(
      (typeStats.avgScore * typeStats.count + (session.focusScore || 0)) /
        newCount
    );
    typeStats.count = newCount;
  }

  // Update preferred sounds
  if (session.ambientSounds && session.ambientSounds.length > 0) {
    session.ambientSounds.forEach((sound) => {
      if (!this.preferredSounds.includes(sound)) {
        this.preferredSounds.push(sound);
      }
    });
    // Keep only top 5
    this.preferredSounds = this.preferredSounds.slice(0, 5);
  }

  // Add XP
  this.totalXpFromFocus += session.xpEarned || 0;

  // Check for milestones
  await this.checkMilestones();

  await this.save();
};

// Update streak
userFocusStatsSchema.methods.updateStreak = async function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActive = this.lastActiveDate ? new Date(this.lastActiveDate) : null;

  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
    const daysDiff = Math.round((today - lastActive) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Same day, no change
    } else if (daysDiff === 1) {
      // Consecutive day
      this.currentStreak += 1;
    } else {
      // Streak broken
      this.currentStreak = 1;
    }
  } else {
    this.currentStreak = 1;
  }

  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }

  this.lastActiveDate = today;
};

// Update daily progress
userFocusStatsSchema.methods.updateDailyProgress = async function (minutes) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (
    !this.todayDate ||
    this.todayDate.toDateString() !== today.toDateString()
  ) {
    this.todayDate = today;
    this.todayMinutes = 0;
  }

  this.todayMinutes += minutes;
};

// Update hourly stats
userFocusStatsSchema.methods.updateHourlyStats = async function (
  hour,
  session
) {
  let hourStat = this.hourlyStats.find((h) => h.hour === hour);

  if (!hourStat) {
    hourStat = { hour, totalMinutes: 0, sessionCount: 0, avgFocusScore: 0 };
    this.hourlyStats.push(hourStat);
    hourStat = this.hourlyStats.find((h) => h.hour === hour);
  }

  hourStat.totalMinutes += session.actualDuration || 0;
  hourStat.sessionCount += 1;

  if (session.focusScore) {
    hourStat.avgFocusScore = Math.round(
      (hourStat.avgFocusScore * (hourStat.sessionCount - 1) +
        session.focusScore) /
        hourStat.sessionCount
    );
  }

  // Update best hours (top 3 by average focus score)
  const sortedHours = [...this.hourlyStats]
    .filter((h) => h.sessionCount >= 3) // Need at least 3 sessions
    .sort((a, b) => b.avgFocusScore - a.avgFocusScore);

  this.bestHours = sortedHours.slice(0, 3).map((h) => h.hour);
};

// Check for milestones
userFocusStatsSchema.methods.checkMilestones = async function () {
  const milestoneChecks = [
    { type: "first_session", condition: this.totalSessions >= 1, xp: 50 },
    { type: "ten_sessions", condition: this.totalSessions >= 10, xp: 100 },
    { type: "fifty_sessions", condition: this.totalSessions >= 50, xp: 250 },
    { type: "hundred_sessions", condition: this.totalSessions >= 100, xp: 500 },
    { type: "one_hour_total", condition: this.totalFocusTime >= 60, xp: 50 },
    { type: "ten_hours_total", condition: this.totalFocusTime >= 600, xp: 200 },
    {
      type: "fifty_hours_total",
      condition: this.totalFocusTime >= 3000,
      xp: 500,
    },
    {
      type: "hundred_hours_total",
      condition: this.totalFocusTime >= 6000,
      xp: 1000,
    },
    { type: "three_day_streak", condition: this.currentStreak >= 3, xp: 75 },
    { type: "seven_day_streak", condition: this.currentStreak >= 7, xp: 150 },
    { type: "thirty_day_streak", condition: this.currentStreak >= 30, xp: 500 },
  ];

  for (const check of milestoneChecks) {
    const alreadyAchieved = this.milestones.some((m) => m.type === check.type);
    if (!alreadyAchieved && check.condition) {
      this.milestones.push({
        type: check.type,
        achievedAt: new Date(),
        xpAwarded: check.xp,
      });
    }
  }
};

// Get insights for LLM/AI
userFocusStatsSchema.methods.getInsightsData = function () {
  return {
    totalFocusHours: Math.round((this.totalFocusTime / 60) * 10) / 10,
    totalSessions: this.totalSessions,
    completionRate:
      Math.round((this.completedSessions / this.totalSessions) * 100) || 0,
    averageFocusScore: this.averageFocusScore,
    averageSessionLength: this.averageSessionLength,
    currentStreak: this.currentStreak,
    bestHours: this.bestHours,
    preferredSessionLength: this.preferredSessionLength,
    distractionRate: Math.round(this.averageDistractionsPerSession * 10) / 10,
    preferredSounds: this.preferredSounds,
    sessionTypePreference: this.getPreferredSessionType(),
    milestoneCount: this.milestones.length,
  };
};

userFocusStatsSchema.methods.getPreferredSessionType = function () {
  const types = this.sessionTypeBreakdown;
  let maxCount = 0;
  let preferred = "standard";

  for (const [type, stats] of Object.entries(types)) {
    if (stats.count > maxCount) {
      maxCount = stats.count;
      preferred = type;
    }
  }

  return preferred;
};

const UserFocusStats = mongoose.model("UserFocusStats", userFocusStatsSchema);

export default UserFocusStats;
