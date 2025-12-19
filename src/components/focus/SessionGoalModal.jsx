import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, X, Sparkles, Zap } from "lucide-react";
import { useFocus } from "../../context/FocusContext";

const QUICK_GOALS = [
  "Complete homework assignment",
  "Study for exam",
  "Finish project work",
  "Read a chapter",
  "Practice problems",
  "Review notes",
];

export default function SessionGoalModal() {
  const {
    showGoalModal,
    setShowGoalModal,
    startSession,
    preSessionGoal,
    setPreSessionGoal,
  } = useFocus();
  const [goal, setGoal] = useState("");

  const handleStart = () => {
    startSession(goal);
    setGoal("");
  };

  const handleQuickGoal = (quickGoal) => {
    setGoal(quickGoal);
  };

  const handleClose = () => {
    setShowGoalModal(false);
    setGoal("");
  };

  return (
    <AnimatePresence>
      {showGoalModal && (
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md rounded-2xl p-6"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-light)",
            }}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-lg transition-colors"
              style={{ background: "var(--bg-tertiary)" }}
            >
              <X
                className="w-4 h-4"
                style={{ color: "var(--text-tertiary)" }}
              />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "var(--gradient-primary)" }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Target className="w-8 h-8 text-white" />
              </motion.div>
              <h2
                className="text-xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                What's your focus goal?
              </h2>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                Setting a goal helps you stay on track
              </p>
            </div>

            {/* Goal input */}
            <div className="mb-4">
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., Complete Chapter 5 exercises"
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-light)",
                }}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
              />
            </div>

            {/* Quick goals */}
            <div className="mb-6">
              <p
                className="text-xs mb-2 flex items-center gap-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                <Zap className="w-3 h-3" /> Quick suggestions
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_GOALS.map((quickGoal) => (
                  <button
                    key={quickGoal}
                    onClick={() => handleQuickGoal(quickGoal)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      goal === quickGoal ? "ring-2" : ""
                    }`}
                    style={{
                      background:
                        goal === quickGoal
                          ? "var(--primary-500)"
                          : "var(--bg-tertiary)",
                      color:
                        goal === quickGoal ? "white" : "var(--text-secondary)",
                      ringColor: "var(--primary-500)",
                    }}
                  >
                    {quickGoal}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl font-medium transition-colors"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                }}
              >
                Cancel
              </button>
              <motion.button
                onClick={handleStart}
                className="flex-1 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2"
                style={{ background: "var(--gradient-primary)" }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles className="w-4 h-4" />
                Start Focus
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
