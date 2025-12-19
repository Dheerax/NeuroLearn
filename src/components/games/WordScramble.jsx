import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  RotateCcw,
  Star,
  Trophy,
  Sparkles,
  Check,
  X,
} from "lucide-react";

const wordList = [
  { word: "FOCUS", hint: "Pay attention" },
  { word: "CALM", hint: "Peaceful state" },
  { word: "BRAIN", hint: "Think with this" },
  { word: "LEARN", hint: "Gain knowledge" },
  { word: "THINK", hint: "Use your mind" },
  { word: "SMART", hint: "Intelligent" },
  { word: "PEACE", hint: "No conflict" },
  { word: "HAPPY", hint: "Feeling joy" },
  { word: "DREAM", hint: "Night visions" },
  { word: "SHINE", hint: "Emit light" },
];

export default function WordScramble({ onComplete, onBack }) {
  const [currentWord, setCurrentWord] = useState(null);
  const [scrambled, setScrambled] = useState([]);
  const [selected, setSelected] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [usedWords, setUsedWords] = useState([]);

  const scrambleWord = (word) => {
    const letters = word.split("");
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.map((letter, index) => ({ letter, id: index, used: false }));
  };

  const newWord = useCallback(() => {
    const available = wordList.filter((w) => !usedWords.includes(w.word));
    if (available.length === 0) {
      setUsedWords([]);
      return;
    }
    const wordData = available[Math.floor(Math.random() * available.length)];
    setCurrentWord(wordData);
    setScrambled(scrambleWord(wordData.word));
    setSelected([]);
    setFeedback(null);
  }, [usedWords]);

  useEffect(() => {
    newWord();
  }, []);

  const handleLetterClick = (item) => {
    if (item.used) return;

    setScrambled((prev) =>
      prev.map((l) => (l.id === item.id ? { ...l, used: true } : l))
    );
    setSelected((prev) => [...prev, item]);
  };

  const handleSelectedClick = (item, index) => {
    setScrambled((prev) =>
      prev.map((l) => (l.id === item.id ? { ...l, used: false } : l))
    );
    setSelected((prev) => prev.filter((_, i) => i !== index));
  };

  const checkAnswer = () => {
    const answer = selected.map((s) => s.letter).join("");
    if (answer === currentWord.word) {
      const points = 100 + streak * 20;
      setScore((s) => s + points);
      setStreak((s) => s + 1);
      setWordsCompleted((w) => w + 1);
      setFeedback("correct");
      setUsedWords((prev) => [...prev, currentWord.word]);

      if (wordsCompleted + 1 >= 5) {
        onComplete?.(score + points);
      }

      setTimeout(() => newWord(), 1500);
    } else {
      setFeedback("wrong");
      setStreak(0);
      setTimeout(() => {
        setFeedback(null);
        setScrambled((prev) => prev.map((l) => ({ ...l, used: false })));
        setSelected([]);
      }, 1000);
    }
  };

  const resetWord = () => {
    setScrambled((prev) => prev.map((l) => ({ ...l, used: false })));
    setSelected([]);
    setFeedback(null);
  };

  useEffect(() => {
    if (selected.length === currentWord?.word.length && !feedback) {
      checkAnswer();
    }
  }, [selected.length, currentWord?.word.length, feedback]);

  if (!currentWord) return null;

  return (
    <div className="min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-2">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors"
          whileHover={{ x: -3 }}
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </motion.button>

        <div className="flex items-center gap-4">
          <motion.div
            className="flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 px-4 py-2 rounded-xl border border-primary/30"
            key={score}
            animate={{ scale: [1, 1.05, 1] }}
          >
            <Star className="w-4 h-4 text-warning" />
            <span className="font-bold">{score}</span>
          </motion.div>

          {streak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-xl text-sm font-bold"
            >
              🔥 {streak}
            </motion.div>
          )}
        </div>

        <motion.button
          onClick={resetWord}
          className="flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-primary/10 rounded-xl transition-colors"
          whileHover={{ rotate: -180 }}
          transition={{ duration: 0.3 }}
        >
          <RotateCcw size={16} />
        </motion.button>
      </div>

      {/* Progress */}
      <div className="mb-6 px-2">
        <div className="flex gap-2 justify-center">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className={`w-10 h-2 rounded-full ${
                i < wordsCompleted
                  ? "bg-gradient-to-r from-success to-emerald-400"
                  : "bg-surface-elevated"
              }`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </div>
        <p className="text-center text-xs text-text-secondary mt-2">
          {wordsCompleted}/5 words
        </p>
      </div>

      {/* Hint */}
      <motion.div
        className="text-center mb-8"
        key={currentWord.hint}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-text-secondary text-sm">Hint:</p>
        <p className="text-lg font-medium text-primary">{currentWord.hint}</p>
      </motion.div>

      {/* Answer Area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Selected Letters */}
        <div className="flex gap-2 mb-8 min-h-[70px]">
          {currentWord.word.split("").map((_, index) => (
            <motion.button
              key={index}
              onClick={() =>
                selected[index] && handleSelectedClick(selected[index], index)
              }
              className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all ${
                selected[index]
                  ? feedback === "correct"
                    ? "bg-gradient-to-br from-success to-emerald-400 text-white shadow-lg shadow-success/30"
                    : feedback === "wrong"
                    ? "bg-gradient-to-br from-error to-red-400 text-white shadow-lg shadow-error/30"
                    : "bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30 cursor-pointer hover:scale-105"
                  : "bg-surface-elevated border-2 border-dashed border-border"
              }`}
              animate={selected[index] ? { scale: [0.8, 1.1, 1] } : {}}
            >
              {selected[index]?.letter || ""}
            </motion.button>
          ))}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl mb-6 ${
                feedback === "correct"
                  ? "bg-success/20 text-success"
                  : "bg-error/20 text-error"
              }`}
            >
              {feedback === "correct" ? (
                <>
                  <Check className="w-5 h-5" />
                  <span className="font-bold">
                    Correct! +{100 + (streak - 1) * 20}
                  </span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5" />
                  <span className="font-bold">Try again!</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrambled Letters */}
        <div className="flex gap-3 flex-wrap justify-center max-w-md">
          {scrambled.map((item, index) => (
            <motion.button
              key={item.id}
              onClick={() => handleLetterClick(item)}
              disabled={item.used}
              className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all ${
                item.used
                  ? "bg-surface-elevated/50 text-text-secondary/30 cursor-default"
                  : "bg-gradient-to-br from-surface-elevated to-surface border-2 border-border hover:border-primary hover:scale-105 cursor-pointer shadow-lg"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={!item.used ? { y: -5 } : {}}
              whileTap={!item.used ? { scale: 0.9 } : {}}
            >
              {item.letter}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <motion.p
        className="text-center text-xs text-text-secondary mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        💡 Click letters to arrange them. Build a streak for bonus points!
      </motion.p>
    </div>
  );
}
