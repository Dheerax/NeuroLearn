import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Gamepad2,
  X,
  Brain,
  Heart,
  Target,
  Coffee,
} from "lucide-react";
import { useFocusMonitor } from "../context/FocusMonitorContext";

const quickGames = [
  {
    id: "breathing",
    name: "Calm Breathing",
    icon: Heart,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "memory",
    name: "Memory Match",
    icon: Brain,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "targets",
    name: "Focus Targets",
    icon: Target,
    color: "from-orange-500 to-red-500",
  },
];

export default function DistractionAlert() {
  const { showAlert, dismissAlert, lastResult, distractionCount } =
    useFocusMonitor();
  const navigate = useNavigate();

  const handlePlayGame = (gameId) => {
    dismissAlert();
    navigate(`/games?play=${gameId}`);
  };

  const handleTakeBreak = () => {
    dismissAlert();
    navigate("/games");
  };

  return (
    <AnimatePresence>
      {showAlert && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={dismissAlert}
          />

          {/* Alert Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <div className="bg-gradient-to-br from-surface via-surface to-surface-elevated rounded-3xl shadow-2xl border border-border overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-warning/10 to-orange-500/10 p-6 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning to-orange-500 flex items-center justify-center shadow-lg"
                    >
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold text-text-primary">
                        Taking a Break?
                      </h3>
                      <p className="text-sm text-text-secondary">
                        You seem a bit distracted
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={dismissAlert}
                    className="p-2 rounded-xl hover:bg-surface-elevated transition-colors"
                  >
                    <X className="w-5 h-5 text-text-secondary" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-text-secondary mb-4">
                  That's okay! A quick brain game can help you refocus. Try one
                  of these:
                </p>

                {/* Quick Game Options */}
                <div className="space-y-2 mb-6">
                  {quickGames.map((game) => (
                    <motion.button
                      key={game.id}
                      onClick={() => handlePlayGame(game.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-elevated hover:bg-primary/10 border border-border hover:border-primary/50 transition-all group"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-br ${game.color} text-white`}
                      >
                        <game.icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-text-primary group-hover:text-primary transition-colors">
                        {game.name}
                      </span>
                      <span className="ml-auto text-text-secondary group-hover:text-primary transition-colors">
                        →
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    onClick={handleTakeBreak}
                    className="flex-1 btn btn-primary py-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    All Games
                  </motion.button>
                  <motion.button
                    onClick={dismissAlert}
                    className="flex-1 btn py-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Coffee className="w-4 h-4 mr-2" />
                    I'm Fine
                  </motion.button>
                </div>

                {/* Stats hint */}
                {distractionCount > 1 && (
                  <p className="text-xs text-text-secondary text-center mt-4">
                    💡 You've been distracted {distractionCount} times this
                    session
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
