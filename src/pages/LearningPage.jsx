import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Video,
  Headphones,
  FileText,
  Layers,
  Play,
  Clock,
  Star,
  CheckCircle,
  Lock,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const FORMATS = [
  {
    id: "visual",
    name: "Visual",
    icon: Video,
    color: "#3b82f6",
    description: "Videos & infographics",
  },
  {
    id: "audio",
    name: "Audio",
    icon: Headphones,
    color: "#8b5cf6",
    description: "Podcasts & narration",
  },
  {
    id: "text",
    name: "Text",
    icon: FileText,
    color: "#10b981",
    description: "Articles & guides",
  },
  {
    id: "mixed",
    name: "Mixed",
    icon: Layers,
    color: "#f59e0b",
    description: "All formats combined",
  },
];

const LESSONS = [
  {
    id: 1,
    title: "Understanding Your Brain",
    description: "Learn how your unique brain works",
    duration: 15,
    progress: 100,
    completed: true,
    icon: "🧠",
  },
  {
    id: 2,
    title: "Focus Techniques",
    description: "Master concentration strategies",
    duration: 20,
    progress: 60,
    completed: false,
    icon: "🎯",
  },
  {
    id: 3,
    title: "Task Management",
    description: "Break down complex tasks",
    duration: 25,
    progress: 0,
    completed: false,
    icon: "📋",
  },
  {
    id: 4,
    title: "Emotional Regulation",
    description: "Handle overwhelming feelings",
    duration: 18,
    progress: 0,
    completed: false,
    locked: true,
    icon: "💭",
  },
];

export default function LearningPage() {
  const { user } = useAuth();
  const [selectedFormat, setSelectedFormat] = useState(
    user?.preferences?.learningStyle || "visual"
  );
  const [selectedLesson, setSelectedLesson] = useState(null);

  const currentFormat = FORMATS.find((f) => f.id === selectedFormat);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1
          className="text-2xl font-display font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Learning Hub
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Choose your preferred learning style
        </p>
      </motion.div>

      {/* Format Selection */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {FORMATS.map((format, index) => (
          <motion.button
            key={format.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            onClick={() => setSelectedFormat(format.id)}
            className={`card text-center p-6 transition-all ${
              selectedFormat === format.id ? "ring-2" : ""
            }`}
            style={{
              ringColor: format.color,
              borderColor:
                selectedFormat === format.id
                  ? format.color
                  : "var(--border-light)",
            }}
            whileHover={{ y: -4 }}
          >
            <div
              className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: `${format.color}20` }}
            >
              <format.icon
                className="w-7 h-7"
                style={{ color: format.color }}
              />
            </div>
            <h3
              className="font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {format.name}
            </h3>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--text-tertiary)" }}
            >
              {format.description}
            </p>
          </motion.button>
        ))}
      </motion.div>

      {/* Current Format Banner */}
      <motion.div
        className="rounded-2xl p-6 flex items-center gap-4"
        style={{
          background: `linear-gradient(135deg, ${currentFormat?.color}20, ${currentFormat?.color}10)`,
          border: `1px solid ${currentFormat?.color}30`,
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: currentFormat?.color }}
        >
          {currentFormat && (
            <currentFormat.icon className="w-6 h-6 text-white" />
          )}
        </div>
        <div>
          <h3
            className="font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {currentFormat?.name} Learning Mode Active
          </h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Content will be optimized for{" "}
            {currentFormat?.description.toLowerCase()}
          </p>
        </div>
      </motion.div>

      {/* Lessons Grid */}
      <div>
        <h2
          className="text-lg font-semibold mb-4 flex items-center gap-2"
          style={{ color: "var(--text-primary)" }}
        >
          <BookOpen
            className="w-5 h-5"
            style={{ color: "var(--primary-500)" }}
          />
          Your Lessons
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {LESSONS.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`card group cursor-pointer ${
                lesson.locked ? "opacity-60" : ""
              }`}
              onClick={() => !lesson.locked && setSelectedLesson(lesson)}
              whileHover={!lesson.locked ? { y: -2 } : {}}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  {lesson.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className="font-semibold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {lesson.title}
                    </h3>
                    {lesson.completed && (
                      <CheckCircle
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "var(--success)" }}
                      />
                    )}
                    {lesson.locked && (
                      <Lock
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "var(--text-tertiary)" }}
                      />
                    )}
                  </div>
                  <p
                    className="text-sm truncate"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {lesson.description}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <span
                      className="flex items-center gap-1 text-xs"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      <Clock className="w-3 h-3" />
                      {lesson.duration} min
                    </span>

                    {lesson.progress > 0 && !lesson.completed && (
                      <div className="flex-1 max-w-[100px]">
                        <div className="progress-bar h-1.5">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${lesson.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {!lesson.locked && (
                  <ChevronRight
                    className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    style={{ color: "var(--text-tertiary)" }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lesson Preview */}
      {selectedLesson && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-semibold flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <span className="text-2xl">{selectedLesson.icon}</span>
              {selectedLesson.title}
            </h2>
            <button
              onClick={() => setSelectedLesson(null)}
              className="text-sm"
              style={{ color: "var(--text-tertiary)" }}
            >
              Close
            </button>
          </div>

          <div
            className="aspect-video rounded-xl flex items-center justify-center mb-4"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <motion.button
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "var(--gradient-primary)" }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Play className="w-7 h-7 text-white ml-1" />
            </motion.button>
          </div>

          <p style={{ color: "var(--text-secondary)" }}>
            {selectedLesson.description}. This lesson will help you understand
            key concepts and develop practical strategies for daily life.
          </p>
        </motion.div>
      )}

      {/* Progress Stats */}
      <motion.div
        className="grid grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="card text-center">
          <p className="text-3xl font-bold text-gradient">25%</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Course Progress
          </p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-gradient">1</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Lessons Done
          </p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-gradient">45m</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Learning Time
          </p>
        </div>
      </motion.div>
    </div>
  );
}
