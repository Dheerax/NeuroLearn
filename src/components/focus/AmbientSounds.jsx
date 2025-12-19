import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Volume2,
  VolumeX,
  CloudRain,
  Waves,
  Wind,
  Coffee,
  Flame,
  Bird,
  Music,
} from "lucide-react";
import { useFocus } from "../../context/FocusContext";

// LOCAL sound files served from /public/sounds/
const SOUNDS = [
  {
    id: "rain",
    name: "Rain",
    icon: CloudRain,
    color: "#3b82f6",
    file: "/sounds/rain.mp3",
  },
  {
    id: "waves",
    name: "Ocean",
    icon: Waves,
    color: "#06b6d4",
    file: "/sounds/waves.mp3",
  },
  {
    id: "fire",
    name: "Fire",
    icon: Flame,
    color: "#f97316",
    file: "/sounds/fire.mp3",
  },
  {
    id: "wind",
    name: "Wind",
    icon: Wind,
    color: "#94a3b8",
    file: "/sounds/wind.mp3",
  },
  {
    id: "cafe",
    name: "Café",
    icon: Coffee,
    color: "#a78bfa",
    file: "/sounds/cafe.mp3",
  },
];

const PRESETS = [
  { name: "Zen", sounds: ["rain"], icon: "🧘" },
  { name: "Study", sounds: ["fire"], icon: "📚" },
  { name: "Focus", sounds: ["rain", "fire"], icon: "🎯" },
  { name: "Cozy", sounds: ["cafe"], icon: "☕" },
];

export default function AmbientSounds() {
  const { activeSounds, toggleSound, soundVolumes, setSoundVolume } =
    useFocus();
  const audioRefs = useRef({});
  const [isMuted, setIsMuted] = useState(false);

  // Initialize audio elements on mount
  useEffect(() => {
    SOUNDS.forEach((sound) => {
      const audio = new Audio(sound.file);
      audio.loop = true;
      audio.volume = 0.5;
      audio.preload = "auto";
      audioRefs.current[sound.id] = audio;
    });

    return () => {
      // Cleanup
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
    };
  }, []);

  // Handle play/pause based on activeSounds
  useEffect(() => {
    SOUNDS.forEach((sound) => {
      const audio = audioRefs.current[sound.id];
      if (!audio) return;

      const isActive = activeSounds.includes(sound.id);
      const volume = isMuted ? 0 : soundVolumes[sound.id] || 0.5;
      audio.volume = volume;

      if (isActive && audio.paused) {
        audio.play().catch(console.error);
      } else if (!isActive && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }, [activeSounds, soundVolumes, isMuted]);

  const handleToggleSound = (soundId) => {
    toggleSound(soundId);
    if (!soundVolumes[soundId]) {
      setSoundVolume(soundId, 0.5);
    }
  };

  const handleMuteAll = () => {
    setIsMuted(!isMuted);
  };

  const applyPreset = (preset) => {
    // Clear sounds not in preset
    activeSounds.forEach((sound) => {
      if (!preset.sounds.includes(sound)) {
        toggleSound(sound);
      }
    });
    // Add preset sounds
    preset.sounds.forEach((sound) => {
      if (!activeSounds.includes(sound)) {
        toggleSound(sound);
        if (!soundVolumes[sound]) {
          setSoundVolume(sound, 0.5);
        }
      }
    });
  };

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="font-semibold flex items-center gap-2"
          style={{ color: "var(--text-primary)" }}
        >
          <Music className="w-5 h-5" style={{ color: "var(--primary-500)" }} />
          Ambient Sounds
        </h3>
        <div className="flex items-center gap-2">
          {activeSounds.length > 0 && (
            <>
              <button
                onClick={handleMuteAll}
                className="p-1.5 rounded-lg cursor-pointer transition-all hover:opacity-80"
                style={{ background: "var(--bg-tertiary)" }}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX
                    className="w-4 h-4"
                    style={{ color: "var(--error)" }}
                  />
                ) : (
                  <Volume2
                    className="w-4 h-4"
                    style={{ color: "var(--text-secondary)" }}
                  />
                )}
              </button>
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{ background: "var(--primary-500)", color: "white" }}
              >
                {activeSounds.length} playing
              </span>
            </>
          )}
        </div>
      </div>

      {/* Presets */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {PRESETS.map((preset) => {
          const isActive =
            preset.sounds.every((s) => activeSounds.includes(s)) &&
            preset.sounds.length === activeSounds.length;
          return (
            <motion.button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap cursor-pointer transition-all"
              style={{
                background: isActive
                  ? "var(--primary-500)"
                  : "var(--bg-tertiary)",
                color: isActive ? "white" : "var(--text-secondary)",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{preset.icon}</span>
              <span>{preset.name}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Sound buttons */}
      <div className="grid grid-cols-3 gap-2">
        {SOUNDS.map((sound) => {
          const isActive = activeSounds.includes(sound.id);
          const Icon = sound.icon;

          return (
            <motion.button
              key={sound.id}
              onClick={() => handleToggleSound(sound.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl cursor-pointer transition-all ${
                isActive ? "ring-2" : ""
              }`}
              style={{
                background: isActive
                  ? `${sound.color}20`
                  : "var(--bg-tertiary)",
                ringColor: sound.color,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive && !isMuted ? "animate-pulse" : ""
                }`}
                style={{
                  color: isActive ? sound.color : "var(--text-tertiary)",
                }}
              />
              <span
                className="text-xs"
                style={{
                  color: isActive ? sound.color : "var(--text-tertiary)",
                }}
              >
                {sound.name}
              </span>

              {/* Volume bar */}
              {isActive && (
                <motion.div
                  className="w-full h-1 rounded-full mt-1 overflow-hidden"
                  style={{ background: "var(--border-light)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      background: isMuted
                        ? "var(--text-tertiary)"
                        : sound.color,
                      width: `${(soundVolumes[sound.id] || 0.5) * 100}%`,
                    }}
                  />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Volume sliders */}
      {activeSounds.length > 0 && (
        <motion.div
          className="mt-4 space-y-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Adjust volume
          </p>
          {activeSounds.map((soundId) => {
            const sound = SOUNDS.find((s) => s.id === soundId);
            if (!sound) return null;
            const Icon = sound.icon;

            return (
              <div key={soundId} className="flex items-center gap-3">
                <Icon className="w-4 h-4" style={{ color: sound.color }} />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolumes[soundId] || 0.5}
                  onChange={(e) =>
                    setSoundVolume(soundId, parseFloat(e.target.value))
                  }
                  className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${sound.color} 0%, ${
                      sound.color
                    } ${
                      (soundVolumes[soundId] || 0.5) * 100
                    }%, var(--border-light) ${
                      (soundVolumes[soundId] || 0.5) * 100
                    }%, var(--border-light) 100%)`,
                  }}
                />
                <span
                  className="text-xs w-8"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {Math.round((soundVolumes[soundId] || 0.5) * 100)}%
                </span>
              </div>
            );
          })}
        </motion.div>
      )}

      <p className="text-xs mt-4" style={{ color: "var(--text-tertiary)" }}>
        🎧 Click any sound to play. Mix multiple sounds together!
      </p>
    </motion.div>
  );
}
