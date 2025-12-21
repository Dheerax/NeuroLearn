import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  Lightbulb,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import geminiAI from "../../services/geminiAI";

export default function FlashcardSystem({ topic, onComplete }) {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [masteredCards, setMasteredCards] = useState([]);
  const [inputTopic, setInputTopic] = useState(topic || "");

  useEffect(() => {
    if (topic) {
      generateCards(topic);
    }
  }, [topic]);

  const generateCards = async (topicToUse) => {
    if (!topicToUse.trim()) return;

    setIsLoading(true);
    setCards([]);
    setCurrentIndex(0);
    setMasteredCards([]);

    try {
      const flashcards = await geminiAI.generateFlashcards(topicToUse);
      setCards(flashcards);
    } catch (error) {
      console.error("Failed to generate flashcards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setShowHint(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 200);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setShowHint(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 200);
  };

  const handleMastered = () => {
    if (!masteredCards.includes(currentIndex)) {
      setMasteredCards((prev) => [...prev, currentIndex]);
    }
    handleNext();
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setMasteredCards([]);
  };

  const currentCard = cards[currentIndex];
  const isMastered = masteredCards.includes(currentIndex);
  const progress =
    cards.length > 0
      ? ((masteredCards.length / cards.length) * 100).toFixed(0)
      : 0;

  if (!topic && cards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎴</div>
        <h3
          className="text-lg font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Generate Flashcards
        </h3>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Enter a topic and I'll create flashcards for you
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            generateCards(inputTopic);
          }}
          className="max-w-md mx-auto flex gap-2"
        >
          <input
            type="text"
            value={inputTopic}
            onChange={(e) => setInputTopic(e.target.value)}
            placeholder="e.g., Solar System, French verbs..."
            className="flex-1 px-4 py-3 rounded-xl"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-light)",
            }}
          />
          <motion.button
            type="submit"
            disabled={!inputTopic.trim() || isLoading}
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
          <Layers
            className="w-12 h-12 mx-auto"
            style={{ color: "var(--primary-500)" }}
          />
        </motion.div>
        <p className="mt-4" style={{ color: "var(--text-secondary)" }}>
          Generating flashcards...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Card {currentIndex + 1} of {cards.length}
        </span>
        <span
          className="text-sm font-medium"
          style={{ color: "var(--success)" }}
        >
          {masteredCards.length} mastered ({progress}%)
        </span>
      </div>

      <div
        className="w-full h-2 rounded-full mb-6"
        style={{ background: "var(--bg-tertiary)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: "var(--success)" }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      {/* Flashcard */}
      {currentCard && (
        <motion.div
          key={currentIndex}
          className="relative cursor-pointer"
          style={{ perspective: "1000px" }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <motion.div
            className="relative w-full aspect-[3/2] rounded-2xl p-6"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.4 }}
            style={{
              transformStyle: "preserve-3d",
              background: isMastered
                ? "linear-gradient(135deg, #22c55e20, #22c55e10)"
                : isFlipped
                ? "linear-gradient(135deg, #8b5cf620, #8b5cf610)"
                : "linear-gradient(135deg, #3b82f620, #3b82f610)",
              border: isMastered
                ? "2px solid #22c55e"
                : "1px solid var(--border-light)",
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-2xl"
              style={{ backfaceVisibility: "hidden" }}
            >
              <p
                className="text-sm mb-4"
                style={{ color: "var(--text-tertiary)" }}
              >
                Question
              </p>
              <h3
                className="text-xl font-bold text-center"
                style={{ color: "var(--text-primary)" }}
              >
                {currentCard.front}
              </h3>

              {showHint && currentCard.hint && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-sm px-3 py-2 rounded-lg"
                  style={{
                    background: "var(--warning)20",
                    color: "var(--warning)",
                  }}
                >
                  💡 {currentCard.hint}
                </motion.p>
              )}

              <p
                className="absolute bottom-4 text-xs"
                style={{ color: "var(--text-tertiary)" }}
              >
                Click to flip
              </p>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-2xl"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <p
                className="text-sm mb-4"
                style={{ color: "var(--text-tertiary)" }}
              >
                Answer
              </p>
              <p
                className="text-lg text-center"
                style={{ color: "var(--text-primary)" }}
              >
                {currentCard.back}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <motion.button
          onClick={handlePrev}
          className="p-3 rounded-xl cursor-pointer"
          style={{ background: "var(--bg-tertiary)" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft
            className="w-5 h-5"
            style={{ color: "var(--text-secondary)" }}
          />
        </motion.button>

        {!isFlipped && currentCard?.hint && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              setShowHint(!showHint);
            }}
            className="px-4 py-3 rounded-xl cursor-pointer flex items-center gap-2"
            style={{ background: "var(--bg-tertiary)" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Lightbulb
              className="w-4 h-4"
              style={{ color: "var(--warning)" }}
            />
            <span style={{ color: "var(--text-secondary)" }}>Hint</span>
          </motion.button>
        )}

        {isFlipped && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              handleMastered();
            }}
            className="px-4 py-3 rounded-xl cursor-pointer flex items-center gap-2 text-white"
            style={{ background: "var(--success)" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Check className="w-4 h-4" />
            Got it!
          </motion.button>
        )}

        <motion.button
          onClick={handleNext}
          className="p-3 rounded-xl cursor-pointer"
          style={{ background: "var(--bg-tertiary)" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight
            className="w-5 h-5"
            style={{ color: "var(--text-secondary)" }}
          />
        </motion.button>
      </div>

      {/* Reset button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 text-sm cursor-pointer hover:opacity-80"
          style={{ color: "var(--text-tertiary)" }}
        >
          <RefreshCw className="w-4 h-4" />
          Start over
        </button>
      </div>

      {/* Completion message */}
      <AnimatePresence>
        {masteredCards.length === cards.length && cards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => onComplete?.()}
          >
            <div className="absolute inset-0 bg-black/50" />
            <motion.div
              className="relative text-center p-8 rounded-2xl"
              style={{ background: "var(--bg-secondary)" }}
            >
              <div className="text-6xl mb-4">🎉</div>
              <h3
                className="text-2xl font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                All Cards Mastered!
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Great job learning about this topic!
              </p>
              <motion.button
                onClick={() => {
                  handleReset();
                  onComplete?.();
                }}
                className="mt-6 px-6 py-3 rounded-xl text-white cursor-pointer"
                style={{ background: "var(--primary-500)" }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue Learning
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
