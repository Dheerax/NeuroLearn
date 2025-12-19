import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Clock,
  Trophy,
  Palette,
  Check,
  X,
} from "lucide-react";

const colorOptions = [
  { name: "Red", bg: "bg-red-500", hex: "#EF4444" },
  { name: "Blue", bg: "bg-blue-500", hex: "#3B82F6" },
  { name: "Green", bg: "bg-green-500", hex: "#22C55E" },
  { name: "Yellow", bg: "bg-yellow-500", hex: "#EAB308" },
  { name: "Purple", bg: "bg-purple-500", hex: "#A855F7" },
  { name: "Pink", bg: "bg-pink-500", hex: "#EC4899" },
  { name: "Orange", bg: "bg-orange-500", hex: "#F97316" },
  { name: "Cyan", bg: "bg-cyan-500", hex: "#06B6D4" },
];

export default function ColorMatch({ onComplete, onBack }) {
  const [gameState, setGameState] = useState("idle");
  const [currentRound, setCurrentRound] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [totalRounds] = useState(10);
  const [timeLeft, setTimeLeft] = useState(3);
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const generateRound = useCallback(() => {
    const textColor =
      colorOptions[Math.floor(Math.random() * colorOptions.length)];
    let displayColor =
      colorOptions[Math.floor(Math.random() * colorOptions.length)];

    // 70% chance of mismatch to make it challenging
    if (Math.random() > 0.3) {
      while (displayColor.name === textColor.name) {
        displayColor =
          colorOptions[Math.floor(Math.random() * colorOptions.length)];
      }
    }

    // Random question type
    const askForTextColor = Math.random() > 0.5;

    // Generate options (including correct answer)
    const correctAnswer = askForTextColor ? textColor : displayColor;
    let options = [correctAnswer];
    while (options.length < 4) {
      const opt = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      if (!options.find((o) => o.name === opt.name)) {
        options.push(opt);
      }
    }
    options = options.sort(() => Math.random() - 0.5);

    return { textColor, displayColor, askForTextColor, correctAnswer, options };
  }, []);

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setRound(0);
    setStreak(0);
    nextRound();
  };

  const nextRound = () => {
    setRound((r) => r + 1);
    setCurrentRound(generateRound());
    setTimeLeft(3);
    setFeedback(null);
    setIsTimerRunning(true);
  };

  // Timer
  useEffect(() => {
    if (!isTimerRunning || gameState !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          setIsTimerRunning(false);
          handleAnswer(null);
          return 0;
        }
        return t - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isTimerRunning, gameState]);

  const handleAnswer = (selected) => {
    setIsTimerRunning(false);

    if (selected && selected.name === currentRound.correctAnswer.name) {
      const timeBonus = Math.floor(timeLeft * 20);
      const streakBonus = streak * 10;
      const points = 50 + timeBonus + streakBonus;
      setScore((s) => s + points);
      setStreak((s) => s + 1);
      setFeedback({ type: "correct", points });
    } else {
      setStreak(0);
      setFeedback({ type: "wrong", correct: currentRound.correctAnswer });
    }

    setTimeout(() => {
      if (round >= totalRounds) {
        setGameState("finished");
        onComplete?.(score);
      } else {
        nextRound();
      }
    }, 1200);
  };

  return (
    <div className="min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
          whileHover={{ x: -3 }}
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </motion.button>

        {gameState === "playing" && (
          <div className="flex items-center gap-4">
            <motion.div
              className="flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 px-4 py-2 rounded-xl border border-primary/30"
              key={score}
              animate={{ scale: [1, 1.05, 1] }}
            >
              <Star className="w-4 h-4 text-warning" />
              <span className="font-bold">{score}</span>
            </motion.div>

            <div className="flex items-center gap-2 px-3 py-2 bg-surface-elevated rounded-xl">
              <span className="text-sm text-text-secondary">
                {round}/{totalRounds}
              </span>
            </div>
          </div>
        )}

        <div className="w-16" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {/* Idle State */}
          {gameState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="mx-auto mb-6"
              >
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary via-accent to-pink-500 flex items-center justify-center shadow-2xl">
                  <Palette className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Color Match
              </h2>
              <p className="text-text-secondary mb-6 max-w-xs mx-auto">
                Match the color of the TEXT, not the word! <br />
                Think fast - you only have 3 seconds!
              </p>

              <motion.button
                onClick={startGame}
                className="btn btn-primary px-8 py-4 text-lg rounded-2xl shadow-lg shadow-primary/30"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Game
              </motion.button>
            </motion.div>
          )}

          {/* Playing State */}
          {gameState === "playing" && currentRound && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md"
            >
              {/* Timer Bar */}
              <div className="mb-6 px-2">
                <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${
                      timeLeft < 1
                        ? "bg-error"
                        : timeLeft < 2
                        ? "bg-warning"
                        : "bg-primary"
                    }`}
                    initial={{ width: "100%" }}
                    animate={{ width: `${(timeLeft / 3) * 100}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>

              {/* Question */}
              <motion.div
                className="text-center mb-8"
                key={round}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <p className="text-sm text-text-secondary mb-3">
                  What is the{" "}
                  <span className="font-bold text-primary">
                    {currentRound.askForTextColor
                      ? "TEXT COLOR"
                      : "BACKGROUND COLOR"}
                  </span>
                  ?
                </p>

                <div
                  className={`inline-block px-8 py-4 rounded-2xl ${currentRound.displayColor.bg} shadow-lg`}
                >
                  <span
                    className="text-4xl font-black"
                    style={{ color: currentRound.textColor.hex }}
                  >
                    {currentRound.textColor.name.toUpperCase()}
                  </span>
                </div>
              </motion.div>

              {/* Feedback */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`text-center mb-4 py-3 rounded-xl ${
                      feedback.type === "correct"
                        ? "bg-success/20 text-success"
                        : "bg-error/20 text-error"
                    }`}
                  >
                    {feedback.type === "correct" ? (
                      <span className="font-bold flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" /> +{feedback.points} points!
                      </span>
                    ) : (
                      <span className="font-bold flex items-center justify-center gap-2">
                        <X className="w-5 h-5" /> It was {feedback.correct.name}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                {currentRound.options.map((option, index) => (
                  <motion.button
                    key={option.name}
                    onClick={() => !feedback && handleAnswer(option)}
                    disabled={!!feedback}
                    className={`py-4 rounded-xl font-bold text-lg transition-all ${
                      feedback
                        ? option.name === currentRound.correctAnswer.name
                          ? "bg-success text-white ring-4 ring-success/30"
                          : "bg-surface-elevated text-text-secondary opacity-50"
                        : "bg-surface-elevated hover:bg-primary hover:text-white border-2 border-border hover:border-primary"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={!feedback ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!feedback ? { scale: 0.98 } : {}}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className={`w-4 h-4 rounded-full ${option.bg}`} />
                      {option.name}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Streak */}
              {streak > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-4"
                >
                  <span className="text-warning text-sm font-medium">
                    🔥 {streak} streak!
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Finished State */}
          {gameState === "finished" && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
                className="mx-auto mb-6"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-warning to-orange-500 flex items-center justify-center shadow-2xl">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              <h2 className="text-3xl font-bold text-text-primary mb-2">
                Game Over!
              </h2>
              <p className="text-5xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
                {score}
              </p>

              <div className="flex gap-4 justify-center">
                <motion.button
                  onClick={startGame}
                  className="btn btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Play Again
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
      </div>

      {/* Tips */}
      {gameState === "idle" && (
        <motion.p
          className="text-center text-xs text-text-secondary mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          💡 This game trains selective attention and cognitive flexibility
        </motion.p>
      )}
    </div>
  );
}
