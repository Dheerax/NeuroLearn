import { motion } from "framer-motion";
import { Target, Coffee, Sparkles } from "lucide-react";
import { useFocus, SESSION_TYPES } from "../../context/FocusContext";

export default function FocusTimer({ themeColor = "#3b82f6" }) {
  const {
    isRunning,
    isPaused,
    isBreak,
    timeLeft,
    progress,
    sessionType,
    currentSession,
    customDuration,
  } = useFocus();

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const config = SESSION_TYPES[sessionType];

  // Use custom duration for display if session type is custom
  const displayDuration =
    sessionType === "custom" ? customDuration : config?.duration || 25;

  // Calculate stroke offset for progress ring
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (progress / 100) * circumference;

  const activeColor = isBreak ? "#22c55e" : themeColor;

  return (
    <motion.div
      className="relative"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 blur-3xl opacity-30 rounded-full"
        style={{
          background: `radial-gradient(circle, ${activeColor} 0%, transparent 70%)`,
          transform: "scale(1.5)",
        }}
      />

      {/* Timer ring */}
      <svg className="w-80 h-80 -rotate-90" viewBox="0 0 320 320">
        {/* Background ring */}
        <circle
          cx="160"
          cy="160"
          r={radius}
          fill="none"
          stroke="var(--border-light)"
          strokeWidth="12"
        />

        {/* Progress ring */}
        <motion.circle
          cx="160"
          cy="160"
          r={radius}
          fill="none"
          stroke={activeColor}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeOffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: strokeOffset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />

        {/* Pulse effect when running */}
        {isRunning && !isPaused && (
          <motion.circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke={activeColor}
            strokeWidth="2"
            opacity="0.5"
            animate={{
              r: [radius, radius + 20, radius],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Icon */}
        <motion.div
          className="mb-2"
          animate={isRunning && !isPaused ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {isBreak ? (
            <Coffee className="w-8 h-8" style={{ color: "#22c55e" }} />
          ) : (
            <Target className="w-8 h-8" style={{ color: themeColor }} />
          )}
        </motion.div>

        {/* Time display */}
        <motion.div
          key={`${minutes}:${seconds}`}
          initial={{ scale: 1.02 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <p
            className="text-6xl font-display font-bold tabular-nums"
            style={{ color: "var(--text-primary)" }}
          >
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </p>
        </motion.div>

        {/* Status text */}
        <p
          className="mt-2 text-sm font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          {isBreak ? (
            <span className="flex items-center gap-2">
              <Coffee className="w-4 h-4" /> Take a break
            </span>
          ) : isPaused ? (
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Paused
            </span>
          ) : isRunning ? (
            <span className="flex items-center gap-2">
              <Target className="w-4 h-4" /> Stay focused
            </span>
          ) : (
            <span>
              {sessionType === "custom" ? "Custom" : config?.name} •{" "}
              {displayDuration} min
            </span>
          )}
        </p>

        {/* Session goal */}
        {currentSession?.preSessionGoal && (
          <motion.p
            className="mt-3 px-4 py-1 rounded-full text-xs max-w-[200px] truncate"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-tertiary)",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            🎯 {currentSession.preSessionGoal}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
