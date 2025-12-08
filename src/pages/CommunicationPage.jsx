import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Lightbulb,
  Heart,
  Smile,
  Frown,
  Meh,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import { useGamification } from "../context/GamificationContext";

const EMOTIONS = [
  { emoji: "😊", name: "Happy", color: "#22c55e" },
  { emoji: "😢", name: "Sad", color: "#3b82f6" },
  { emoji: "😠", name: "Angry", color: "#ef4444" },
  { emoji: "😨", name: "Anxious", color: "#f59e0b" },
  { emoji: "😴", name: "Tired", color: "#8b5cf6" },
  { emoji: "🤔", name: "Confused", color: "#06b6d4" },
];

const SCENARIOS = [
  {
    id: 1,
    title: "Meeting New People",
    icon: "👋",
    difficulty: "Beginner",
    situation:
      "You're at a study group and someone new joins. They look nervous. What's a good way to help them feel welcome?",
    options: [
      {
        text: "Smile and say 'Hi! I'm [name], nice to meet you!'",
        correct: true,
        feedback: "Great! A warm greeting with your name helps break the ice.",
      },
      {
        text: "Wait for them to speak first",
        correct: false,
        feedback:
          "This could make them feel more nervous. Taking initiative is often appreciated.",
      },
      {
        text: "Continue with what you were doing",
        correct: false,
        feedback:
          "This might make them feel ignored. A small acknowledgment goes a long way.",
      },
    ],
  },
  {
    id: 2,
    title: "Asking for Help",
    icon: "🙋",
    difficulty: "Beginner",
    situation:
      "You're struggling with an assignment and the teacher is available. How do you approach them?",
    options: [
      {
        text: "Wait until class ends, hoping to figure it out",
        correct: false,
        feedback:
          "Waiting too long can increase stress. It's okay to ask for help!",
      },
      {
        text: "'Excuse me, could you help me with question 3?'",
        correct: true,
        feedback:
          "Perfect! Being specific about what you need makes it easier to get help.",
      },
      {
        text: "Give up on the assignment",
        correct: false,
        feedback: "Don't give up! Teachers are there to help you succeed.",
      },
    ],
  },
  {
    id: 3,
    title: "Handling Disagreements",
    icon: "🤝",
    difficulty: "Intermediate",
    situation:
      "A friend disagrees with your opinion on a topic. They're getting a bit loud. What do you do?",
    options: [
      {
        text: "Raise your voice to match theirs",
        correct: false,
        feedback:
          "Escalating rarely helps. Staying calm keeps the conversation productive.",
      },
      {
        text: "Walk away without a word",
        correct: false,
        feedback:
          "This might hurt their feelings. A brief explanation before stepping away is better.",
      },
      {
        text: "'I hear you. Let's talk about this calmly.'",
        correct: true,
        feedback:
          "Excellent! Acknowledging their feelings while setting a calm tone is a great skill.",
      },
    ],
  },
];

const TIPS = [
  {
    icon: "👀",
    title: "Eye Contact",
    tip: "It's okay if constant eye contact feels hard. Try looking at the nose or forehead area.",
  },
  {
    icon: "⏸️",
    title: "Take Pauses",
    tip: "It's perfectly fine to pause before answering. It shows you're thinking.",
  },
  {
    icon: "🔄",
    title: "Reciprocate",
    tip: "If someone shares something, share something similar back to build connection.",
  },
  {
    icon: "❓",
    title: "Ask Questions",
    tip: "Asking questions shows you're interested and keeps the conversation going.",
  },
];

