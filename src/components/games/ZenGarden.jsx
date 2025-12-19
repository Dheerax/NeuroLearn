import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Leaf, Droplets, Wind, Sun, RotateCcw } from "lucide-react";

export default function ZenGarden({ onComplete, onBack }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(15);
  const [timeSpent, setTimeSpent] = useState(0);
  const [linesDrawn, setLinesDrawn] = useState(0);
  const [pattern, setPattern] = useState("rake");
  const lastPos = useRef({ x: 0, y: 0 });

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent((t) => {
        if (t >= 120) {
          onComplete?.(linesDrawn);
        }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [linesDrawn, onComplete]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Sand texture background
    ctx.fillStyle = "#E8DCC4";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Add subtle noise
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const shade = Math.random() * 20 - 10;
      ctx.fillStyle = `rgba(${200 + shade}, ${180 + shade}, ${
        150 + shade
      }, 0.5)`;
      ctx.fillRect(x, y, 1, 1);
    }

    // Add some stones
    const stones = [
      { x: rect.width * 0.2, y: rect.height * 0.3, size: 25 },
      { x: rect.width * 0.7, y: rect.height * 0.6, size: 35 },
      { x: rect.width * 0.5, y: rect.height * 0.8, size: 20 },
    ];

    stones.forEach((stone) => {
      const gradient = ctx.createRadialGradient(
        stone.x - 5,
        stone.y - 5,
        0,
        stone.x,
        stone.y,
        stone.size
      );
      gradient.addColorStop(0, "#8B7355");
      gradient.addColorStop(0.5, "#6B5344");
      gradient.addColorStop(1, "#4A3728");

      ctx.beginPath();
      ctx.ellipse(
        stone.x,
        stone.y,
        stone.size,
        stone.size * 0.8,
        0,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = gradient;
      ctx.fill();
    });
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const pos = getPos(e);
    lastPos.current = pos;
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e);

    // Calculate angle
    const dx = pos.x - lastPos.current.x;
    const dy = pos.y - lastPos.current.y;
    const angle = Math.atan2(dy, dx);

    if (pattern === "rake") {
      // Draw rake lines
      const numLines = 5;
      const spacing = brushSize / numLines;

      for (let i = 0; i < numLines; i++) {
        const offset = (i - numLines / 2) * spacing;
        const perpX = Math.cos(angle + Math.PI / 2) * offset;
        const perpY = Math.sin(angle + Math.PI / 2) * offset;

        ctx.beginPath();
        ctx.moveTo(lastPos.current.x + perpX, lastPos.current.y + perpY);
        ctx.lineTo(pos.x + perpX, pos.y + perpY);
        ctx.strokeStyle = "#C4B8A0";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();

        // Shadow line
        ctx.beginPath();
        ctx.moveTo(
          lastPos.current.x + perpX + 1,
          lastPos.current.y + perpY + 1
        );
        ctx.lineTo(pos.x + perpX + 1, pos.y + perpY + 1);
        ctx.strokeStyle = "#A89880";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    } else if (pattern === "circle") {
      // Draw circular pattern
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      ctx.strokeStyle = "#C4B8A0";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (pattern === "wave") {
      // Draw wave pattern
      const dist = Math.sqrt(dx * dx + dy * dy);
      const wave = Math.sin(dist * 0.2) * 5;

      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y + wave);
      ctx.lineTo(pos.x, pos.y + wave);
      ctx.strokeStyle = "#C4B8A0";
      ctx.lineWidth = brushSize / 3;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    lastPos.current = pos;
    setLinesDrawn((l) => l + 1);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    // Redraw background
    ctx.fillStyle = "#E8DCC4";
    ctx.fillRect(0, 0, rect.width, rect.height);

    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const shade = Math.random() * 20 - 10;
      ctx.fillStyle = `rgba(${200 + shade}, ${180 + shade}, ${
        150 + shade
      }, 0.5)`;
      ctx.fillRect(x, y, 1, 1);
    }

    const stones = [
      { x: rect.width * 0.2, y: rect.height * 0.3, size: 25 },
      { x: rect.width * 0.7, y: rect.height * 0.6, size: 35 },
      { x: rect.width * 0.5, y: rect.height * 0.8, size: 20 },
    ];

    stones.forEach((stone) => {
      const gradient = ctx.createRadialGradient(
        stone.x - 5,
        stone.y - 5,
        0,
        stone.x,
        stone.y,
        stone.size
      );
      gradient.addColorStop(0, "#8B7355");
      gradient.addColorStop(0.5, "#6B5344");
      gradient.addColorStop(1, "#4A3728");

      ctx.beginPath();
      ctx.ellipse(
        stone.x,
        stone.y,
        stone.size,
        stone.size * 0.8,
        0,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = gradient;
      ctx.fill();
    });

    setLinesDrawn(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const patterns = [
    { id: "rake", icon: "═══", label: "Rake" },
    { id: "circle", icon: "◯", label: "Circle" },
    { id: "wave", icon: "∿", label: "Wave" },
  ];

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

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface-elevated px-4 py-2 rounded-xl">
            <Sun className="w-4 h-4 text-warning" />
            <span className="font-medium">{formatTime(timeSpent)}</span>
          </div>
        </div>

        <motion.button
          onClick={clearCanvas}
          className="flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-primary/10 rounded-xl transition-colors"
          whileHover={{ rotate: -180 }}
          transition={{ duration: 0.3 }}
        >
          <RotateCcw size={16} />
          <span>Clear</span>
        </motion.button>
      </div>

      {/* Pattern Tools */}
      <div className="flex justify-center gap-2 mb-4">
        {patterns.map((p) => (
          <motion.button
            key={p.id}
            onClick={() => setPattern(p.id)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              pattern === p.id
                ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                : "bg-surface-elevated text-text-secondary hover:bg-primary/10"
            }`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-lg mr-2">{p.icon}</span>
            {p.label}
          </motion.button>
        ))}
      </div>

      {/* Brush Size */}
      <div className="flex items-center justify-center gap-4 mb-4 px-4">
        <span className="text-sm text-text-secondary">Brush:</span>
        <input
          type="range"
          min="5"
          max="30"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-32 accent-primary"
        />
        <div
          className="rounded-full bg-primary/50"
          style={{ width: brushSize, height: brushSize }}
        />
      </div>

      {/* Canvas */}
      <div className="flex-1 relative mx-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-900/30"
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair touch-none"
            style={{ backgroundColor: "#E8DCC4" }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        className="mt-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm text-text-secondary flex items-center justify-center gap-2">
          <Leaf className="w-4 h-4 text-success" />
          Drag to create peaceful patterns in the sand
        </p>
      </motion.div>
    </div>
  );
}
