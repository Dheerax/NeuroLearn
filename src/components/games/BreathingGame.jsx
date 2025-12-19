import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Pause, Heart, Wind } from "lucide-react";

export default function BreathingGame({ onComplete, onBack }) {
  const [phase, setPhase] = useState("ready");
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalCycles] = useState(3);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const phases = {
    inhale: {
      duration: 4,
      next: "hold",
      label: "Breathe In",
      color: "#60A5FA",
      instruction: "Fill your lungs slowly",
    },
    hold: {
      duration: 4,
      next: "exhale",
      label: "Hold",
      color: "#FBBF24",
      instruction: "Keep the air in",
    },
    exhale: {
      duration: 4,
      next: "inhale",
      label: "Breathe Out",
      color: "#34D399",
      instruction: "Release slowly",
    },
  };

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    let particles = Array.from({ length: 60 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 60 + Math.random() * 80,
      speed: 0.001 + Math.random() * 0.002,
      size: 1 + Math.random() * 3,
      opacity: 0.2 + Math.random() * 0.4,
      hue: 220 + Math.random() * 40,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw glow in center
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        150
      );
      gradient.addColorStop(0, "rgba(99, 102, 241, 0.1)");
      gradient.addColorStop(1, "rgba(99, 102, 241, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.angle += p.speed * (isRunning ? 2 : 1);
        const x = centerX + Math.cos(p.angle) * p.radius;
        const y = centerY + Math.sin(p.angle) * p.radius;

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${p.opacity})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning]);

  // Breathing timer
  useEffect(() => {
    if (!isRunning || phase === "ready") return;

    const timer = setInterval(() => {
      setCount((c) => {
        if (c >= phases[phase].duration) {
          const nextPhase = phases[phase].next;
          if (phase === "exhale") {
            setCycles((cy) => {
              const newCycles = cy + 1;
              if (newCycles >= totalCycles) {
                setIsRunning(false);
                setPhase("ready");
                onComplete?.(totalCycles);
                return 0;
              }
              return newCycles;
            });
          }
          setPhase(nextPhase);
          return 1;
        }
        return c + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, phase, totalCycles, onComplete]);

  const startExercise = () => {
    setIsRunning(true);
    setPhase("inhale");
    setCount(1);
    setCycles(0);
  };

  const stopExercise = () => {
    setIsRunning(false);
    setPhase("ready");
  };

  const getCircleSize = () => {
    if (phase === "ready") return 140;
    const progress = count / phases[phase].duration;
    if (phase === "inhale") return 140 + progress * 80;
    if (phase === "hold") return 220;
    return 220 - progress * 80;
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

        <div className="text-center">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2 justify-center">
            <Wind className="text-primary" />
            Calm Breathing
          </h2>
          <p className="text-sm text-text-secondary">4-4-4 Box Breathing</p>
        </div>

        <div className="w-20" />
      </div>

      {/* Main Breathing Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <canvas
          ref={canvasRef}
          width={350}
          height={350}
          className="absolute pointer-events-none"
        />

        {/* Outer Ring */}
        <motion.div
          className="absolute rounded-full border-4 border-primary/20"
          animate={{
            width: getCircleSize() + 60,
            height: getCircleSize() + 60,
            opacity: isRunning ? 0.5 : 0.2,
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Middle Ring */}
        <motion.div
          className="absolute rounded-full border-2 border-primary/30"
          animate={{
            width: getCircleSize() + 30,
            height: getCircleSize() + 30,
            opacity: isRunning ? 0.7 : 0.3,
          }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />

        {/* Main Breathing Circle */}
        <motion.div
          animate={{
            width: getCircleSize(),
            height: getCircleSize(),
            boxShadow: isRunning
              ? `0 0 60px ${phases[phase]?.color}50, 0 0 120px ${phases[phase]?.color}20`
              : "0 0 30px rgba(99, 102, 241, 0.2)",
          }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="relative rounded-full flex items-center justify-center z-10"
          style={{
            background:
              phase === "ready"
                ? "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))"
                : `linear-gradient(135deg, ${phases[phase]?.color}30, ${phases[phase]?.color}10)`,
          }}
        >
          {/* Inner Circle */}
          <motion.div
            animate={{
              width: getCircleSize() - 40,
              height: getCircleSize() - 40,
            }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="rounded-full bg-gradient-to-br from-surface/90 to-surface-elevated/90 backdrop-blur-xl flex flex-col items-center justify-center border border-white/10 shadow-inner"
          >
            {phase === "ready" ? (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Heart className="w-14 h-14 text-primary" />
              </motion.div>
            ) : (
              <>
                <motion.p
                  className="text-xl font-bold mb-1"
                  style={{ color: phases[phase]?.color }}
                  key={phase}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {phases[phase]?.label}
                </motion.p>
                <motion.p
                  className="text-5xl font-black text-text-primary"
                  key={count}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {count}
                </motion.p>
                <p className="text-xs text-text-secondary mt-1 max-w-[120px] text-center">
                  {phases[phase]?.instruction}
                </p>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Cycle Progress */}
        <div className="flex gap-4 mt-10 z-10">
          {Array.from({ length: totalCycles }).map((_, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <motion.div
                className={`w-4 h-4 rounded-full transition-all duration-500 ${
                  i < cycles
                    ? "bg-gradient-to-br from-success to-emerald-400 shadow-lg shadow-success/30"
                    : i === cycles && isRunning
                    ? "bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30"
                    : "bg-surface-elevated border border-border"
                }`}
                animate={
                  i === cycles && isRunning ? { scale: [1, 1.2, 1] } : {}
                }
                transition={{ repeat: Infinity, duration: 1 }}
              />
              <span className="text-xs text-text-secondary mt-1">
                Cycle {i + 1}
              </span>
            </motion.div>
          ))}
        </div>

        <p className="text-sm text-text-secondary mt-4 z-10">
          {isRunning
            ? `${cycles + 1} of ${totalCycles} cycles`
            : `Complete ${totalCycles} breathing cycles to finish`}
        </p>
      </div>

      {/* Controls */}
      <div className="text-center py-6">
        {!isRunning ? (
          <motion.button
            onClick={startExercise}
            className="btn btn-primary px-10 py-4 text-lg rounded-2xl shadow-lg shadow-primary/30"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play size={24} className="mr-2" />
            Begin Session
          </motion.button>
        ) : (
          <motion.button
            onClick={stopExercise}
            className="btn px-10 py-4 text-lg rounded-2xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Pause size={24} className="mr-2" />
            End Session
          </motion.button>
        )}
      </div>
    </div>
  );
}
