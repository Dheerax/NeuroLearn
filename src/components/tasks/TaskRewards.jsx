import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Star, Trophy, Zap, Heart, Sparkles, PartyPopper } from "lucide-react";

const REWARD_MESSAGES = [
  "You did it! 🎉",
  "Amazing work! ⭐",
  "Keep crushing it! 💪",
  "You're on fire! 🔥",
  "Incredible! 🚀",
  "Unstoppable! ⚡",
  "Brilliant! ✨",
  "Champion! 🏆",
];

const STREAK_MILESTONES = [3, 5, 7, 10, 14, 21, 30];

export default function TaskRewards({
  show,
  xpEarned = 25,
  streakCount = 0,
  onComplete,
}) {
  const [message] = useState(
    REWARD_MESSAGES[Math.floor(Math.random() * REWARD_MESSAGES.length)]
  );
  const [showStreak, setShowStreak] = useState(false);
  const isStreakMilestone = STREAK_MILESTONES.includes(streakCount);

  useEffect(() => {
    if (show) {
      // Trigger confetti
      const duration = 2000;
      const end = Date.now() + duration;

      const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444"];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();

      // Play sound effect
      try {
        const audio = new Audio("/sounds/success.mp3");
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (e) {}

      // Show streak after delay
      if (streakCount > 0) {
        setTimeout(() => setShowStreak(true), 800);
      }

      // Auto close after delay
      const timeout = setTimeout(() => {
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [show, streakCount, onComplete]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
      >
        {/* Reward Card */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 10 }}
          transition={{ type: "spring", damping: 12 }}
          className="text-center pointer-events-auto"
        >
          {/* Glow effect */}
          <div
            className="absolute inset-0 blur-3xl opacity-50 rounded-full"
            style={{
              background:
                "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
              transform: "scale(2)",
            }}
          />

          {/* Content */}
          <div className="relative">
            {/* Main celebration icon */}
            <motion.div
              animate={{
                rotate: [0, -10, 10, -10, 10, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <PartyPopper
                className="w-20 h-20 mx-auto"
                style={{ color: "#f59e0b" }}
              />
            </motion.div>

            {/* Message */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              {message}
            </motion.h2>

            {/* XP earned */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ background: "var(--primary-500)" }}
            >
              <Zap className="w-5 h-5 text-white" />
              <span className="text-white font-bold">+{xpEarned} XP</span>
            </motion.div>

            {/* Streak indicator */}
            <AnimatePresence>
              {showStreak && streakCount > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={isStreakMilestone ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ repeat: 3, duration: 0.3 }}
                    >
                      🔥
                    </motion.div>
                    <span
                      className="font-bold"
                      style={{
                        color: isStreakMilestone
                          ? "var(--warning)"
                          : "var(--text-secondary)",
                      }}
                    >
                      {streakCount} task streak!
                    </span>
                  </div>

                  {isStreakMilestone && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2 px-3 py-1 rounded-full"
                      style={{ background: "var(--warning)", color: "white" }}
                    >
                      <Trophy className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Milestone reached!
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
