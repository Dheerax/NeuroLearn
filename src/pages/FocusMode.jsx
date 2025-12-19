import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Maximize2,
  Minimize2,
  TrendingUp,
  X,
  Settings,
  Plus,
  Minus,
} from "lucide-react";
import { useFocus, SESSION_TYPES, FOCUS_MODES } from "../context/FocusContext";
import FocusTimer from "../components/focus/FocusTimer";
import SessionGoalModal from "../components/focus/SessionGoalModal";
import SessionCompleteModal from "../components/focus/SessionCompleteModal";
import AmbientSounds from "../components/focus/AmbientSounds";
import DailyProgress from "../components/focus/DailyProgress";
import FocusInsights from "../components/focus/FocusInsights";

// Color themes - iOS style
const COLOR_THEMES = [
  { id: "blue", color: "#3b82f6", name: "Blue" },
  { id: "purple", color: "#8b5cf6", name: "Purple" },
  { id: "green", color: "#22c55e", name: "Green" },
  { id: "orange", color: "#f59e0b", name: "Orange" },
  { id: "red", color: "#ef4444", name: "Red" },
  { id: "cyan", color: "#06b6d4", name: "Cyan" },
];

export default function FocusMode() {
  const {
    currentSession,
    isRunning,
    isPaused,
    isBreak,
    timeLeft,
    sessionType,
    setSessionType,
    focusMode,
    setFocusMode,
    todayStats,
    showGoalModal,
    setShowGoalModal,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    resetTimer,
    skipBreak,
    customDuration,
    setCustomDuration,
    customBreakDuration,
    setCustomBreakDuration,
  } = useFocus();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(COLOR_THEMES[0]);

  // Pomodoro settings
  const [pomodoroSessions, setPomodoroSessions] = useState(3);
  const [currentPomodoroSession, setCurrentPomodoroSession] = useState(1);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePlayPause = () => {
    if (!currentSession) {
      setShowGoalModal(true);
    } else if (isPaused) {
      resumeSession();
    } else {
      pauseSession();
    }
  };

  const handleStartQuick = () => {
    startSession("");
  };

  const handleThemeChange = (theme) => {
    setSelectedTheme(theme);
    // Map theme to focus mode for backend compatibility
    const modeMap = {
      blue: "default",
      purple: "deep_work",
      green: "study",
      orange: "creative",
      red: "exam_prep",
      cyan: "zen",
    };
    setFocusMode(modeMap[theme.id] || "default");
  };

  const handleSessionTypeChange = (type) => {
    if (!currentSession) {
      if (type === "custom") {
        setShowCustomModal(true);
      } else {
        setSessionType(type);
      }
    }
  };

  // Filter out "custom" from the quick preset buttons
  const presetTypes = Object.entries(SESSION_TYPES).filter(
    ([key]) => key !== "custom"
  );

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col">
      {/* Header with iOS-style color dots */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <h1
            className="text-2xl font-display font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Focus Mode
          </h1>
        </div>

        {/* iOS-style color dots + controls */}
        <div className="flex items-center gap-4">
          {/* Color dots */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-full"
            style={{ background: "var(--bg-tertiary)" }}
          >
            {COLOR_THEMES.map((theme) => (
              <motion.button
                key={theme.id}
                onClick={() => !currentSession && handleThemeChange(theme)}
                disabled={!!currentSession}
                className={`w-4 h-4 rounded-full cursor-pointer transition-all ${
                  currentSession ? "opacity-50 cursor-not-allowed" : ""
                }`}
                style={{
                  background: theme.color,
                  boxShadow:
                    selectedTheme.id === theme.id
                      ? `0 0 0 2px var(--bg-tertiary), 0 0 0 4px ${theme.color}`
                      : "none",
                }}
                whileHover={!currentSession ? { scale: 1.2 } : {}}
                whileTap={!currentSession ? { scale: 0.9 } : {}}
                title={theme.name}
              />
            ))}
          </div>

          {/* Settings button for custom */}
          <motion.button
            onClick={() => !currentSession && setShowCustomModal(true)}
            disabled={!!currentSession}
            className={`p-2 rounded-lg cursor-pointer transition-all ${
              currentSession
                ? "opacity-50 cursor-not-allowed"
                : "hover:opacity-80"
            }`}
            style={{ background: "var(--bg-tertiary)" }}
            whileHover={!currentSession ? { scale: 1.05 } : {}}
            whileTap={!currentSession ? { scale: 0.95 } : {}}
            title="Custom Timer"
          >
            <Settings
              className="w-5 h-5"
              style={{ color: "var(--text-secondary)" }}
            />
          </motion.button>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg cursor-pointer transition-colors hover:opacity-80"
            style={{ background: "var(--bg-tertiary)" }}
          >
            {isFullscreen ? (
              <Minimize2
                className="w-5 h-5"
                style={{ color: "var(--text-secondary)" }}
              />
            ) : (
              <Maximize2
                className="w-5 h-5"
                style={{ color: "var(--text-secondary)" }}
              />
            )}
          </button>
        </div>
      </motion.div>

      {/* Daily Progress Bar */}
      <DailyProgress />

      {/* Main content grid */}
      <div className="flex-1 grid lg:grid-cols-3 gap-6 mt-6">
        {/* Left column - Timer */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center">
          {/* Session type quick selector */}
          <motion.div
            className="flex flex-wrap gap-2 mb-8 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {presetTypes.map(([key, config]) => (
              <button
                key={key}
                onClick={() => handleSessionTypeChange(key)}
                disabled={!!currentSession}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
                  currentSession
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105"
                }`}
                style={{
                  background:
                    sessionType === key
                      ? selectedTheme.color
                      : "var(--bg-tertiary)",
                  color:
                    sessionType === key ? "white" : "var(--text-secondary)",
                }}
              >
                <span>{config.icon}</span>
                <span>{config.name}</span>
                <span className="opacity-70">{config.duration}m</span>
              </button>
            ))}
          </motion.div>

          {/* The Timer - pass theme color */}
          <FocusTimer themeColor={selectedTheme.color} />

          {/* Pomodoro session indicator */}
          {sessionType === "custom" && pomodoroSessions > 1 && (
            <motion.div
              className="flex items-center gap-2 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[...Array(pomodoroSessions)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full transition-all"
                  style={{
                    background:
                      i < currentPomodoroSession
                        ? selectedTheme.color
                        : "var(--border-medium)",
                    opacity: i === currentPomodoroSession - 1 ? 1 : 0.5,
                  }}
                />
              ))}
              <span
                className="text-xs ml-2"
                style={{ color: "var(--text-tertiary)" }}
              >
                Session {currentPomodoroSession} of {pomodoroSessions}
              </span>
            </motion.div>
          )}

          {/* Controls */}
          <motion.div
            className="flex items-center gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Reset */}
            <motion.button
              onClick={resetTimer}
              className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: "var(--bg-tertiary)" }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <RotateCcw
                className="w-5 h-5"
                style={{ color: "var(--text-secondary)" }}
              />
            </motion.button>

            {/* Play/Pause */}
            <motion.button
              onClick={handlePlayPause}
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
              style={{
                background: isBreak
                  ? "linear-gradient(135deg, #22c55e, #16a34a)"
                  : `linear-gradient(135deg, ${selectedTheme.color}, ${selectedTheme.color}cc)`,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isRunning && !isPaused ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </motion.button>

            {/* Skip / End */}
            {isBreak ? (
              <motion.button
                onClick={skipBreak}
                className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer"
                style={{ background: "var(--bg-tertiary)" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <SkipForward
                  className="w-5 h-5"
                  style={{ color: "var(--text-secondary)" }}
                />
              </motion.button>
            ) : currentSession ? (
              <motion.button
                onClick={() => endSession(false)}
                className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer"
                style={{ background: "var(--bg-tertiary)" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" style={{ color: "var(--error)" }} />
              </motion.button>
            ) : (
              <div className="w-12 h-12" />
            )}
          </motion.div>

          {/* Quick start */}
          {!currentSession && (
            <motion.button
              onClick={handleStartQuick}
              className="mt-4 text-sm cursor-pointer hover:underline"
              style={{ color: "var(--text-tertiary)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              or start without a goal
            </motion.button>
          )}
        </div>

        {/* Right column - Stats & Sounds */}
        <div className="space-y-6">
          {/* Today's Stats */}
          <motion.div
            className="card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3
              className="font-semibold mb-4 flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <TrendingUp
                className="w-5 h-5"
                style={{ color: selectedTheme.color }}
              />
              Today's Progress
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div
                className="text-center p-3 rounded-xl"
                style={{ background: "var(--bg-tertiary)" }}
              >
                <p
                  className="text-2xl font-bold"
                  style={{ color: selectedTheme.color }}
                >
                  {todayStats?.todayMinutes || 0}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  minutes
                </p>
              </div>
              <div
                className="text-center p-3 rounded-xl"
                style={{ background: "var(--bg-tertiary)" }}
              >
                <p
                  className="text-2xl font-bold"
                  style={{ color: "var(--success)" }}
                >
                  {todayStats?.sessionsToday || 0}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  sessions
                </p>
              </div>
              <div
                className="text-center p-3 rounded-xl"
                style={{ background: "var(--bg-tertiary)" }}
              >
                <p
                  className="text-2xl font-bold"
                  style={{ color: "var(--warning)" }}
                >
                  {todayStats?.currentStreak || 0}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  day streak
                </p>
              </div>
              <div
                className="text-center p-3 rounded-xl"
                style={{ background: "var(--bg-tertiary)" }}
              >
                <p
                  className="text-2xl font-bold"
                  style={{ color: "var(--info)" }}
                >
                  {todayStats?.averageFocusScore || 0}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  avg score
                </p>
              </div>
            </div>
          </motion.div>

          {/* Ambient Sounds */}
          <AmbientSounds />

          {/* Insights */}
          <FocusInsights />
        </div>
      </div>

      {/* Modals */}
      <SessionGoalModal />
      <SessionCompleteModal />

      {/* Custom Pomodoro Timer Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 1000 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCustomModal(false)}
            />

            {/* Modal */}
            <motion.div
              className="relative w-full max-w-sm rounded-2xl p-6"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-light)",
              }}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <button
                onClick={() => setShowCustomModal(false)}
                className="absolute top-4 right-4 p-2 rounded-lg cursor-pointer transition-colors"
                style={{ background: "var(--bg-tertiary)" }}
              >
                <X
                  className="w-4 h-4"
                  style={{ color: "var(--text-tertiary)" }}
                />
              </button>

              <h2
                className="text-xl font-bold mb-6"
                style={{ color: "var(--text-primary)" }}
              >
                ⚙️ Custom Pomodoro
              </h2>

              {/* Number of sessions */}
              <div className="mb-5">
                <label
                  className="text-sm mb-2 block"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Number of Sessions
                </label>
                <div className="flex items-center justify-center gap-4">
                  <motion.button
                    onClick={() =>
                      setPomodoroSessions(Math.max(1, pomodoroSessions - 1))
                    }
                    className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
                    style={{ background: "var(--bg-tertiary)" }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Minus
                      className="w-4 h-4"
                      style={{ color: "var(--text-secondary)" }}
                    />
                  </motion.button>
                  <span
                    className="text-3xl font-bold w-12 text-center"
                    style={{ color: selectedTheme.color }}
                  >
                    {pomodoroSessions}
                  </span>
                  <motion.button
                    onClick={() =>
                      setPomodoroSessions(Math.min(10, pomodoroSessions + 1))
                    }
                    className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
                    style={{ background: "var(--bg-tertiary)" }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Plus
                      className="w-4 h-4"
                      style={{ color: "var(--text-secondary)" }}
                    />
                  </motion.button>
                </div>
                <p
                  className="text-center text-xs mt-1"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  sessions
                </p>
              </div>

              {/* Focus duration */}
              <div className="mb-4">
                <label
                  className="text-sm mb-2 block"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Focus Time (per session)
                </label>
                <div className="flex gap-2">
                  {[15, 25, 30, 45, 60].map((min) => (
                    <button
                      key={min}
                      onClick={() => setCustomDuration(min)}
                      className="flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all hover:opacity-80"
                      style={{
                        background:
                          customDuration === min
                            ? selectedTheme.color
                            : "var(--bg-tertiary)",
                        color:
                          customDuration === min
                            ? "white"
                            : "var(--text-tertiary)",
                      }}
                    >
                      {min}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Break duration */}
              <div className="mb-6">
                <label
                  className="text-sm mb-2 block"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Break Time (between sessions)
                </label>
                <div className="flex gap-2">
                  {[3, 5, 10, 15, 20].map((min) => (
                    <button
                      key={min}
                      onClick={() => setCustomBreakDuration(min)}
                      className="flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all hover:opacity-80"
                      style={{
                        background:
                          customBreakDuration === min
                            ? selectedTheme.color
                            : "var(--bg-tertiary)",
                        color:
                          customBreakDuration === min
                            ? "white"
                            : "var(--text-tertiary)",
                      }}
                    >
                      {min}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary preview */}
              <div
                className="rounded-xl p-4 mb-6 text-center"
                style={{ background: `${selectedTheme.color}15` }}
              >
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Total session time
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: selectedTheme.color }}
                >
                  {pomodoroSessions * customDuration +
                    (pomodoroSessions - 1) * customBreakDuration}{" "}
                  min
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {pomodoroSessions}x {customDuration}min focus +{" "}
                  {pomodoroSessions - 1}x {customBreakDuration}min break
                </p>
              </div>

              {/* Apply button */}
              <motion.button
                onClick={() => {
                  setSessionType("custom");
                  setCurrentPomodoroSession(1);
                  setShowCustomModal(false);
                }}
                className="w-full py-3 rounded-xl font-medium text-white cursor-pointer transition-all"
                style={{ background: selectedTheme.color }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start {pomodoroSessions}x Pomodoro
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
