import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Check,
  X,
  ChevronRight,
  RotateCcw,
  Trophy,
  Sparkles,
  Eye,
  Brain,
} from "lucide-react";
import geminiAI from "../../services/geminiAI";

const EMOTION_SCENARIOS = [
  {
    id: 1,
    context:
      "Your friend just got a promotion at work. They're smiling widely, talking fast, and can't stop mentioning all the new things they'll be able to do.",
    correctEmotion: "Excited",
    options: ["Nervous", "Excited", "Confused", "Angry"],
  },
  {
    id: 2,
    context:
      "Someone just found out their pet is sick. They're speaking quietly, avoiding eye contact, and seem distracted during the conversation.",
    correctEmotion: "Sad",
    options: ["Sad", "Tired", "Bored", "Calm"],
  },
  {
    id: 3,
    context:
      "A coworker was promised a day off but then was told they need to work. They're clenching their jaw, speaking in short sentences, and their voice is getting louder.",
    correctEmotion: "Angry",
    options: ["Surprised", "Anxious", "Angry", "Disappointed"],
  },
  {
    id: 4,
    context:
      "Someone is about to give their first big presentation. They keep fidgeting, checking their notes repeatedly, and asking if the slides look okay.",
    correctEmotion: "Anxious",
    options: ["Excited", "Anxious", "Proud", "Bored"],
  },
  {
    id: 5,
    context:
      "A student just received an unexpected A on a test they thought they failed. Their eyes are wide, mouth is open, and they keep saying 'really?!'",
    correctEmotion: "Surprised",
    options: ["Confused", "Happy", "Surprised", "Relieved"],
  },
  {
    id: 6,
    context:
      "Someone's close friend just moved to another country. They're sighing often, looking at old photos, and mentioning memories they shared.",
    correctEmotion: "Nostalgic",
    options: ["Sad", "Nostalgic", "Lonely", "Depressed"],
  },
];

