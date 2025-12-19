import mongoose from "mongoose";

const breakSchema = new mongoose.Schema({
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number }, // minutes
  type: {
    type: String,
    enum: ["scheduled", "manual", "distraction"],
    default: "manual",
  },
  activity: {
    type: String,
    enum: ["none", "breathing", "stretch", "game", "walk"],
    default: "none",
  },
});

const distractionEventSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  confidence: { type: Number }, // 0-1 from ML model
  duration: { type: Number }, // seconds distracted
  action: {
    type: String,
    enum: ["dismissed", "took_break", "played_game", "ignored"],
    default: "dismissed",
  },
});

const focusSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Timing
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    plannedDuration: { type: Number, required: true }, // minutes
    actualDuration: { type: Number, default: 0 }, // minutes (calculated)

    // Session configuration
    sessionType: {
      type: String,
      enum: ["quick", "standard", "deep_work", "ultra", "custom"],
      default: "standard",
    },
    focusMode: {
      type: String,
      enum: ["default", "deep_work", "study", "creative", "exam_prep", "zen"],
      default: "default",
    },

    // Status
    status: {
      type: String,
      enum: ["active", "paused", "completed", "abandoned"],
      default: "active",
    },
    completed: { type: Boolean, default: false },

    // Breaks & Distractions
    breaks: [breakSchema],
    distractionEvents: [distractionEventSchema],
    totalBreakTime: { type: Number, default: 0 }, // minutes
    totalDistractions: { type: Number, default: 0 },

    // Environment
    ambientSounds: [{ type: String }], // ['rain', 'fire', etc.]
    soundVolumes: { type: Map, of: Number }, // { rain: 0.5, fire: 0.3 }

    // Goals & Notes
    preSessionGoal: { type: String, maxLength: 500 },
    postSessionNotes: { type: String, maxLength: 1000 },
    accomplishments: [{ type: String }],
    linkedTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },

    // Rating & Tags
    userRating: { type: Number, min: 1, max: 5 },
    tags: [{ type: String }], // ['study', 'work', 'creative', etc.]

    // Calculated Metrics
    focusScore: { type: Number, min: 0, max: 100 }, // calculated
    productivityScore: { type: Number, min: 0, max: 100 },

    // Gamification
    xpEarned: { type: Number, default: 0 },
    bonusXp: { type: Number, default: 0 },
    achievementsUnlocked: [{ type: String }],
  },
  { timestamps: true }
);

// Indexes for efficient queries
focusSessionSchema.index({ userId: 1, startTime: -1 });
focusSessionSchema.index({ userId: 1, status: 1 });
focusSessionSchema.index({ userId: 1, createdAt: -1 });

// Calculate actual duration before saving
focusSessionSchema.pre("save", function (next) {
  if (this.startTime && this.endTime) {
    const durationMs = this.endTime - this.startTime;
    this.actualDuration = Math.round(durationMs / 1000 / 60); // Convert to minutes
  }

  // Calculate total break time
  this.totalBreakTime = this.breaks.reduce((total, b) => {
    return total + (b.duration || 0);
  }, 0);

  // Count distractions
  this.totalDistractions = this.distractionEvents.length;

  // Calculate focus score
  if (this.endTime) {
    this.focusScore = calculateFocusScore(this);
  }

  next();
});

// Calculate focus score based on various factors
function calculateFocusScore(session) {
  let score = 100;

  // Deduct for not completing planned duration
  if (session.actualDuration < session.plannedDuration) {
    const completionRatio = session.actualDuration / session.plannedDuration;
    score -= Math.round((1 - completionRatio) * 30);
  }

  // Deduct for distractions (5 points each, max 25)
  score -= Math.min(session.totalDistractions * 5, 25);

  // Deduct for excessive break time (more than 20% of session)
  const breakRatio = session.totalBreakTime / session.actualDuration;
  if (breakRatio > 0.2) {
    score -= Math.round((breakRatio - 0.2) * 50);
  }

  // Bonus for completing full session
  if (session.completed && session.actualDuration >= session.plannedDuration) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

// Static method to get user's sessions for a date range
focusSessionSchema.statics.getSessionsInRange = async function (
  userId,
  startDate,
  endDate
) {
  return this.find({
    userId,
    startTime: { $gte: startDate, $lte: endDate },
  }).sort({ startTime: -1 });
};

// Static method to get today's sessions
focusSessionSchema.statics.getTodaySessions = async function (userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return this.getSessionsInRange(userId, today, tomorrow);
};

// Static method to get active session
focusSessionSchema.statics.getActiveSession = async function (userId) {
  return this.findOne({
    userId,
    status: { $in: ["active", "paused"] },
  });
};

const FocusSession = mongoose.model("FocusSession", focusSessionSchema);

export default FocusSession;
