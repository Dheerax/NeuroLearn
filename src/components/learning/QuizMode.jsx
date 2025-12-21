import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  ChevronRight,
  RotateCcw,
  Trophy,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import geminiAI from "../../services/geminiAI";
import confetti from "canvas-confetti";

export default function QuizMode({ topic, onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [inputTopic, setInputTopic] = useState(topic || "");

  useEffect(() => {
    if (topic) {
      generateQuiz(topic);
    }
  }, [topic]);

  const generateQuiz = async (topicToUse) => {
    if (!topicToUse.trim()) return;

    setIsLoading(true);
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setIsComplete(false);

    try {
      const quizQuestions = await geminiAI.generateQuiz(topicToUse);
      setQuestions(quizQuestions);
    } catch (error) {
      console.error("Failed to generate quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnswer = (index) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    setShowExplanation(true);

    if (index === currentQuestion?.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsComplete(true);
      // Celebration confetti
      const scorePercent =
        (score + (selectedAnswer === currentQuestion?.correctIndex ? 1 : 0)) /
        questions.length;
      if (scorePercent >= 0.7) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setIsComplete(false);
  };

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion?.correctIndex;
  const finalScore =
    score + (selectedAnswer === currentQuestion?.correctIndex ? 1 : 0);

  if (!topic && questions.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3
          className="text-lg font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Generate a Quiz
        </h3>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Enter a topic and I'll create a quiz to test your knowledge
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            generateQuiz(inputTopic);
          }}
          className="max-w-md mx-auto flex gap-2"
        >
          <input
            type="text"
            value={inputTopic}
            onChange={(e) => setInputTopic(e.target.value)}
            placeholder="e.g., World War 2, Chemistry basics..."
            className="flex-1 px-4 py-3 rounded-xl"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-light)",
            }}
          />
          <motion.button
            type="submit"
            disabled={!inputTopic.trim()}
            className="px-4 py-3 rounded-xl font-medium text-white cursor-pointer disabled:opacity-50"
            style={{ background: "var(--primary-500)" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles className="w-5 h-5" />
          </motion.button>
        </form>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <HelpCircle
            className="w-12 h-12 mx-auto"
            style={{ color: "var(--primary-500)" }}
          />
        </motion.div>
        <p className="mt-4" style={{ color: "var(--text-secondary)" }}>
          Generating quiz questions...
        </p>
      </div>
    );
  }

  if (isComplete) {
    const percentage = Math.round((finalScore / questions.length) * 100);
    const message =
      percentage >= 80
        ? "Excellent!"
        : percentage >= 60
        ? "Good job!"
        : "Keep practicing!";

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
          {message}
        </h2>

        <div className="text-5xl font-bold my-6 text-gradient">
          {finalScore}/{questions.length}
        </div>

        <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
          You scored {percentage}% on this quiz
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
            onClick={() => {
              setQuestions([]);
              setInputTopic("");
              onComplete?.();
            }}
            className="px-6 py-3 rounded-xl font-medium text-white flex items-center gap-2 cursor-pointer"
            style={{ background: "var(--primary-500)" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            New Quiz
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Question {currentIndex + 1} of {questions.length}
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
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question */}
      {currentQuestion && (
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
              <h3
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {currentQuestion.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectOption = index === currentQuestion.correctIndex;
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
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={showExplanation}
                    className="w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer disabled:cursor-default"
                    style={{
                      borderColor,
                      background: bgColor,
                    }}
                    whileHover={!showExplanation ? { scale: 1.01 } : {}}
                    whileTap={!showExplanation ? { scale: 0.99 } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                        style={{
                          background:
                            showResult && isCorrectOption
                              ? "var(--success)"
                              : showResult && isSelected && !isCorrectOption
                              ? "var(--error)"
                              : "var(--bg-secondary)",
                          color:
                            showResult &&
                            (isCorrectOption ||
                              (isSelected && !isCorrectOption))
                              ? "white"
                              : "var(--text-secondary)",
                        }}
                      >
                        {showResult && isCorrectOption ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : showResult && isSelected && !isCorrectOption ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          String.fromCharCode(65 + index)
                        )}
                      </div>
                      <span style={{ color: "var(--text-primary)" }}>
                        {option}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-6 p-4 rounded-xl"
                  style={{
                    background: isCorrect
                      ? "rgba(34, 197, 94, 0.1)"
                      : "rgba(239, 68, 68, 0.1)",
                    border: `1px solid ${
                      isCorrect ? "var(--success)" : "var(--error)"
                    }`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle
                        className="w-5 h-5 flex-shrink-0"
                        style={{ color: "var(--success)" }}
                      />
                    ) : (
                      <XCircle
                        className="w-5 h-5 flex-shrink-0"
                        style={{ color: "var(--error)" }}
                      />
                    )}
                    <div>
                      <p
                        className="font-medium mb-1"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {isCorrect ? "Correct!" : "Not quite right"}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next button */}
            {showExplanation && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleNext}
                className="w-full mt-6 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 cursor-pointer"
                style={{ background: "var(--primary-500)" }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {currentIndex < questions.length - 1 ? (
                  <>
                    Next Question
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    See Results
                    <Trophy className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
