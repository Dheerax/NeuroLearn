import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, RotateCcw, Star, Sparkles } from "lucide-react";

export default function PatternGame({ onComplete, onBack }) {
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [isShowing, setIsShowing] = useState(false);
  const [level, setLevel] = useState(1);
  const [activeButton, setActiveButton] = useState(null);
  const [gameState, setGameState] = useState("idle");
  const [showingIndex, setShowingIndex] = useState(-1);

  const colors = [
    {
      id: 0,
      gradient: "from-red-500 to-rose-600",
      glow: "shadow-red-500/60",
      light: "#EF4444",
    },
    {
      id: 1,
      gradient: "from-blue-500 to-indigo-600",
      glow: "shadow-blue-500/60",
      light: "#3B82F6",
    },
    {
      id: 2,
      gradient: "from-green-500 to-emerald-600",
      glow: "shadow-green-500/60",
      light: "#22C55E",
    },
    {
      id: 3,
      gradient: "from-yellow-500 to-amber-600",
      glow: "shadow-yellow-500/60",
      light: "#EAB308",
    },
  ];

  const startGame = async () => {
    const newSequence = Array.from({ length: level + 2 }, () =>
      Math.floor(Math.random() * 4)
    );
    setSequence(newSequence);
    setUserInput([]);
    setGameState("showing");

    await new Promise((r) => setTimeout(r, 800));

    for (let i = 0; i < newSequence.length; i++) {
      setShowingIndex(i);
      setActiveButton(newSequence[i]);
      await new Promise((r) => setTimeout(r, 600));
      setActiveButton(null);
      await new Promise((r) => setTimeout(r, 300));
    }

    setShowingIndex(-1);
    setGameState("input");
  };

  const handleButtonClick = (id) => {
    if (gameState !== "input") return;

    setActiveButton(id);
    setTimeout(() => setActiveButton(null), 200);

    const newInput = [...userInput, id];
    setUserInput(newInput);

    if (newInput[newInput.length - 1] !== sequence[newInput.length - 1]) {
      setGameState("lose");
      return;
    }

    if (newInput.length === sequence.length) {
      setGameState("win");
      if (level >= 10) {
        onComplete?.(level);
      }
    }
  };

  const nextLevel = () => {
    setLevel((l) => l + 1);
    setGameState("idle");
  };

  const resetGame = () => {
    setLevel(1);
    setGameState("idle");
    setSequence([]);
    setUserInput([]);
  };

  return (
    <div className="min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-2">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
          whileHover={{ x: -3 }}
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </motion.button>

        <motion.div
          className="flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 px-5 py-2 rounded-xl border border-primary/30"
          key={level}
          animate={{ scale: [1, 1.1, 1] }}
        >
          <Star className="w-5 h-5 text-warning" />
          <span className="font-bold text-lg">Level {level}</span>
        </motion.div>

        <motion.button
          onClick={resetGame}
          className="flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-primary/10 rounded-xl transition-colors"
          whileHover={{ rotate: -180 }}
          transition={{ duration: 0.3 }}
        >
          <RotateCcw size={16} />
        </motion.button>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mb-6">
        {sequence.map((_, i) => (
          <motion.div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i < userInput.length
                ? "bg-gradient-to-br from-success to-emerald-400"
                : i === showingIndex
                ? "bg-primary"
                : "bg-surface-elevated border border-border"
            }`}
            animate={i === showingIndex ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Game Board */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative">
          {/* Center Circle */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-surface to-surface-elevated border border-border flex items-center justify-center shadow-xl"
              animate={
                gameState === "showing"
                  ? {
                      boxShadow: [
                        "0 0 20px rgba(99, 102, 241, 0.3)",
                        "0 0 40px rgba(99, 102, 241, 0.5)",
                        "0 0 20px rgba(99, 102, 241, 0.3)",
                      ],
                    }
                  : {}
              }
              transition={{ repeat: Infinity, duration: 1 }}
            >
              {gameState === "showing" && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear",
                  }}
                >
                  <Sparkles className="w-10 h-10 text-primary" />
                </motion.div>
              )}
              {gameState === "input" && (
                <motion.span
                  className="text-2xl font-black text-text-primary"
                  key={userInput.length}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {userInput.length}/{sequence.length}
                </motion.span>
              )}
              {gameState === "idle" && <span className="text-3xl">🎮</span>}
              {gameState === "win" && (
                <motion.span
                  className="text-3xl"
                  animate={{ rotate: [0, -20, 20, 0], scale: [1, 1.2, 1] }}
                >
                  🎉
                </motion.span>
              )}
              {gameState === "lose" && <span className="text-3xl">😅</span>}
            </motion.div>
          </motion.div>

          {/* Color Buttons */}
          <div className="grid grid-cols-2 gap-5 w-72 h-72">
            {colors.map((color, index) => {
              const isActive = activeButton === color.id;
              const corners = [
                "rounded-tl-[100px] rounded-tr-3xl rounded-bl-3xl rounded-br-3xl",
                "rounded-tr-[100px] rounded-tl-3xl rounded-bl-3xl rounded-br-3xl",
                "rounded-bl-[100px] rounded-tl-3xl rounded-tr-3xl rounded-br-3xl",
                "rounded-br-[100px] rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl",
              ];

              return (
                <motion.button
                  key={color.id}
                  onClick={() => handleButtonClick(color.id)}
                  disabled={gameState !== "input"}
                  className={`${corners[index]} bg-gradient-to-br ${
                    color.gradient
                  } transition-all duration-150 ${
                    isActive
                      ? `shadow-2xl ${color.glow} brightness-125 scale-95`
                      : "shadow-lg opacity-80 hover:opacity-100"
                  } ${
                    gameState === "input"
                      ? "cursor-pointer hover:scale-[1.02]"
                      : "cursor-default"
                  }`}
                  whileTap={gameState === "input" ? { scale: 0.9 } : {}}
                  animate={
                    isActive
                      ? {
                          boxShadow: `0 0 30px ${color.light}, 0 0 60px ${color.light}40`,
                        }
                      : {}
                  }
                />
              );
            })}
          </div>
        </div>

        {/* Status Messages */}
        <div className="mt-10 text-center min-h-[100px]">
          <AnimatePresence mode="wait">
            {gameState === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <p className="text-text-secondary mb-4">
                  Remember and repeat the pattern!
                </p>
                <motion.button
                  onClick={startGame}
                  className="btn btn-primary px-8 py-3 text-lg rounded-2xl shadow-lg shadow-primary/30"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play size={20} className="mr-2" /> Start Level {level}
                </motion.button>
              </motion.div>
            )}

            {gameState === "showing" && (
              <motion.p
                key="showing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xl text-primary font-medium"
              >
                Watch the pattern...
              </motion.p>
            )}

            {gameState === "input" && (
              <motion.p
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xl text-accent font-medium"
              >
                Your turn! Repeat it
              </motion.p>
            )}

            {gameState === "win" && (
              <motion.div
                key="win"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <motion.div
                  className="flex items-center justify-center gap-2 text-success text-xl font-bold"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: 2 }}
                >
                  <Star className="w-6 h-6" />
                  <span>Level {level} Complete!</span>
                </motion.div>
                <motion.button
                  onClick={nextLevel}
                  className="btn btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Next Level →
                </motion.button>
              </motion.div>
            )}

            {gameState === "lose" && (
              <motion.div
                key="lose"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <p className="text-error text-xl font-medium">Wrong pattern!</p>
                <p className="text-text-secondary">You reached level {level}</p>
                <motion.button
                  onClick={resetGame}
                  className="btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw size={16} className="mr-2" /> Try Again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
