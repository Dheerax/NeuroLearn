import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Zap, Trophy, Timer } from "lucide-react";

export default function ReactionTime({ onComplete, onBack }) {
  const [gameState, setGameState] = useState("idle");
  const [startTime, setStartTime] = useState(null);
  const [reactionTime, setReactionTime] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [round, setRound] = useState(0);
  const [totalRounds] = useState(5);
  const [tooEarly, setTooEarly] = useState(false);

  const startRound = useCallback(() => {
    setGameState("waiting");
    setTooEarly(false);

    // Random delay between 1-4 seconds
    const delay = 1000 + Math.random() * 3000;

    const timeoutId = setTimeout(() => {
      setGameState("ready");
      setStartTime(Date.now());
    }, delay);

    // Store timeout ID to cancel if clicked too early
    window.reactionTimeout = timeoutId;
  }, []);

  const handleClick = () => {
    if (gameState === "idle") {
      startRound();
      setRound(1);
      setAttempts([]);
    } else if (gameState === "waiting") {
      // Clicked too early
      clearTimeout(window.reactionTimeout);
      setTooEarly(true);
      setGameState("early");
    } else if (gameState === "ready") {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setAttempts((prev) => [...prev, time]);

      if (round >= totalRounds) {
        setGameState("finished");
        onComplete?.(time);
      } else {
        setGameState("result");
      }
    } else if (gameState === "result" || gameState === "early") {
      setRound((r) => r + 1);
      startRound();
    }
  };

  const getAverageTime = () => {
    if (attempts.length === 0) return 0;
    return Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length);
  };

  const getBestTime = () => {
    if (attempts.length === 0) return 0;
    return Math.min(...attempts);
  };

  const getReactionRating = (time) => {
    if (time < 200) return { text: "Superhuman! 🦸", color: "text-purple-400" };
    if (time < 250) return { text: "Incredible! ⚡", color: "text-yellow-400" };
    if (time < 300) return { text: "Excellent! 🔥", color: "text-orange-400" };
    if (time < 400) return { text: "Good! 👍", color: "text-green-400" };
    if (time < 500) return { text: "Average 😊", color: "text-blue-400" };
    return { text: "Keep practicing! 💪", color: "text-text-secondary" };
  };

  const getBackgroundColor = () => {
    switch (gameState) {
      case "waiting":
        return "from-red-600 to-red-700";
      case "ready":
        return "from-green-500 to-emerald-600";
      case "early":
        return "from-orange-500 to-amber-600";
      case "result":
        return "from-primary to-accent";
      case "finished":
        return "from-warning to-orange-500";
      default:
        return "from-surface to-surface-elevated";
    }
  };

  const reset = () => {
    setGameState("idle");
    setRound(0);
    setAttempts([]);
    setReactionTime(null);
  };

  return (
    <div className="min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors z-10"
          whileHover={{ x: -3 }}
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </motion.button>

        {gameState !== "idle" && (
          <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-xl z-10">
            <span className="text-white/80">
              Round {round}/{totalRounds}
            </span>
          </div>
        )}

        <div className="w-16" />
      </div>

      {/* Main Game Area */}
      <motion.div
        className={`flex-1 flex flex-col items-center justify-center rounded-2xl mx-2 cursor-pointer relative overflow-hidden bg-gradient-to-br ${getBackgroundColor()}`}
        onClick={handleClick}
        animate={{
          scale: gameState === "ready" ? [1, 1.02, 1] : 1,
        }}
        transition={{
          repeat: gameState === "ready" ? Infinity : 0,
          duration: 0.3,
        }}
      >
        {/* Background pulse for ready state */}
        {gameState === "ready" && (
          <motion.div
            className="absolute inset-0 bg-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.2, 0] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          />
        )}

        <AnimatePresence mode="wait">
          {/* Idle State */}
          {gameState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center px-6"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mx-auto mb-6"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl">
                  <Zap className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Reaction Time
              </h2>
              <p className="text-text-secondary mb-6">
                Wait for green, then click as fast as you can!
              </p>

              <motion.div
                className="inline-block px-8 py-4 bg-primary/20 rounded-2xl border-2 border-primary text-primary font-bold text-lg"
                whileHover={{ scale: 1.05 }}
              >
                Click to Start
              </motion.div>
            </motion.div>
          )}

          {/* Waiting State */}
          {gameState === "waiting" && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Timer className="w-20 h-20 text-white/90 mx-auto mb-6" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">Wait...</h2>
              <p className="text-white/70">Don't click yet!</p>
            </motion.div>
          )}

          {/* Ready State */}
          {gameState === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 0.3 }}
              >
                <Zap className="w-24 h-24 text-white mx-auto mb-6 drop-shadow-2xl" />
              </motion.div>
              <h2 className="text-4xl font-black text-white mb-2">CLICK!</h2>
            </motion.div>
          )}

          {/* Too Early State */}
          {gameState === "early" && (
            <motion.div
              key="early"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.span
                className="text-8xl block mb-4"
                animate={{ rotate: [0, -10, 10, 0] }}
              >
                😅
              </motion.span>
              <h2 className="text-3xl font-bold text-white mb-2">Too Early!</h2>
              <p className="text-white/80 mb-6">Wait for the green screen</p>
              <p className="text-white/60">Click to try again</p>
            </motion.div>
          )}

          {/* Result State */}
          {gameState === "result" && reactionTime && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.p
                className="text-7xl font-black text-white mb-2"
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
              >
                {reactionTime}
              </motion.p>
              <p className="text-2xl text-white/90 mb-4">milliseconds</p>
              <p
                className={`text-xl font-bold mb-6 ${
                  getReactionRating(reactionTime).color
                }`}
              >
                {getReactionRating(reactionTime).text}
              </p>
              <p className="text-white/60">Click for next round</p>
            </motion.div>
          )}

          {/* Finished State */}
          {gameState === "finished" && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center bg-gradient-to-br from-surface/95 to-surface-elevated/95 backdrop-blur-xl p-8 rounded-3xl mx-4 shadow-2xl border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <Trophy className="w-16 h-16 text-warning mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                Results
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-elevated p-4 rounded-xl">
                  <p className="text-3xl font-black text-primary">
                    {getAverageTime()}
                  </p>
                  <p className="text-sm text-text-secondary">Average (ms)</p>
                </div>
                <div className="bg-surface-elevated p-4 rounded-xl">
                  <p className="text-3xl font-black text-success">
                    {getBestTime()}
                  </p>
                  <p className="text-sm text-text-secondary">Best (ms)</p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap justify-center mb-6">
                {attempts.map((time, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      time === getBestTime()
                        ? "bg-success/20 text-success"
                        : "bg-surface-elevated text-text-secondary"
                    }`}
                  >
                    {time}ms
                  </motion.span>
                ))}
              </div>

              <div className="flex gap-3 justify-center">
                <motion.button
                  onClick={reset}
                  className="btn btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Try Again
                </motion.button>
                <motion.button
                  onClick={onBack}
                  className="btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Back
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Progress dots */}
      {gameState !== "idle" && gameState !== "finished" && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < attempts.length
                  ? "bg-success"
                  : i === attempts.length
                  ? "bg-primary"
                  : "bg-surface-elevated"
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