export default function CommunicationPage() {
  const { addXP } = useGamification();
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completedScenarios, setCompletedScenarios] = useState([]);
  const [currentEmotion, setCurrentEmotion] = useState(null);

  const handleOptionSelect = (option, index) => {
    setSelectedOption(index);
    setShowFeedback(true);

    if (option.correct && !completedScenarios.includes(selectedScenario.id)) {
      setCompletedScenarios([...completedScenarios, selectedScenario.id]);
      addXP(20, "scenario_completed");
    }
  };

  const resetScenario = () => {
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const nextScenario = () => {
    const currentIndex = SCENARIOS.findIndex(
      (s) => s.id === selectedScenario.id
    );
    const nextIndex = (currentIndex + 1) % SCENARIOS.length;
    setSelectedScenario(SCENARIOS[nextIndex]);
    resetScenario();
  };

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
          Social Skills Practice
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Practice everyday social situations in a safe space
        </p>
      </motion.div>

      {/* Emotion Check-in */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2
          className="font-semibold mb-4 flex items-center gap-2"
          style={{ color: "var(--text-primary)" }}
        >
          <Heart className="w-5 h-5" style={{ color: "#ef4444" }} />
          How are you feeling right now?
        </h2>
        <div className="flex gap-3 flex-wrap justify-center">
          {EMOTIONS.map((emotion) => (
            <motion.button
              key={emotion.name}
              onClick={() => setCurrentEmotion(emotion.name)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                currentEmotion === emotion.name ? "ring-2" : ""
              }`}
              style={{
                background:
                  currentEmotion === emotion.name
                    ? `${emotion.color}20`
                    : "var(--bg-tertiary)",
                ringColor: emotion.color,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-3xl mb-1">{emotion.emoji}</span>
              <span
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {emotion.name}
              </span>
            </motion.button>
          ))}
        </div>
        {currentEmotion && (
          <motion.p
            className="text-center mt-4 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ color: "var(--text-tertiary)" }}
          >
            It's okay to feel {currentEmotion.toLowerCase()}. Let's practice at
            your own pace.
          </motion.p>
        )}
      </motion.div>

      {/* Scenarios or Active Practice */}
      {!selectedScenario ? (
        <>
          {/* Scenario Selection */}
          <div>
            <h2
              className="text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <MessageCircle
                className="w-5 h-5"
                style={{ color: "var(--primary-500)" }}
              />
              Practice Scenarios
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              {SCENARIOS.map((scenario, index) => (
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="card group cursor-pointer"
                  onClick={() => setSelectedScenario(scenario)}
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: "var(--bg-tertiary)" }}
                    >
                      {scenario.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className="font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {scenario.title}
                        </h3>
                        {completedScenarios.includes(scenario.id) && (
                          <Check
                            className="w-4 h-4"
                            style={{ color: "var(--success)" }}
                          />
                        )}
                      </div>
                      <span className="badge badge-primary text-xs mt-1">
                        {scenario.difficulty}
                      </span>
                    </div>
                    <ChevronRight
                      className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: "var(--text-tertiary)" }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2
              className="text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <Lightbulb
                className="w-5 h-5"
                style={{ color: "var(--warning)" }}
              />
              Quick Tips
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {TIPS.map((tip, index) => (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="card flex items-start gap-3"
                >
                  <span className="text-2xl">{tip.icon}</span>
                  <div>
                    <h3
                      className="font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {tip.title}
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {tip.tip}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      ) : (
        /* Active Scenario */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedScenario.icon}</span>
              <div>
                <h2
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {selectedScenario.title}
                </h2>
                <span className="badge badge-primary text-xs">
                  {selectedScenario.difficulty}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedScenario(null);
                resetScenario();
              }}
              className="btn-ghost"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className="p-4 rounded-xl mb-6"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <p style={{ color: "var(--text-primary)" }}>
              {selectedScenario.situation}
            </p>
          </div>

          <div className="space-y-3">
            {selectedScenario.options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() =>
                  !showFeedback && handleOptionSelect(option, index)
                }
                disabled={showFeedback}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all`}
                style={{
                  borderColor: showFeedback
                    ? selectedOption === index
                      ? option.correct
                        ? "var(--success)"
                        : "var(--error)"
                      : "var(--border-light)"
                    : "var(--border-light)",
                  background:
                    showFeedback && selectedOption === index
                      ? option.correct
                        ? "rgba(16, 185, 129, 0.1)"
                        : "rgba(239, 68, 68, 0.1)"
                      : "transparent",
                }}
                whileHover={!showFeedback ? { scale: 1.01 } : {}}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                    style={{
                      background: "var(--bg-tertiary)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span style={{ color: "var(--text-primary)" }}>
                    {option.text}
                  </span>
                  {showFeedback &&
                    selectedOption === index &&
                    (option.correct ? (
                      <ThumbsUp
                        className="w-5 h-5 ml-auto"
                        style={{ color: "var(--success)" }}
                      />
                    ) : (
                      <ThumbsDown
                        className="w-5 h-5 ml-auto"
                        style={{ color: "var(--error)" }}
                      />
                    ))}
                </div>
              </motion.button>
            ))}
          </div>

          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-6 p-4 rounded-xl"
                style={{
                  background: selectedScenario.options[selectedOption].correct
                    ? "rgba(16, 185, 129, 0.1)"
                    : "rgba(239, 68, 68, 0.1)",
                }}
              >
                <p style={{ color: "var(--text-primary)" }}>
                  {selectedScenario.options[selectedOption].feedback}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {showFeedback && (
            <div className="flex gap-3 mt-6">
              <motion.button
                onClick={resetScenario}
                className="btn-secondary flex-1"
                whileHover={{ scale: 1.01 }}
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </motion.button>
              <motion.button
                onClick={nextScenario}
                className="btn-primary flex-1"
                whileHover={{ scale: 1.01 }}
              >
                Next Scenario
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </motion.div>
      )}

      {/* Progress */}
      <motion.div
        className="flex items-center justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
          Completed: {completedScenarios.length}/{SCENARIOS.length} scenarios
        </span>
      </motion.div>
    </div>
  );
}
