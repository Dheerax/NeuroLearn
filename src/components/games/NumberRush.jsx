import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Clock,
  Trophy,
  Calculator,
  Check,
  X,
} from "lucide-react";

const operations = ["+", "-", "×"];

export default function NumberRush({ onComplete, onBack }) {
  const [gameState, setGameState] = useState("idle");
  const [problem, setProblem] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [problemsAnswered, setProblemsAnswered] = useState(0);
  const [difficulty, setDifficulty] = useState(1);

  const generateProblem = useCallback(() => {
    const op = operations[Math.floor(Math.random() * operations.length)];
    let a, b, answer;

    const maxNum = 5 + difficulty * 3;

    if (op === "+") {
      a = Math.floor(Math.random() * maxNum) + 1;
      b = Math.floor(Math.random() * maxNum) + 1;
      answer = a + b;
    } else if (op === "-") {
      a = Math.floor(Math.random() * maxNum) + 5;
      b = Math.floor(Math.random() * Math.min(a, maxNum)) + 1;
      answer = a - b;
    } else {
      a = Math.floor(Math.random() * Math.min(12, maxNum)) + 1;
      b = Math.floor(Math.random() * Math.min(12, maxNum)) + 1;
      answer = a * b;
    }

    // Generate wrong answers
    let wrongAnswers = new Set();
    while (wrongAnswers.size < 3) {
      let wrong = answer + (Math.floor(Math.random() * 10) - 5);
      if (wrong !== answer && wrong > 0) {
        wrongAnswers.add(wrong);
      }
    }

    const allOptions = [answer, ...wrongAnswers].sort(
      () => Math.random() - 0.5
    );

    setProblem({ a, b, op, answer });
    setOptions(allOptions);
    setFeedback(null);
  }, [difficulty]);

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setTimeLeft(60);
    setStreak(0);
    setProblemsAnswered(0);
    setDifficulty(1);
    generateProblem();
  };

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameState("finished");
          onComplete?.(score);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, score, onComplete]);

  // Increase difficulty
  useEffect(() => {
    if (problemsAnswered > 0 && problemsAnswered % 5 === 0) {
      setDifficulty((d) => Math.min(d + 1, 5));
    }
  }, [problemsAnswered]);

  const handleAnswer = (selected) => {
    if (feedback) return;

    const isCorrect = selected === problem.answer;

    if (isCorrect) {
      const streakBonus = streak * 5;
      const points = 10 + streakBonus;
      setScore((s) => s + points);
      setStreak((s) => s + 1);
      setFeedback({ type: "correct", points });
    } else {
      setStreak(0);
      setFeedback({ type: "wrong", correct: problem.answer });
    }

    setProblemsAnswered((p) => p + 1);

    setTimeout(() => {
      generateProblem();
    }, 600);
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
          <div className="flex items-center gap-3">
            <motion.div
              className="flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 px-4 py-2 rounded-xl border border-primary/30"
              key={score}
              animate={{ scale: [1, 1.05, 1] }}
            >
              <Star className="w-4 h-4 text-warning" />
              <span className="font-bold text-lg">{score}</span>
            </motion.div>

            <motion.div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                timeLeft <= 10
                  ? "bg-error/20 border-error/30 text-error"
                  : "bg-surface-elevated border-border"
              }`}
              animate={timeLeft <= 10 ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              <Clock className="w-4 h-4" />
              <span className="font-bold text-lg">{timeLeft}s</span>
            </motion.div>

            {streak >= 3 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-xl font-bold text-sm"
              >
                🔥 x{streak}
              </motion.div>
            )}
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
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mx-auto mb-6"
              >
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                  <Calculator className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Number Rush
              </h2>
              <p className="text-text-secondary mb-6 max-w-xs mx-auto">
                Solve math problems as fast as you can!
                <br />
                Build streaks for bonus points.
              </p>

              <motion.button
                onClick={startGame}
                className="btn btn-primary px-8 py-4 text-lg rounded-2xl shadow-lg shadow-primary/30"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Rush!
              </motion.button>
            </motion.div>
          )}

          {/* Playing State */}
          {gameState === "playing" && problem && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-md text-center"
            >
              {/* Timer Bar */}
              <div className="mb-8 px-2">
                <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${
                      timeLeft <= 10
                        ? "bg-error"
                        : "bg-gradient-to-r from-primary to-accent"
                    }`}
                    animate={{ width: `${(timeLeft / 60) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Problem Display */}
              <motion.div
                className="mb-8"
                key={`${problem.a}${problem.op}${problem.b}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="inline-flex items-center gap-4 bg-gradient-to-br from-surface to-surface-elevated px-8 py-6 rounded-2xl shadow-xl border border-border">
                  <motion.span
                    className="text-5xl font-black text-text-primary"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    {problem.a}
                  </motion.span>
                  <span className="text-4xl font-bold text-primary">
                    {problem.op}
                  </span>
                  <motion.span
                    className="text-5xl font-black text-text-primary"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {problem.b}
                  </motion.span>
                  <span className="text-4xl font-bold text-text-secondary">
                    =
                  </span>
                  <span className="text-5xl font-black text-accent">?</span>
                </div>
              </motion.div>

              {/* Feedback */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mb-4 py-2 px-4 rounded-xl inline-flex items-center gap-2 ${
                      feedback.type === "correct"
                        ? "bg-success/20 text-success"
                        : "bg-error/20 text-error"
                    }`}
                  >
                    {feedback.type === "correct" ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span className="font-bold">+{feedback.points}</span>
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5" />
                        <span className="font-bold">
                          Answer: {feedback.correct}
                        </span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4 px-4">
                {options.map((option, index) => (
                  <motion.button
                    key={`${option}-${index}`}
                    onClick={() => handleAnswer(option)}
                    disabled={!!feedback}
                    className={`py-5 rounded-2xl font-bold text-2xl transition-all ${
                      feedback
                        ? option === problem.answer
                          ? "bg-success text-white"
                          : option === feedback?.selected
                          ? "bg-error text-white"
                          : "bg-surface-elevated text-text-secondary opacity-50"
                        : "bg-gradient-to-br from-surface-elevated to-surface border-2 border-border hover:border-primary hover:scale-105 active:scale-95"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={!feedback ? { y: -3 } : {}}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>

              {/* Difficulty indicator */}
              <div className="mt-6 flex items-center justify-center gap-2">
                <span className="text-xs text-text-secondary">Difficulty:</span>
                {[1, 2, 3, 4, 5].map((d) => (
                  <div
                    key={d}
                    className={`w-2 h-2 rounded-full ${
                      d <= difficulty ? "bg-primary" : "bg-surface-elevated"
                    }`}
                  />
                ))}
              </div>
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
                Time's Up!
              </h2>
              <p className="text-5xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                {score}
              </p>
              <p className="text-text-secondary mb-2">points</p>
              <p className="text-sm text-text-secondary mb-6">
                {problemsAnswered} problems solved
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
    </div>
  );
}
