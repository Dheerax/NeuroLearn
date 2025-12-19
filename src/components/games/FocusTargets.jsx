import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Star, Clock, Trophy, Flame } from "lucide-react";

export default function FocusTargets({ onComplete, onBack }) {
  const [targets, setTargets] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [particles, setParticles] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const gameAreaRef = useRef(null);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("focus_highscore");
    return saved ? parseInt(saved) : 0;
  });

  // Game timer
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setIsPlaying(false);
          setShowResult(true);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem("focus_highscore", score.toString());
          }
          onComplete?.(score);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, score, highScore, onComplete]);

  // Spawn targets
  useEffect(() => {
    if (!isPlaying) return;

    const spawnTarget = () => {
      const id = Date.now() + Math.random();
      const size = 35 + Math.random() * 25;
      const x = 5 + Math.random() * 75;
      const y = 5 + Math.random() * 75;
      const type =
        Math.random() > 0.85
          ? "bonus"
          : Math.random() > 0.9
          ? "danger"
          : "normal";
      const lifetime =
        type === "bonus" ? 1200 : type === "danger" ? 2500 : 2000;

      setTargets((prev) => [
        ...prev,
        { id, x, y, size, type, createdAt: Date.now() },
      ]);

      setTimeout(() => {
        setTargets((prev) => {
          const target = prev.find((t) => t.id === id);
          if (target && target.type !== "danger") {
            setCombo(0); // Reset combo if missed normal target
          }
          return prev.filter((t) => t.id !== id);
        });
      }, lifetime);
    };

    const baseInterval = Math.max(400, 700 - Math.floor(score / 50) * 50);
    const interval = setInterval(spawnTarget, baseInterval);
    return () => clearInterval(interval);
  }, [isPlaying, score]);

  const createParticles = (x, y, color, count = 10) => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i + Math.random(),
      x,
      y,
      angle: (i / count) * Math.PI * 2 + Math.random() * 0.5,
      speed: 2 + Math.random() * 3,
      color,
      size: 3 + Math.random() * 4,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) =>
        prev.filter((p) => !newParticles.find((np) => np.id === p.id))
      );
    }, 600);
  };

  const handleTargetClick = (e, target) => {
    e.stopPropagation();

    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (target.x / 100) * rect.width + target.size / 2;
    const y = (target.y / 100) * rect.height + target.size / 2;

    setTargets((prev) => prev.filter((t) => t.id !== target.id));

    if (target.type === "danger") {
      createParticles(x, y, "#EF4444", 15);
      setScore((s) => Math.max(0, s - 20));
      setCombo(0);
      return;
    }

    const basePoints = target.type === "bonus" ? 30 : 10;
    const comboMultiplier = 1 + Math.floor(combo / 5) * 0.5;
    const points = Math.floor(basePoints * comboMultiplier);

    setScore((s) => s + points);
    setCombo((c) => {
      const newCombo = c + 1;
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      return newCombo;
    });

    createParticles(
      x,
      y,
      target.type === "bonus" ? "#FBBF24" : "#6366F1",
      target.type === "bonus" ? 15 : 8
    );
  };

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(30);
    setTargets([]);
    setCombo(0);
    setMaxCombo(0);
    setShowResult(false);
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

        <div className="flex items-center gap-3">
          {/* Score */}
          <motion.div
            className="flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 px-4 py-2 rounded-xl border border-primary/30"
            animate={{ scale: score > 0 ? [1, 1.05, 1] : 1 }}
            key={score}
          >
            <Star className="w-5 h-5 text-warning" />
            <span className="font-bold text-xl">{score}</span>
          </motion.div>

          {/* Timer */}
          <motion.div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
              timeLeft <= 10
                ? "bg-error/20 border-error/30 text-error"
                : "bg-surface-elevated border-border"
            }`}
            animate={timeLeft <= 10 && isPlaying ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            <Clock className="w-5 h-5" />
            <span className="font-bold text-xl">{timeLeft}s</span>
          </motion.div>

          {/* Combo */}
          <AnimatePresence>
            {combo >= 3 && (
              <motion.div
                initial={{ scale: 0, x: -20 }}
                animate={{ scale: 1, x: 0 }}
                exit={{ scale: 0, x: 20 }}
                className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-xl font-bold shadow-lg"
              >
                <Flame className="w-5 h-5" />
                <span>x{combo}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {highScore > 0 && (
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <Trophy className="w-4 h-4 text-warning" />
            <span>Best: {highScore}</span>
          </div>
        )}
      </div>

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="flex-1 relative rounded-2xl border border-border overflow-hidden min-h-[400px]"
        style={{
          background:
            "linear-gradient(135deg, rgba(15, 15, 20, 0.9), rgba(20, 20, 30, 0.9))",
          boxShadow: "inset 0 0 100px rgba(99, 102, 241, 0.05)",
        }}
      >
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Start Screen */}
        {!isPlaying && !showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20"
          >
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="mb-6"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/30">
                <Star className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">
              Focus Targets
            </h3>
            <p className="text-text-secondary mb-6 text-center max-w-xs">
              Click targets to score points! <br />
              <span className="text-warning">⭐ Gold = Bonus</span> •
              <span className="text-error ml-2">💀 Red = Danger</span>
            </p>
            <motion.button
              onClick={startGame}
              className="btn btn-primary px-8 py-4 text-lg rounded-2xl shadow-lg shadow-primary/30"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play size={24} className="mr-2" /> Start Game
            </motion.button>
          </motion.div>
        )}

        {/* Result Screen */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12 }}
                className="bg-gradient-to-br from-surface to-surface-elevated p-8 rounded-3xl shadow-2xl text-center border border-border max-w-sm"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-warning to-orange-500 flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-text-primary mb-2">
                  Time's Up!
                </h3>
                <p className="text-5xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  {score}
                </p>
                <p className="text-text-secondary mb-1">points</p>

                {score >= highScore && score > 0 && (
                  <motion.p
                    className="text-warning font-bold text-lg mb-4"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    🏆 New High Score!
                  </motion.p>
                )}

                <div className="flex justify-center gap-6 text-sm text-text-secondary mb-6">
                  <div>
                    <span className="font-bold text-primary">{maxCombo}</span>{" "}
                    max combo
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={startGame}
                    className="btn btn-primary flex-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Play Again
                  </motion.button>
                  <motion.button
                    onClick={onBack}
                    className="btn flex-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Back
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Targets */}
        <AnimatePresence>
          {targets.map((target) => (
            <motion.button
              key={target.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              onClick={(e) => handleTargetClick(e, target)}
              style={{
                position: "absolute",
                left: `${target.x}%`,
                top: `${target.y}%`,
                width: target.size,
                height: target.size,
              }}
              className={`rounded-full cursor-pointer shadow-lg ${
                target.type === "bonus"
                  ? "bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500 ring-2 ring-yellow-300/50"
                  : target.type === "danger"
                  ? "bg-gradient-to-br from-red-500 via-red-600 to-red-700 ring-2 ring-red-400/50"
                  : "bg-gradient-to-br from-primary via-indigo-500 to-accent"
              }`}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.8 }}
            >
              {target.type === "bonus" && (
                <Star className="w-full h-full p-1.5 text-white drop-shadow-lg" />
              )}
              {target.type === "danger" && (
                <span className="flex items-center justify-center w-full h-full text-white text-lg">
                  💀
                </span>
              )}
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: p.x,
              y: p.y,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              x: p.x + Math.cos(p.angle) * 60 * p.speed,
              y: p.y + Math.sin(p.angle) * 60 * p.speed,
              scale: 0,
              opacity: 0,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute rounded-full pointer-events-none"
            style={{
              backgroundColor: p.color,
              width: p.size,
              height: p.size,
            }}
          />
        ))}
      </div>

      {/* Tips */}
      <motion.p
        className="text-center text-xs text-text-secondary mt-3 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        💡 Build combos for score multipliers! Gold targets = 3x points
      </motion.p>
    </div>
  );
}
