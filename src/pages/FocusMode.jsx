import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Coffee,
  Sparkles,
  Clock,
  Target,
  Wind,
  Waves,
  CloudRain,
  Bird,
  Flame,
} from "lucide-react";
import { useGamification } from "../context/GamificationContext";
import { useAuth } from "../context/AuthContext";

const SOUNDS = [
  { id: "rain", name: "Rain", icon: CloudRain, color: "#3b82f6" },
  { id: "waves", name: "Ocean Waves", icon: Waves, color: "#06b6d4" },
  { id: "forest", name: "Forest", icon: Bird, color: "#22c55e" },
  { id: "fire", name: "Fireplace", icon: Flame, color: "#f97316" },
  { id: "wind", name: "Wind", icon: Wind, color: "#94a3b8" },
];

const PRESETS = [
  { name: "Quick Focus", work: 15, break: 3 },
  { name: "Standard", work: 25, break: 5 },
  { name: "Deep Work", work: 50, break: 10 },
];

export default function FocusMode() {
  const { user } = useAuth();
  const { addXP } = useGamification();

  const workDuration = user?.preferences?.breakInterval || 25;
  const breakDuration = user?.preferences?.breakDuration || 5;

  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSounds, setActiveSounds] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  const containerRef = useRef(null);

  const totalTime = isBreak ? breakDuration * 60 : workDuration * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  useEffect(() => {
    let interval;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleSessionComplete = () => {
    setIsRunning(false);

    if (!isBreak) {
      setSessionsCompleted((prev) => prev + 1);
      addXP(50, "focus_session");
      setIsBreak(true);
      setTimeLeft(breakDuration * 60);
    } else {
      setIsBreak(false);
      setTimeLeft(workDuration * 60);
    }
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workDuration * 60);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleSound = (soundId) => {
    setActiveSounds((prev) =>
      prev.includes(soundId)
        ? prev.filter((s) => s !== soundId)
        : [...prev, soundId]
    );
  };

  const selectPreset = (index) => {
    setSelectedPreset(index);
    const preset = PRESETS[index];
    setTimeLeft(preset.work * 60);
    setIsBreak(false);
    setIsRunning(false);
  };

  // Breathing animation for break time
  const breatheVariants = {
    inhale: { scale: 1.2, transition: { duration: 4, ease: "easeInOut" } },
    exhale: { scale: 1, transition: { duration: 4, ease: "easeInOut" } },
  };

  return (
    <div
      ref={containerRef}
      className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center relative"
    >
      {/* Background gradient based on mode */}
      <div
        className="absolute inset-0 -z-10 opacity-20 transition-colors duration-1000"
        style={{
          background: isBreak
            ? "radial-gradient(circle at center, #22c55e 0%, transparent 70%)"
            : "radial-gradient(circle at center, var(--primary-500) 0%, transparent 70%)",
        }}
      />

      {/* Session indicator */}
      <motion.div
        className="flex items-center gap-2 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors ${
              i < sessionsCompleted ? "" : ""
            }`}
            style={{
              background:
                i < sessionsCompleted
                  ? "var(--primary-500)"
                  : "var(--border-light)",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
          />
        ))}
        <span
          className="ml-2 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          {sessionsCompleted}/4 sessions
        </span>
      </motion.div>

      {/* Timer Circle */}
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* Outer ring */}
        <svg className="w-72 h-72 md:w-96 md:h-96 -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="var(--border-light)"
            strokeWidth="8"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke={isBreak ? "#22c55e" : "var(--primary-500)"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="283%"
            strokeDashoffset={`${283 - (progress / 100) * 283}%`}
            initial={{ strokeDashoffset: "283%" }}
            animate={{ strokeDashoffset: `${283 - (progress / 100) * 283}%` }}
            transition={{ duration: 0.5 }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isBreak && isRunning ? (
            <motion.div
              className="w-20 h-20 rounded-full"
              style={{ background: "rgba(34, 197, 94, 0.2)" }}
              variants={breatheVariants}
              animate={["inhale", "exhale"]}
              transition={{ repeat: Infinity, duration: 8 }}
            />
          ) : null}

          <motion.div key={timeLeft} className="text-center">
            <motion.p
              className="text-6xl md:text-7xl font-display font-bold tabular-nums"
              style={{ color: "var(--text-primary)" }}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
            >
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </motion.p>
            <p
              className="text-lg mt-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {isBreak ? (
                <span className="flex items-center justify-center gap-2">
                  <Coffee className="w-5 h-5" /> Break Time
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Target className="w-5 h-5" /> Focus Time
                </span>
              )}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        className="flex items-center gap-4 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          onClick={resetTimer}
          className="btn-icon w-12 h-12"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <RotateCcw
            className="w-5 h-5"
            style={{ color: "var(--text-secondary)" }}
          />
        </motion.button>

        <motion.button
          onClick={toggleTimer}
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "var(--gradient-primary)" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isRunning ? (
            <Pause className="w-8 h-8 text-white" />
          ) : (
            <Play className="w-8 h-8 text-white ml-1" />
          )}
        </motion.button>

        <motion.button
          onClick={toggleFullscreen}
          className="btn-icon w-12 h-12"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
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
        </motion.button>
      </motion.div>

      {/* Presets */}
      <motion.div
        className="flex gap-2 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {PRESETS.map((preset, index) => (
          <button
            key={preset.name}
            onClick={() => selectPreset(index)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedPreset === index ? "" : ""
            }`}
            style={{
              background:
                selectedPreset === index
                  ? "var(--primary-500)"
                  : "var(--bg-tertiary)",
              color:
                selectedPreset === index ? "white" : "var(--text-secondary)",
            }}
          >
            {preset.name}
          </button>
        ))}
      </motion.div>

      {/* Sound Mixer */}
      <motion.div
        className="mt-12 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className="font-semibold flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <Volume2 className="w-5 h-5" />
            Ambient Sounds
          </h3>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg transition-colors"
            style={{ background: "var(--bg-tertiary)" }}
          >
            {soundEnabled ? (
              <Volume2
                className="w-4 h-4"
                style={{ color: "var(--text-secondary)" }}
              />
            ) : (
              <VolumeX
                className="w-4 h-4"
                style={{ color: "var(--text-tertiary)" }}
              />
            )}
          </button>
        </div>

        <div className="flex gap-3 justify-center">
          {SOUNDS.map((sound) => (
            <motion.button
              key={sound.id}
              onClick={() => toggleSound(sound.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                activeSounds.includes(sound.id) ? "ring-2" : ""
              }`}
              style={{
                background: activeSounds.includes(sound.id)
                  ? `${sound.color}20`
                  : "var(--bg-tertiary)",
                ringColor: sound.color,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <sound.icon
                className="w-6 h-6"
                style={{
                  color: activeSounds.includes(sound.id)
                    ? sound.color
                    : "var(--text-tertiary)",
                }}
              />
              <span
                className="text-xs"
                style={{
                  color: activeSounds.includes(sound.id)
                    ? sound.color
                    : "var(--text-tertiary)",
                }}
              >
                {sound.name}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="flex gap-6 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-center">
          <p className="text-2xl font-bold text-gradient">
            {sessionsCompleted * workDuration}
          </p>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            minutes focused today
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gradient">
            {sessionsCompleted * 50}
          </p>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            XP earned
          </p>
        </div>
      </motion.div>
    </div>
  );
}
