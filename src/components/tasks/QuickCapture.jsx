import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Mic, Sparkles, Zap } from "lucide-react";

export default function QuickCapture({ onCapture }) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard shortcut (Ctrl+Shift+N)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "N") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setText("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (text.trim()) {
      onCapture({
        title: text.trim(),
        priority: "medium",
        status: "pending",
        capturedAt: new Date(),
        isQuickCapture: true,
      });
      setText("");
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer z-50"
        style={{
          background:
            "linear-gradient(135deg, var(--primary-500), var(--primary-600))",
        }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        title="Quick Capture (Ctrl+Shift+N)"
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>

      {/* Quick Capture Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Capture Card */}
            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-2xl p-6"
              style={{
                background: "var(--bg-secondary)",
                border: "2px solid var(--primary-500)",
                boxShadow: "0 0 30px rgba(59, 130, 246, 0.3)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap
                    className="w-5 h-5"
                    style={{ color: "var(--primary-500)" }}
                  />
                  <h3
                    className="text-lg font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Quick Capture
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg cursor-pointer hover:opacity-80"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  <X
                    className="w-4 h-4"
                    style={{ color: "var(--text-tertiary)" }}
                  />
                </button>
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="What's on your mind? Capture it now..."
                    className="w-full px-4 py-4 rounded-xl text-lg"
                    style={{
                      background: "var(--bg-tertiary)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-light)",
                    }}
                    autoFocus
                  />

                  {/* Voice input button (placeholder) */}
                  <button
                    type="button"
                    onClick={() => setIsRecording(!isRecording)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg cursor-pointer transition-all ${
                      isRecording ? "animate-pulse" : ""
                    }`}
                    style={{
                      background: isRecording
                        ? "var(--error)"
                        : "var(--bg-secondary)",
                    }}
                    title="Voice input (coming soon)"
                  >
                    <Mic
                      className="w-5 h-5"
                      style={{
                        color: isRecording ? "white" : "var(--text-tertiary)",
                      }}
                    />
                  </button>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2 mt-4">
                  <motion.button
                    type="submit"
                    disabled={!text.trim()}
                    className="flex-1 py-3 rounded-xl font-medium text-white cursor-pointer transition-all disabled:opacity-50"
                    style={{ background: "var(--primary-500)" }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Capture
                  </motion.button>

                  <motion.button
                    type="button"
                    disabled={!text.trim()}
                    className="px-4 py-3 rounded-xl font-medium cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2"
                    style={{
                      background: "var(--bg-tertiary)",
                      color: "var(--text-secondary)",
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title="AI will break down your task"
                  >
                    <Sparkles className="w-4 h-4" />
                    AI Split
                  </motion.button>
                </div>
              </form>

              {/* Hint */}
              <p
                className="text-xs mt-4 text-center"
                style={{ color: "var(--text-tertiary)" }}
              >
                💡 Press{" "}
                <kbd
                  className="px-1.5 py-0.5 rounded text-xs"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  Enter
                </kbd>{" "}
                to capture •{" "}
                <kbd
                  className="px-1.5 py-0.5 rounded text-xs"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  Esc
                </kbd>{" "}
                to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
