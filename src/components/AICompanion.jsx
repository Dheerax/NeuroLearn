import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Minimize2,
  Maximize2,
  RefreshCw,
} from "lucide-react";
import geminiAI from "../services/geminiAI";

const QUICK_PROMPTS = [
  { emoji: "😰", text: "I'm feeling overwhelmed" },
  { emoji: "🎯", text: "Help me focus" },
  { emoji: "📝", text: "Break down my task" },
  { emoji: "💪", text: "I need motivation" },
];

export default function AICompanion() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey there! 👋 I'm your NeuroLearn Companion. I'm here to help with tasks, focus, or just to chat. How are you feeling today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async (text = inputValue) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await geminiAI.chat(
        text.trim(),
        "companion",
        messages.slice(1) // Skip initial greeting
      );

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.message },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Let's try again in a moment! 💙",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Fresh start! 🌟 What would you like to talk about?",
      },
    ]);
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer z-40"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Chat with AI Companion"
          >
            <MessageCircle className="w-6 h-6 text-white" />
            {/* Notification dot */}
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              height: isMinimized ? "auto" : "500px",
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 w-[380px] rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-light)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">NeuroLearn Companion</h3>
                  <p className="text-xs text-white/70">
                    {isLoading ? "Thinking..." : "Online • Here to help"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  {isMinimized ? (
                    <Maximize2 className="w-4 h-4 text-white" />
                  ) : (
                    <Minimize2 className="w-4 h-4 text-white" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Chat content (hidden when minimized) */}
            {!isMinimized && (
              <>
                {/* Messages */}
                <div
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                  style={{ maxHeight: "320px" }}
                >
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2 ${
                        msg.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.role === "user" ? "" : ""
                        }`}
                        style={{
                          background:
                            msg.role === "user"
                              ? "var(--primary-500)"
                              : "linear-gradient(135deg, #8b5cf6, #6366f1)",
                        }}
                      >
                        {msg.role === "user" ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div
                        className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                          msg.role === "user"
                            ? "rounded-tr-none"
                            : "rounded-tl-none"
                        }`}
                        style={{
                          background:
                            msg.role === "user"
                              ? "var(--primary-500)"
                              : "var(--bg-tertiary)",
                          color:
                            msg.role === "user"
                              ? "white"
                              : "var(--text-primary)",
                        }}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-2"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(135deg, #8b5cf6, #6366f1)",
                        }}
                      >
                        <Sparkles className="w-4 h-4 text-white animate-pulse" />
                      </div>
                      <div
                        className="p-3 rounded-2xl rounded-tl-none"
                        style={{ background: "var(--bg-tertiary)" }}
                      >
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                          <div
                            className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick prompts */}
                <div className="px-4 pb-2">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {QUICK_PROMPTS.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handleSend(prompt.text)}
                        disabled={isLoading}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
                        style={{
                          background: "var(--bg-tertiary)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <span>{prompt.emoji}</span>
                        <span>{prompt.text}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div
                  className="p-4 border-t"
                  style={{ borderColor: "var(--border-light)" }}
                >
                  <div className="flex gap-2">
                    <button
                      onClick={clearChat}
                      className="p-2 rounded-xl cursor-pointer hover:opacity-80"
                      style={{ background: "var(--bg-tertiary)" }}
                      title="Clear chat"
                    >
                      <RefreshCw
                        className="w-5 h-5"
                        style={{ color: "var(--text-tertiary)" }}
                      />
                    </button>
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 rounded-xl text-sm"
                      style={{
                        background: "var(--bg-tertiary)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-light)",
                      }}
                    />
                    <motion.button
                      onClick={() => handleSend()}
                      disabled={!inputValue.trim() || isLoading}
                      className="p-2 rounded-xl cursor-pointer disabled:opacity-50"
                      style={{
                        background: "var(--primary-500)",
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Send className="w-5 h-5 text-white" />
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