export default function EmotionRecognition({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const currentScenario = EMOTION_SCENARIOS[currentIndex];
  const isCorrect = selectedAnswer === currentScenario?.correctEmotion;

  const handleSelect = async (emotion) => {
    if (selectedAnswer) return;

    setSelectedAnswer(emotion);
    setShowExplanation(true);

    if (emotion === currentScenario.correctEmotion) {
      setScore((prev) => prev + 1);
    }

    // Get AI analysis
    setIsAnalyzing(true);
    try {
      const analysis = await geminiAI.analyzeEmotion(currentScenario.context);
      setAiExplanation(analysis);
    } catch (error) {
      console.error("Failed to get AI analysis:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < EMOTION_SCENARIOS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setAiExplanation(null);
    } else {
      setIsComplete(true);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setIsComplete(false);
    setAiExplanation(null);
  };

  if (isComplete) {
    const percentage = Math.round((score / EMOTION_SCENARIOS.length) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <Trophy
            className="w-20 h-20 mx-auto mb-4"
            style={{
              color:
                percentage >= 80
                  ? "#f59e0b"
                  : percentage >= 60
                  ? "#8b5cf6"
                  : "#3b82f6",
            }}
          />
        </motion.div>

        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          {percentage >= 80
            ? "Excellent!"
            : percentage >= 60
            ? "Good job!"
            : "Keep practicing!"}
        </h2>

        <div className="text-5xl font-bold my-6 text-gradient">
          {score}/{EMOTION_SCENARIOS.length}
        </div>

        <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
          You correctly identified {percentage}% of emotions
        </p>

        <div className="flex gap-3 justify-center">
          <motion.button
            onClick={handleRetry}
            className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 cursor-pointer"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-secondary)",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </motion.button>

          <motion.button
            onClick={() => onComplete?.()}
            className="px-6 py-3 rounded-xl font-medium text-white flex items-center gap-2 cursor-pointer"
            style={{ background: "var(--primary-500)" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Eye className="w-6 h-6" style={{ color: "var(--primary-500)" }} />
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Emotion Recognition
          </h2>
        </div>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Read the scenario and identify the emotion
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Scenario {currentIndex + 1} of {EMOTION_SCENARIOS.length}
        </span>
        <span
          className="text-sm font-medium"
          style={{ color: "var(--success)" }}
        >
          Score: {score}
        </span>
      </div>

      <div
        className="w-full h-2 rounded-full mb-6"
        style={{ background: "var(--bg-tertiary)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: "var(--primary-500)" }}
          initial={{ width: 0 }}
          animate={{
            width: `${((currentIndex + 1) / EMOTION_SCENARIOS.length) * 100}%`,
          }}
        />
      </div>

      {/* Scenario */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <div
            className="p-6 rounded-2xl mb-6"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <p
              className="text-lg leading-relaxed"
              style={{ color: "var(--text-primary)" }}
            >
              "{currentScenario.context}"
            </p>
          </div>

          {/* Options */}
          <p
            className="text-sm font-medium mb-3"
            style={{ color: "var(--text-secondary)" }}
          >
            What is this person likely feeling?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {currentScenario.options.map((emotion) => {
              const isSelected = selectedAnswer === emotion;
              const isCorrectOption =
                emotion === currentScenario.correctEmotion;
              const showResult = showExplanation;

              let borderColor = "var(--border-light)";
              let bgColor = "transparent";

              if (showResult) {
                if (isCorrectOption) {
                  borderColor = "var(--success)";
                  bgColor = "rgba(34, 197, 94, 0.1)";
                } else if (isSelected && !isCorrectOption) {
                  borderColor = "var(--error)";
                  bgColor = "rgba(239, 68, 68, 0.1)";
                }
              }

              return (
                <motion.button
                  key={emotion}
                  onClick={() => handleSelect(emotion)}
                  disabled={showExplanation}
                  className="p-4 rounded-xl border-2 transition-all cursor-pointer disabled:cursor-default text-center"
                  style={{ borderColor, background: bgColor }}
                  whileHover={!showExplanation ? { scale: 1.02 } : {}}
                  whileTap={!showExplanation ? { scale: 0.98 } : {}}
                >
                  <span
                    className="font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {emotion}
                  </span>
                  {showResult && isCorrectOption && (
                    <Check
                      className="w-4 h-4 inline ml-2"
                      style={{ color: "var(--success)" }}
                    />
                  )}
                  {showResult && isSelected && !isCorrectOption && (
                    <X
                      className="w-4 h-4 inline ml-2"
                      style={{ color: "var(--error)" }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* AI Explanation */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-6"
              >
                <div
                  className="p-4 rounded-xl mb-4"
                  style={{
                    background: isCorrect
                      ? "rgba(34, 197, 94, 0.1)"
                      : "rgba(239, 68, 68, 0.1)",
                    border: `1px solid ${
                      isCorrect ? "var(--success)" : "var(--error)"
                    }`,
                  }}
                >
                  <p
                    className="font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {isCorrect
                      ? "✓ Correct!"
                      : `✗ The answer was: ${currentScenario.correctEmotion}`}
                  </p>
                </div>

                {isAnalyzing ? (
                  <div
                    className="flex items-center gap-2 p-4"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <Brain className="w-5 h-5 animate-pulse" />
                    Analyzing emotional cues...
                  </div>
                ) : (
                  aiExplanation && (
                    <div
                      className="p-4 rounded-xl"
                      style={{ background: "var(--bg-tertiary)" }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles
                          className="w-5 h-5"
                          style={{ color: "var(--primary-500)" }}
                        />
                        <h4
                          className="font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          AI Analysis
                        </h4>
                      </div>
                      <p
                        className="text-sm mb-3"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {aiExplanation.explanation}
                      </p>
                      {aiExplanation.cues && (
                        <div>
                          <p
                            className="text-xs font-medium mb-2"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            Key emotional cues:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {aiExplanation.cues.map((cue, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 rounded-full text-xs"
                                style={{
                                  background: "var(--primary-500)20",
                                  color: "var(--primary-500)",
                                }}
                              >
                                {cue}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}

                {/* Next button */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handleNext}
                  className="w-full mt-4 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 cursor-pointer"
                  style={{ background: "var(--primary-500)" }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {currentIndex < EMOTION_SCENARIOS.length - 1 ? (
                    <>
                      Next Scenario
                      <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      See Results
                      <Award className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
