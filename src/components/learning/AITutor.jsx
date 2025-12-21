import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Send,
  Sparkles,
  User,
  RefreshCw,
  BookOpen,
  Copy,
  Check,
  Volume2,
  VolumeX,
} from "lucide-react";
import geminiAI from "../../services/geminiAI";
import ReactMarkdown from "react-markdown";

export default function AITutor({
  topic = null,
  learningStyle = "visual",
  onClose,
}) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState(topic || "");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-explain topic if provided
    if (topic && messages.length === 0) {
      handleExplainTopic(topic);
    }
  }, [topic]);

  const handleExplainTopic = async (topicToExplain) => {
    if (!topicToExplain.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: `Explain: ${topicToExplain}`,
      type: "topic",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await geminiAI.explainTopic(
        topicToExplain,
        learningStyle
      );
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.message, type: "explanation" },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble explaining that. Let's try again!",
          type: "error",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async (question) => {
    if (!question.trim() || isLoading) return;

    const userMessage = { role: "user", content: question, type: "question" };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await geminiAI.chat(question, "learning", messages);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.message, type: "answer" },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I couldn't process that question. Try rephrasing?",
          type: "error",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const value = inputValue.trim();
    if (!value) return;

    // Check if it's a topic or question
    if (messages.length === 0 || value.toLowerCase().startsWith("explain")) {
      handleExplainTopic(value.replace(/^explain:?\s*/i, ""));
    } else {
      handleAskQuestion(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const speakText = (text) => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text.replace(/[#*_]/g, ""));
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const clearChat = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setMessages([]);
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: "var(--border-light)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
          >
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>
              AI Tutor
            </h3>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              {isLoading ? "Thinking..." : "Ask me anything!"}
            </p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 rounded-lg cursor-pointer hover:opacity-80"
          style={{ background: "var(--bg-tertiary)" }}
          title="Clear chat"
        >
          <RefreshCw
            className="w-4 h-4"
            style={{ color: "var(--text-tertiary)" }}
          />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🧠</div>
            <h3
              className="text-lg font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              What would you like to learn?
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              Enter any topic and I'll explain it in a way that works for you.
            </p>

            {/* Suggested topics */}
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                "Photosynthesis",
                "JavaScript",
                "Anxiety management",
                "Time management",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleExplainTopic(suggestion)}
                  className="px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all hover:scale-105"
                  style={{
                    background: "var(--bg-tertiary)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background:
                  msg.role === "user"
                    ? "var(--primary-500)"
                    : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              }}
            >
              {msg.role === "user" ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Sparkles className="w-4 h-4 text-white" />
              )}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl ${
                msg.role === "user" ? "rounded-tr-none" : "rounded-tl-none"
              }`}
              style={{
                background:
                  msg.role === "user"
                    ? "var(--primary-500)"
                    : "var(--bg-tertiary)",
                color: msg.role === "user" ? "white" : "var(--text-primary)",
              }}
            >
              {msg.role === "assistant" ? (
                <div className="p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>

                  {/* Action buttons for AI responses */}
                  <div
                    className="flex gap-2 mt-3 pt-3 border-t"
                    style={{ borderColor: "var(--border-light)" }}
                  >
                    <button
                      onClick={() => copyToClipboard(msg.content)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80"
                      style={{ background: "var(--bg-secondary)" }}
                    >
                      {copied ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={() => speakText(msg.content)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 ${
                        isSpeaking ? "animate-pulse" : ""
                      }`}
                      style={{
                        background: isSpeaking
                          ? "var(--primary-500)"
                          : "var(--bg-secondary)",
                        color: isSpeaking ? "white" : "inherit",
                      }}
                    >
                      {isSpeaking ? (
                        <VolumeX className="w-3 h-3" />
                      ) : (
                        <Volume2 className="w-3 h-3" />
                      )}
                      {isSpeaking ? "Stop" : "Listen"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 text-sm">{msg.content}</div>
              )}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              }}
            >
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div
              className="p-4 rounded-2xl rounded-tl-none"
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

      {/* Input */}
      <div
        className="p-4 border-t"
        style={{ borderColor: "var(--border-light)" }}
      >
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              messages.length === 0
                ? "Enter a topic to learn..."
                : "Ask a follow-up question..."
            }
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl text-sm"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-light)",
            }}
          />
          <motion.button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-3 rounded-xl cursor-pointer disabled:opacity-50"
            style={{ background: "var(--primary-500)" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-5 h-5 text-white" />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
