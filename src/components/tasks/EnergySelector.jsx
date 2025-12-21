import { useState } from "react";
import { motion } from "framer-motion";
import {
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Sparkles,
} from "lucide-react";

const ENERGY_LEVELS = [
  {
    id: "low",
    label: "Low Energy",
    emoji: "🥱",
    color: "#94a3b8",
    icon: BatteryLow,
    description: "For when you're tired but still want to be productive",
    tasks: ["Simple sorting", "Reading", "Light organizing"],
  },
  {
    id: "medium",
    label: "Medium Energy",
    emoji: "😊",
    color: "#f59e0b",
    icon: BatteryMedium,
    description: "Good for most everyday tasks",
    tasks: ["Emails", "Planning", "Routine work"],
  },
  {
    id: "high",
    label: "High Energy",
    emoji: "⚡",
    color: "#22c55e",
    icon: BatteryFull,
    description: "Perfect for challenging or creative work",
    tasks: ["Deep work", "Problem solving", "Creative projects"],
  },
];

export default function EnergySelector({
  value,
  onChange,
  showSuggestions = false,
}) {
  const [hoveredLevel, setHoveredLevel] = useState(null);
  const currentLevel =
    ENERGY_LEVELS.find((l) => l.id === value) || ENERGY_LEVELS[1];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4" style={{ color: "var(--primary-500)" }} />
        <span
          className="text-sm font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          How's your energy right now?
        </span>
      </div>

      <div className="flex gap-2">
        {ENERGY_LEVELS.map((level) => {
          const Icon = level.icon;
          const isSelected = value === level.id;
          const isHovered = hoveredLevel === level.id;

          return (
            <motion.button
              key={level.id}
              onClick={() => onChange(level.id)}
              onMouseEnter={() => setHoveredLevel(level.id)}
              onMouseLeave={() => setHoveredLevel(null)}
              className={`flex-1 p-3 rounded-xl cursor-pointer transition-all ${
                isSelected ? "ring-2" : ""
              }`}
              style={{
                background: isSelected
                  ? `${level.color}20`
                  : "var(--bg-tertiary)",
                ringColor: level.color,
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl">{level.emoji}</span>
                <Icon
                  className="w-5 h-5"
                  style={{
                    color:
                      isSelected || isHovered
                        ? level.color
                        : "var(--text-tertiary)",
                  }}
                />
                <span
                  className="text-xs font-medium"
                  style={{
                    color: isSelected ? level.color : "var(--text-secondary)",
                  }}
                >
                  {level.label.split(" ")[0]}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Suggestions based on energy */}
      {showSuggestions && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-3 rounded-xl"
          style={{ background: `${currentLevel.color}10` }}
        >
          <p className="text-xs mb-2" style={{ color: currentLevel.color }}>
            {currentLevel.description}
          </p>
          <div className="flex flex-wrap gap-1">
            {currentLevel.tasks.map((task, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  background: `${currentLevel.color}20`,
                  color: currentLevel.color,
                }}
              >
                {task}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Export for use in filtering
export { ENERGY_LEVELS };
