import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Star,
  X,
  Clock,
  Flame,
  Target,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFocus } from "../../context/FocusContext";

export default function SessionCompleteModal() {
  const navigate = useNavigate();
  const {
    showCompletionModal,
    setShowCompletionModal,
    completedSession,
    startBreak,
  } = useFocus();

  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");

  if (!completedSession) return null;

  const { session, xpEarned, focusScore } = completedSession;

  const handleClose = () => {
    setShowCompletionModal(false);
    setRating(0);
    setNotes("");
  };

  const handleTakeBreak = () => {
    handleClose();
    startBreak();
  };

  const handlePlayGame = () => {
    handleClose();
    navigate("/games");
  };

  return (
    <AnimatePresence>
      {showCompletionModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Confetti effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: [
                    "#f59e0b",
                    "#22c55e",
                    "#3b82f6",
                    "#ec4899",
                    "#8b5cf6",
                  ][i % 5],
                  left: `${Math.random() * 100}%`,
                }}
                initial={{ y: -20, opacity: 1, scale: 0 }}
                animate={{
                  y: "100vh",
                  opacity: [1, 1, 0],
                  scale: 1,
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 2 + Math.random(),
                  delay: Math.random() * 0.5,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md rounded-2xl p-6 overflow-hidden"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-light)",
            }}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
          >
            {/* Gradient top */}
            <div
              className="absolute top-0 left-0 right-0 h-32 opacity-20"
              style={{
                background:
                  "linear-gradient(to bottom, var(--success), transparent)",
              }}
            />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-lg transition-colors z-10"
              style={{ background: "var(--bg-tertiary)" }}
            >
              <X
                className="w-4 h-4"
                style={{ color: "var(--text-tertiary)" }}
              />
            </button>

            {/* Header */}
            <div className="text-center mb-6 relative">
              <motion.div
                className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #eab308)",
                }}
                animate={{
                  rotate: [0, -10, 10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 0.5 }}
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              <motion.h2
                className="text-2xl font-bold"
                style={{ color: "var(--text-primary)" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Session Complete! 🎉
              </motion.h2>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <motion.div
                className="text-center p-3 rounded-xl"
                style={{ background: "var(--bg-tertiary)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Clock
                  className="w-5 h-5 mx-auto mb-1"
                  style={{ color: "var(--primary-500)" }}
                />
                <p
                  className="text-lg font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {session?.actualDuration || 0}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  minutes
                </p>
              </motion.div>

              <motion.div
                className="text-center p-3 rounded-xl"
                style={{ background: "var(--bg-tertiary)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Target
                  className="w-5 h-5 mx-auto mb-1"
                  style={{ color: "var(--success)" }}
                />
                <p
                  className="text-lg font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {focusScore || 0}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  focus score
                </p>
              </motion.div>

              <motion.div
                className="text-center p-3 rounded-xl"
                style={{ background: "var(--bg-tertiary)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Flame
                  className="w-5 h-5 mx-auto mb-1"
                  style={{ color: "var(--warning)" }}
                />
                <p
                  className="text-lg font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  +{xpEarned || 0}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  XP earned
                </p>
              </motion.div>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <p
                className="text-sm mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                How was your session?
              </p>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    onClick={() => setRating(star)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Star
                      className="w-8 h-8"
                      fill={star <= rating ? "#f59e0b" : "none"}
                      stroke={
                        star <= rating ? "#f59e0b" : "var(--text-tertiary)"
                      }
                    />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What did you accomplish? (optional)"
                className="w-full px-4 py-3 rounded-xl text-sm resize-none"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-light)",
                }}
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <motion.button
                onClick={handleTakeBreak}
                className="w-full py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles className="w-4 h-4" />
                Take a Break
              </motion.button>

              <div className="flex gap-3">
                <button
                  onClick={handlePlayGame}
                  className="flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  style={{
                    background: "var(--bg-tertiary)",
                    color: "var(--text-secondary)",
                  }}
                >
                  🎮 Play a Game
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  style={{
                    background: "var(--bg-tertiary)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Done <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
