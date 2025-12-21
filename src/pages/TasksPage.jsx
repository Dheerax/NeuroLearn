import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Sparkles,
  Filter,
  Search,
  Calendar,
  Clock,
  Target,
  Trophy,
  Zap,
  ChevronDown,
  Bell,
  Settings,
  RotateCcw,
} from "lucide-react";
import { useTasks } from "../context/TaskContext";
import { useGamification } from "../context/GamificationContext";

// New components
import QuickCapture from "../components/tasks/QuickCapture";
import EnergySelector, {
  ENERGY_LEVELS,
} from "../components/tasks/EnergySelector";
import TaskRewards from "../components/tasks/TaskRewards";
import { PRIORITIES, SENSORY_TAGS } from "../components/tasks/EnhancedTaskCard";
import {
  ViewModeSelector,
  VIEW_MODES,
  KanbanView,
  ListView,
  NowNotNowView,
  TimelineView,
} from "../components/tasks/TaskViews";
import geminiAI from "../services/geminiAI";

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, completeTask, loading } =
    useTasks();
  const { addXP, stats } = useGamification();

  // View state
  const [viewMode, setViewMode] = useState(VIEW_MODES.NOW_NOT_NOW);
  const [showAddTask, setShowAddTask] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEnergy, setFilterEnergy] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Task form state
  const [newTask, setNewTask] = useState({
    title: "",
    priority: "medium",
    estimatedTime: "",
    energyLevel: "medium",
    sensoryTags: [],
    dueDate: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Reward state
  const [showReward, setShowReward] = useState(false);
  const [taskStreak, setTaskStreak] = useState(0);

  // Timer state (for task-linked timer)
  const [activeTimerTaskId, setActiveTimerTaskId] = useState(null);

  // Today's stats
  const todayCompleted = tasks.filter(
    (t) =>
      t.status === "completed" &&
      new Date(t.completedAt).toDateString() === new Date().toDateString()
  ).length;

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Search filter
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    // Energy filter
    if (filterEnergy && task.energyLevel !== filterEnergy) {
      return false;
    }
    return true;
  });

  // Quick capture handler
  const handleQuickCapture = async (capturedTask) => {
    await addTask({
      ...capturedTask,
      status: "pending",
      energyLevel: "medium",
    });
    addXP(10, "task_created");
  };

  // Add task handler
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    await addTask({
      title: newTask.title,
      priority: newTask.priority,
      estimatedTime: newTask.estimatedTime
        ? parseInt(newTask.estimatedTime)
        : null,
      energyLevel: newTask.energyLevel,
      sensoryTags: newTask.sensoryTags,
      dueDate: newTask.dueDate || null,
      status: "pending",
      subtasks: [],
    });

    setNewTask({
      title: "",
      priority: "medium",
      estimatedTime: "",
      energyLevel: "medium",
      sensoryTags: [],
      dueDate: "",
    });
    setShowAddTask(false);
    addXP(10, "task_created");
  };

  // Complete task with reward
  const handleComplete = async (taskId) => {
    await completeTask(taskId);
    setTaskStreak((prev) => prev + 1);
    setShowReward(true);
    addXP(25, "task_completed");
  };

  // AI Task Breakdown using Gemini
  const handleAIBreakdown = async () => {
    if (!newTask.title.trim()) return;
    setIsGenerating(true);

    try {
      // Use real Gemini AI to break down the task
      const subtasks = await geminiAI.breakdownTask(newTask.title);

      await addTask({
        title: newTask.title,
        priority: newTask.priority,
        estimatedTime: newTask.estimatedTime
          ? parseInt(newTask.estimatedTime)
          : 60,
        energyLevel: newTask.energyLevel,
        sensoryTags: newTask.sensoryTags,
        status: "pending",
        subtasks,
      });

      setNewTask({
        title: "",
        priority: "medium",
        estimatedTime: "",
        energyLevel: "medium",
        sensoryTags: [],
        dueDate: "",
      });
      setShowAddTask(false);
      addXP(15, "ai_breakdown");
    } catch (error) {
      console.error("AI breakdown failed:", error);
      // Fallback to generic subtasks
      const fallbackSubtasks = [
        { title: `Research: ${newTask.title}`, completed: false },
        { title: "Plan approach", completed: false },
        { title: "Complete first part", completed: false },
        { title: "Review and finalize", completed: false },
      ];
      await addTask({
        title: newTask.title,
        priority: newTask.priority,
        status: "pending",
        subtasks: fallbackSubtasks,
      });
      setShowAddTask(false);
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle sensory tag
  const toggleSensoryTag = (tagId) => {
    setNewTask((prev) => ({
      ...prev,
      sensoryTags: prev.sensoryTags.includes(tagId)
        ? prev.sensoryTags.filter((t) => t !== tagId)
        : [...prev.sensoryTags, tagId],
    }));
  };

  // Start timer for task
  const handleStartTimer = (task) => {
    setActiveTimerTaskId(activeTimerTaskId === task.id ? null : task.id);
    // Could integrate with focus mode here
  };

  // Render current view
  const renderView = () => {
    const viewProps = {
      tasks: filteredTasks,
      onUpdate: updateTask,
      onDelete: deleteTask,
      onComplete: handleComplete,
      onStartTimer: handleStartTimer,
      activeTimerTaskId,
    };

    switch (viewMode) {
      case VIEW_MODES.KANBAN:
        return <KanbanView {...viewProps} />;
      case VIEW_MODES.LIST:
        return <ListView {...viewProps} />;
      case VIEW_MODES.NOW_NOT_NOW:
        return <NowNotNowView {...viewProps} />;
      case VIEW_MODES.TIMELINE:
        return <TimelineView {...viewProps} />;
      default:
        return <KanbanView {...viewProps} />;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <motion.h1
            className="text-2xl font-display font-bold flex items-center gap-3"
            style={{ color: "var(--text-primary)" }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Target
              className="w-8 h-8"
              style={{ color: "var(--primary-500)" }}
            />
            Task Mission Control
          </motion.h1>
          <p style={{ color: "var(--text-secondary)" }}>
            {todayCompleted > 0
              ? `🔥 ${todayCompleted} tasks crushed today!`
              : "Let's get things done, one step at a time"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Stats preview */}
          <div
            className="hidden md:flex items-center gap-4 px-4 py-2 rounded-xl"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: "var(--warning)" }} />
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {taskStreak} streak
              </span>
            </div>
            <div
              className="w-px h-4"
              style={{ background: "var(--border-light)" }}
            />
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" style={{ color: "var(--success)" }} />
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {stats?.level || 1} level
              </span>
            </div>
          </div>

          {/* Add button */}
          <motion.button
            onClick={() => setShowAddTask(true)}
            className="btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Task</span>
          </motion.button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* View Mode Selector */}
        <ViewModeSelector mode={viewMode} onChange={setViewMode} />

        {/* Search */}
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--text-tertiary)" }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-light)",
            }}
          />
        </div>

        {/* Filters */}
        <div className="relative">
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer"
            style={{
              background: filterEnergy
                ? "var(--primary-500)"
                : "var(--bg-tertiary)",
              color: filterEnergy ? "white" : "var(--text-secondary)",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Filter className="w-4 h-4" />
            Energy
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </motion.button>

          <AnimatePresence>
            {showFilters && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowFilters(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 z-20 p-3 rounded-xl w-72"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-light)",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                  }}
                >
                  <p
                    className="text-xs mb-2"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Filter by your current energy
                  </p>
                  <div className="flex gap-2">
                    {ENERGY_LEVELS.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => {
                          setFilterEnergy(
                            filterEnergy === level.id ? null : level.id
                          );
                          setShowFilters(false);
                        }}
                        className={`flex-1 p-2 rounded-lg text-center cursor-pointer transition-all ${
                          filterEnergy === level.id ? "ring-2" : ""
                        }`}
                        style={{
                          background:
                            filterEnergy === level.id
                              ? `${level.color}20`
                              : "var(--bg-tertiary)",
                          ringColor: level.color,
                        }}
                      >
                        <span className="text-xl block mb-1">
                          {level.emoji}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {level.label.split(" ")[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                  {filterEnergy && (
                    <button
                      onClick={() => {
                        setFilterEnergy(null);
                        setShowFilters(false);
                      }}
                      className="w-full mt-2 py-2 text-xs rounded-lg cursor-pointer"
                      style={{
                        background: "var(--bg-tertiary)",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      <RotateCcw className="w-3 h-3 inline mr-1" />
                      Clear filter
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner w-8 h-8" />
          </div>
        ) : filteredTasks.length === 0 && !searchQuery && !filterEnergy ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-6xl mb-4">🎯</div>
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Ready to be productive?
            </h3>
            <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
              Add your first task or use Quick Capture (Ctrl+Shift+N)
            </p>
            <motion.button
              onClick={() => setShowAddTask(true)}
              className="btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              Create Your First Task
            </motion.button>
          </motion.div>
        ) : (
          renderView()
        )}
      </motion.div>

      {/* Quick Capture FAB */}
      <QuickCapture onCapture={handleQuickCapture} />

      {/* Task Rewards */}
      <TaskRewards
        show={showReward}
        xpEarned={25}
        streakCount={taskStreak}
        onComplete={() => setShowReward(false)}
      />

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => !isGenerating && setShowAddTask(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-light)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  ✨ Create New Task
                </h2>
                <button
                  onClick={() => !isGenerating && setShowAddTask(false)}
                  disabled={isGenerating}
                  className="p-2 rounded-lg cursor-pointer hover:opacity-80"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  <X
                    className="w-5 h-5"
                    style={{ color: "var(--text-tertiary)" }}
                  />
                </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-5">
                {/* Title */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    What do you need to do?
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    placeholder="e.g., Finish the report..."
                    className="w-full px-4 py-3 rounded-xl text-base"
                    style={{
                      background: "var(--bg-tertiary)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-light)",
                    }}
                    disabled={isGenerating}
                    autoFocus
                  />
                </div>

                {/* Energy Level */}
                <EnergySelector
                  value={newTask.energyLevel}
                  onChange={(level) =>
                    setNewTask({ ...newTask, energyLevel: level })
                  }
                  showSuggestions
                />

                {/* Priority & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Priority
                    </label>
                    <div className="flex gap-2">
                      {PRIORITIES.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() =>
                            setNewTask({ ...newTask, priority: p.id })
                          }
                          className={`flex-1 py-2 rounded-lg text-sm cursor-pointer transition-all ${
                            newTask.priority === p.id ? "ring-2" : ""
                          }`}
                          style={{
                            background:
                              newTask.priority === p.id
                                ? `${p.color}20`
                                : "var(--bg-tertiary)",
                            color:
                              newTask.priority === p.id
                                ? p.color
                                : "var(--text-tertiary)",
                            ringColor: p.color,
                          }}
                          disabled={isGenerating}
                        >
                          {p.emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Est. Time
                    </label>
                    <div className="flex gap-2">
                      {[15, 30, 60].map((min) => (
                        <button
                          key={min}
                          type="button"
                          onClick={() =>
                            setNewTask({
                              ...newTask,
                              estimatedTime: min.toString(),
                            })
                          }
                          className={`flex-1 py-2 rounded-lg text-sm cursor-pointer transition-all`}
                          style={{
                            background:
                              newTask.estimatedTime === min.toString()
                                ? "var(--primary-500)"
                                : "var(--bg-tertiary)",
                            color:
                              newTask.estimatedTime === min.toString()
                                ? "white"
                                : "var(--text-tertiary)",
                          }}
                          disabled={isGenerating}
                        >
                          {min}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sensory Tags */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Environment needed
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SENSORY_TAGS.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleSensoryTag(tag.id)}
                        className={`px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all ${
                          newTask.sensoryTags.includes(tag.id) ? "ring-2" : ""
                        }`}
                        style={{
                          background: newTask.sensoryTags.includes(tag.id)
                            ? `${tag.color}20`
                            : "var(--bg-tertiary)",
                          color: newTask.sensoryTags.includes(tag.id)
                            ? tag.color
                            : "var(--text-tertiary)",
                          ringColor: tag.color,
                        }}
                        disabled={isGenerating}
                      >
                        {tag.emoji} {tag.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Due date (optional)
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) =>
                      setNewTask({ ...newTask, dueDate: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl"
                    style={{
                      background: "var(--bg-tertiary)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-light)",
                    }}
                    disabled={isGenerating}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="button"
                    onClick={handleAIBreakdown}
                    disabled={!newTask.title.trim() || isGenerating}
                    className="flex-1 py-3 rounded-xl font-medium cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{
                      background: "var(--bg-tertiary)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-light)",
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isGenerating ? (
                      <>
                        <div className="spinner w-4 h-4" />
                        Breaking down...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        AI Breakdown
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    type="submit"
                    disabled={!newTask.title.trim() || isGenerating}
                    className="flex-1 py-3 rounded-xl font-medium text-white cursor-pointer transition-all disabled:opacity-50"
                    style={{ background: "var(--primary-500)" }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Create Task
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
