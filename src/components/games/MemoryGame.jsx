import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  RotateCcw,
  Zap,
  Star,
  Trophy,
  Sparkles,
} from "lucide-react";

const cardData = [
  { emoji: "🧠", name: "Brain" },
  { emoji: "💡", name: "Bulb" },
  { emoji: "🎯", name: "Target" },
  { emoji: "⭐", name: "Star" },
  { emoji: "🌟", name: "Glow" },
  { emoji: "💎", name: "Gem" },
  { emoji: "🔮", name: "Crystal" },
  { emoji: "🎨", name: "Art" },
];

export default function MemoryGame({ onComplete, onBack }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem("memory_best");
    return saved ? parseInt(saved) : null;
  });

  const initGame = useCallback(() => {
    const shuffled = [...cardData, ...cardData]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({ id: index, ...card }));
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (matched.length === cardData.length * 2 && cards.length > 0) {
      setGameWon(true);
      if (!bestScore || moves < bestScore) {
        setBestScore(moves);
        localStorage.setItem("memory_best", moves.toString());
      }
      onComplete?.(moves);
    }
  }, [matched.length, cards.length, moves, bestScore, onComplete]);

  const handleCardClick = (index) => {
    if (
      flipped.length === 2 ||
      flipped.includes(index) ||
      matched.includes(index)
    )
      return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          setMatched((prev) => [...prev, first, second]);
          setFlipped([]);
        }, 400);
      } else {
        setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  const getCardGradient = (emoji) => {
    const gradients = {
      "🧠": "from-purple-500 to-pink-500",
      "💡": "from-yellow-400 to-orange-500",
      "🎯": "from-red-500 to-rose-500",
      "⭐": "from-amber-400 to-yellow-500",
      "🌟": "from-blue-400 to-cyan-500",
      "💎": "from-cyan-400 to-blue-500",
      "🔮": "from-violet-500 to-purple-600",
      "🎨": "from-pink-500 to-rose-500",
    };
    return gradients[emoji] || "from-gray-400 to-gray-500";
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

        <div className="flex items-center gap-4">
          <motion.div
            className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 rounded-xl border border-primary/20"
            animate={{ scale: moves > 0 ? [1, 1.05, 1] : 1 }}
            key={moves}
          >
            <Zap className="w-4 h-4 text-warning" />
            <span className="font-bold">{moves}</span>
            <span className="text-text-secondary text-sm">moves</span>
          </motion.div>

          {bestScore && (
            <div className="flex items-center gap-2 bg-surface-elevated px-3 py-2 rounded-xl">
              <Trophy className="w-4 h-4 text-warning" />
              <span className="text-sm text-text-secondary">
                Best: {bestScore}
              </span>
            </div>
          )}
        </div>

        <motion.button
          onClick={initGame}
          className="flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-primary/10 rounded-xl transition-colors"
          whileHover={{ rotate: -180 }}
          transition={{ duration: 0.3 }}
        >
          <RotateCcw size={16} />
          <span>Reset</span>
        </motion.button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 px-2">
        <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{
              width: `${(matched.length / (cardData.length * 2)) * 100}%`,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-text-secondary">
          <span>{matched.length / 2} pairs found</span>
          <span>{cardData.length - matched.length / 2} remaining</span>
        </div>
      </div>

      {/* Game Grid */}
      <div className="flex-1 flex items-center justify-center px-2">
        <div className="grid grid-cols-4 gap-3 w-full max-w-md">
          {cards.map((card, index) => {
            const isFlipped = flipped.includes(index);
            const isMatched = matched.includes(index);

            return (
              <motion.button
                key={card.id}
                onClick={() => handleCardClick(index)}
                className="relative aspect-square perspective-1000"
                whileHover={{
                  scale: isMatched ? 1 : 1.05,
                  y: isMatched ? 0 : -5,
                }}
                whileTap={{ scale: 0.95 }}
                layout
              >
                <motion.div
                  className="absolute inset-0 w-full h-full preserve-3d"
                  initial={false}
                  animate={{
                    rotateY: isFlipped || isMatched ? 180 : 0,
                    scale: isMatched ? 0.95 : 1,
                  }}
                  transition={{
                    duration: 0.5,
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                >
                  {/* Card Back */}
                  <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center shadow-lg border border-white/20 backface-hidden">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Sparkles className="w-6 h-6 text-white/80" />
                    </div>
                  </div>

                  {/* Card Front */}
                  <div
                    className={`absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br ${getCardGradient(
                      card.emoji
                    )} flex items-center justify-center shadow-xl border-2 border-white/30 backface-hidden rotate-y-180 ${
                      isMatched
                        ? "ring-4 ring-success/50 ring-offset-2 ring-offset-background"
                        : ""
                    }`}
                  >
                    <motion.span
                      className="text-4xl md:text-5xl filter drop-shadow-lg"
                      animate={
                        isMatched
                          ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }
                          : {}
                      }
                      transition={{ duration: 0.5 }}
                    >
                      {card.emoji}
                    </motion.span>
                  </div>
                </motion.div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Win Modal */}
      <AnimatePresence>
        {gameWon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setGameWon(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-gradient-to-br from-surface via-surface to-surface-elevated p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.1, 1.1, 1.1, 1.1, 1],
                }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-block"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-warning to-orange-500 flex items-center justify-center shadow-lg shadow-warning/30">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              <motion.h3
                className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Excellent! 🎉
              </motion.h3>

              <motion.p
                className="text-text-secondary mb-6 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Completed in{" "}
                <span className="text-primary font-bold">{moves}</span> moves
                {bestScore === moves && (
                  <span className="text-warning ml-2">🏆 New Best!</span>
                )}
              </motion.p>

              <motion.div
                className="flex gap-3 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  onClick={initGame}
                  className="btn btn-primary px-6"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Play Again
                </motion.button>
                <motion.button
                  onClick={onBack}
                  className="btn px-6"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Back
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
