import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: "Student",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatar: {
      type: String,
      default: "🧠",
    },
    onboardingComplete: {
      type: Boolean,
      default: false,
    },
    preferences: {
      learningStyle: {
        type: String,
        enum: ["visual", "audio", "text", "mixed"],
        default: "visual",
      },
      breakInterval: {
        type: Number,
        default: 25,
      },
      breakDuration: {
        type: Number,
        default: 5,
      },
      theme: {
        type: String,
        default: "light",
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      soundEnabled: {
        type: Boolean,
        default: true,
      },
      focusIntensity: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
      },
      // Accessibility Settings
      accessibility: {
        fontSize: {
          type: String,
          enum: ["small", "medium", "large", "extra-large"],
          default: "medium",
        },
        dyslexiaFont: {
          type: Boolean,
          default: false,
        },
        highContrast: {
          type: Boolean,
          default: false,
        },
        reducedMotion: {
          type: Boolean,
          default: false,
        },
        screenReader: {
          type: Boolean,
          default: false,
        },
        colorBlindMode: {
          type: String,
          enum: ["none", "protanopia", "deuteranopia", "tritanopia"],
          default: "none",
        },
      },
      // Privacy Settings
      privacy: {
        analyticsEnabled: {
          type: Boolean,
          default: true,
        },
        shareProgress: {
          type: Boolean,
          default: false,
        },
        showStreak: {
          type: Boolean,
          default: true,
        },
      },
      // Keyboard Shortcuts
      keyboardShortcuts: {
        enabled: {
          type: Boolean,
          default: true,
        },
        customBindings: {
          type: Map,
          of: String,
          default: {},
        },
      },
      // Advanced Notifications
      advancedNotifications: {
        dailyReminder: {
          type: Boolean,
          default: true,
        },
        dailyReminderTime: {
          type: String,
          default: "09:00",
        },
        weeklyReport: {
          type: Boolean,
          default: true,
        },
        achievementAlerts: {
          type: Boolean,
          default: true,
        },
        focusEndSound: {
          type: String,
          enum: ["none", "chime", "bell", "nature"],
          default: "chime",
        },
      },
      // Session Settings
      session: {
        autoStartTimer: {
          type: Boolean,
          default: false,
        },
        showTimeRemaining: {
          type: Boolean,
          default: true,
        },
        pauseOnInactivity: {
          type: Boolean,
          default: true,
        },
      },
    },
    profile: {
      conditions: [
        {
          type: String,
          enum: ["adhd", "autism", "dyslexia", "anxiety", "other"],
        },
      ],
      strengths: [String],
      challenges: [String],
    },
    stats: {
      totalFocusTime: { type: Number, default: 0 },
      tasksCompleted: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastActiveDate: Date,
    },
    gamification: {
      xp: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      earnedBadges: [
        {
          id: String,
          name: String,
          icon: String,
          earnedAt: Date,
        },
      ],
      focusSessions: { type: Number, default: 0 },
      breakdowns: { type: Number, default: 0 },
    },
    // Custom Social Scenarios
    customScenarios: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        desc: { type: String, default: "" },
        icon: { type: String, default: "MessageCircle" },
        gradient: {
          type: String,
          default: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model("User", userSchema);

export default User;
