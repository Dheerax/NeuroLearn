import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  User,
  Bot,
  Lightbulb,
  RefreshCw,
  Play,
  X,
  ChevronRight,
} from "lucide-react";
import geminiAI from "../../services/geminiAI";

const SCENARIOS = [
  {
    id: "job-interview",
    title: "Job Interview",
    emoji: "💼",
    description: "Practice answering common interview questions",
    context:
      "You're being interviewed for a job you really want. The interviewer is professional but friendly.",
  },
  {
    id: "making-friends",
    title: "Making a New Friend",
    emoji: "👋",
    description: "Practice starting a conversation with someone new",
    context:
      "You're at a coffee shop and someone sits next to you who seems friendly. You'd like to start a conversation.",
  },
  {
    id: "asking-for-help",
    title: "Asking for Help",
    emoji: "🙋",
    description: "Practice asking a teacher or colleague for assistance",
    context:
      "You're struggling with a project and need to ask your supervisor for help.",
  },
  {
    id: "setting-boundaries",
    title: "Setting Boundaries",
    emoji: "🛑",
    description: "Practice politely declining or setting limits",
    context:
      "A friend keeps asking you to do something you don't want to do. You need to say no.",
  },
  {
    id: "small-talk",
    title: "Small Talk",
    emoji: "💬",
    description: "Practice casual conversation with acquaintances",
    context:
      "You're waiting in line and a coworker you don't know well starts making small talk.",
  },
  {
    id: "apologizing",
    title: "Apologizing",
    emoji: "🙏",
    description: "Practice giving a sincere apology",
    context:
      "You accidentally said something that hurt a friend's feelings and need to apologize.",
  },
];

export default function AIConversationPractice({ onComplete }) {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [coachTips, setCoachTips] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startScenario = (scenario) => {
    setSelectedScenario(scenario);
    setMessages([
      {
        role: "system",
        content: `**Scenario:** ${scenario.title}\n\n${scenario.context}\n\nTry starting the conversation. I'll respond as the other person would.`,
      },
    ]);
    setCoachTips([]);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { role: "user", content: inputValue.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await geminiAI.practiceConversation(
        selectedScenario.context,
        inputValue.trim(),
        messages.filter((m) => m.role !== "system")
      );

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.response },
      ]);

      if (response.coachTip) {
        setCoachTips((prev) => [...prev, response.coachTip]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble responding. Let's try again!",
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

  const resetConversation = () => {
    setSelectedScenario(null);
    setMessages([]);
    setCoachTips([]);
  };

  if (!selectedScenario) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🗣️</div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            AI Conversation Practice
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Choose a scenario and practice with an AI partner
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCENARIOS.map((scenario, index) => (
            <motion.button
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => startScenario(scenario)}
              className="card p-4 text-left cursor-pointer group"
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{scenario.emoji}</span>
                <div className="flex-1">
                  <h3
                    className="font-semibold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {scenario.title}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {scenario.description}
                  </p>
                </div>
                <ChevronRight
                  className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "var(--text-tertiary)" }}
                />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: "var(--border-light)" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{selectedScenario.emoji}</span>
          <div>
            <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>
              {selectedScenario.title}
            </h3>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              Practice conversation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetConversation}
            className="p-2 rounded-lg cursor-pointer hover:opacity-80"
            style={{ background: "var(--bg-tertiary)" }}
            title="Choose different scenario"
          >
            <RefreshCw
              className="w-4 h-4"
              style={{ color: "var(--text-tertiary)" }}
            />
          </button>
          <button
            onClick={resetConversation}
            className="p-2 rounded-lg cursor-pointer hover:opacity-80"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <X className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {msg.role !== "system" && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        msg.role === "user"
                          ? "var(--primary-500)"
                          : "var(--bg-tertiary)",
                    }}
                  >
                    {msg.role === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot
                        className="w-4 h-4"
                        style={{ color: "var(--text-secondary)" }}
                      />
                    )}
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === "system"
                      ? "w-full"
                      : msg.role === "user"
                      ? "rounded-tr-none"
                      : "rounded-tl-none"
                  }`}
                  style={{
                    background:
                      msg.role === "user"
                        ? "var(--primary-500)"
                        : msg.role === "system"
                        ? "var(--bg-tertiary)"
                        : "var(--bg-secondary)",
                    color:
                      msg.role === "user" ? "white" : "var(--text-primary)",
                    border:
                      msg.role === "system"
                        ? "1px solid var(--border-light)"
                        : "none",
                  }}
                >
                  {msg.content.split("\n").map((line, i) => (
                    <p key={i} className={i > 0 ? "mt-2" : ""}>
                      {line.startsWith("**") ? (
                        <strong>{line.replace(/\*\*/g, "")}</strong>
                      ) : (
                        line
                      )}
                    </p>
                  ))}
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
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  <Bot
                    className="w-4 h-4 animate-pulse"
                    style={{ color: "var(--text-secondary)" }}
                  />
                </div>
                <div
                  className="p-3 rounded-2xl rounded-tl-none"
                  style={{ background: "var(--bg-secondary)" }}
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
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your response..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl text-sm"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-light)",
                }}
              />
              <motion.button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="p-3 rounded-xl cursor-pointer disabled:opacity-50"
                style={{ background: "var(--primary-500)" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Coach Tips sidebar */}
        {coachTips.length > 0 && (
          <div
            className="w-72 border-l p-4 overflow-y-auto hidden lg:block"
            style={{
              borderColor: "var(--border-light)",
              background: "var(--bg-tertiary)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb
                className="w-5 h-5"
                style={{ color: "var(--warning)" }}
              />
              <h4
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Coach Feedback
              </h4>
            </div>
            <div className="space-y-3">
              {coachTips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-lg text-sm"
                  style={{
                    background: "var(--bg-secondary)",
                    borderLeft: "3px solid var(--warning)",
                  }}
                >
                  <p style={{ color: "var(--text-secondary)" }}>{tip}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
