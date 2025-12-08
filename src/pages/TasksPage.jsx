import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  Trash2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  GripVertical,
  X,
  Tag,
  Calendar,
  MoreHorizontal,
} from "lucide-react";
import { useTasks } from "../context/TaskContext";
import { useGamification } from "../context/GamificationContext";

const PRIORITIES = [
  { id: "low", label: "Low", color: "#94a3b8" },
  { id: "medium", label: "Medium", color: "#3b82f6" },
  { id: "high", label: "High", color: "#f59e0b" },
  { id: "urgent", label: "Urgent", color: "#ef4444" },
];

const COLUMNS = [
  { id: "pending", title: "To Do", icon: Circle, color: "#94a3b8" },
  { id: "in-progress", title: "In Progress", icon: Clock, color: "#f59e0b" },
  { id: "completed", title: "Completed", icon: CheckCircle, color: "#10b981" },
];

function TaskCard({ task, onUpdate, onDelete, onComplete }) {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const priorityConfig =
    PRIORITIES.find((p) => p.id === task.priority) || PRIORITIES[1];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ y: -2 }}
      className="card group cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div className="opacity-0 group-hover:opacity-50 transition-opacity cursor-grab">
          <GripVertical
            className="w-4 h-4"
            style={{ color: "var(--text-tertiary)" }}
          />
        </div>

        {/* Complete Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (task.status !== "completed") {
              onComplete(task.id);
            }
          }}
          className="flex-shrink-0 mt-0.5"
        >
          {task.status === "completed" ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              <CheckCircle
                className="w-5 h-5"
                style={{ color: "var(--success)" }}
              />
            </motion.div>
          ) : (
            <Circle
              className="w-5 h-5"
              style={{ color: "var(--text-tertiary)" }}
            />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`font-medium ${
                task.status === "completed" ? "line-through" : ""
              }`}
              style={{
                color:
                  task.status === "completed"
                    ? "var(--text-tertiary)"
                    : "var(--text-primary)",
              }}
            >
              {task.title}
            </h3>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all"
                style={{ background: "var(--bg-tertiary)" }}
              >
                <MoreHorizontal
                  className="w-4 h-4"
                  style={{ color: "var(--text-tertiary)" }}
                />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute right-0 top-full mt-1 z-20 min-w-[120px] py-1 rounded-lg"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border-light)",
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(task.id);
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm flex items-center gap-2"
                        style={{ color: "var(--error)" }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span
              className="badge text-xs"
              style={{
                background: `${priorityConfig.color}20`,
                color: priorityConfig.color,
              }}
            >
              {priorityConfig.label}
            </span>

            {task.estimatedTime && (
              <span className="badge text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {task.estimatedTime}m
              </span>
            )}
          </div>

          {/* Subtasks */}
          <AnimatePresence>
            {expanded && task.subtasks && task.subtasks.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 space-y-2 overflow-hidden"
              >
                {task.subtasks.map((subtask, index) => (
                  <div
                    key={subtask._id || index}
                    className="flex items-center gap-2 text-sm pl-4"
                  >
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        subtask.completed ? "bg-green-500 border-green-500" : ""
                      }`}
                      style={{
                        borderColor: subtask.completed
                          ? undefined
                          : "var(--border-medium)",
                      }}
                    >
                      {subtask.completed && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span
                      className={subtask.completed ? "line-through" : ""}
                      style={{
                        color: subtask.completed
                          ? "var(--text-tertiary)"
                          : "var(--text-secondary)",
                      }}
                    >
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expand indicator for subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <button
              className="flex items-center gap-1 mt-2 text-xs"
              style={{ color: "var(--text-tertiary)" }}
            >
              {expanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              {task.subtasks.length} subtask
              {task.subtasks.length > 1 ? "s" : ""}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function KanbanColumn({ column, tasks, onUpdate, onDelete, onComplete }) {
  return (
    <div className="flex flex-col min-w-[280px] lg:min-w-0">
      {/* Column Header */}
      <div
        className="flex items-center gap-2 mb-4 sticky top-0 z-10 py-2"
        style={{ background: "var(--bg-primary)" }}
      >
        <column.icon className="w-5 h-5" style={{ color: column.color }} />
        <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
          {column.title}
        </h3>
        <span
          className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <div className="space-y-3 flex-1 pb-4">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onComplete={onComplete}
            />
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <div
            className="text-center py-8 px-4 rounded-xl border-2 border-dashed"
            style={{ borderColor: "var(--border-light)" }}
          >
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              No tasks here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, completeTask } = useTasks();
  const { addXP } = useGamification();

  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    priority: "medium",
    estimatedTime: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    await addTask({
      title: newTask.title,
      priority: newTask.priority,
      estimatedTime: newTask.estimatedTime
        ? parseInt(newTask.estimatedTime)
        : null,
      status: "pending",
      subtasks: [],
    });

    setNewTask({ title: "", priority: "medium", estimatedTime: "" });
    setShowAddTask(false);
    addXP(10, "task_created");
  };

  const handleComplete = async (taskId) => {
    await completeTask(taskId);
    addXP(25, "task_completed");
  };

  // Simulated AI task breakdown
  const handleAIBreakdown = async () => {
    if (!newTask.title.trim()) return;

    setIsGenerating(true);

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const subtasks = [
      { title: `Research about ${newTask.title}`, completed: false },
      { title: `Create outline for ${newTask.title}`, completed: false },
      { title: `Complete first draft`, completed: false },
      { title: `Review and refine`, completed: false },
    ];

    await addTask({
      title: newTask.title,
      priority: newTask.priority,
      estimatedTime: newTask.estimatedTime
        ? parseInt(newTask.estimatedTime)
        : null,
      status: "pending",
      subtasks,
    });

    setNewTask({ title: "", priority: "medium", estimatedTime: "" });
    setShowAddTask(false);
    setIsGenerating(false);
    addXP(15, "ai_breakdown");
  };

  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-display font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Task Manager
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Organize and track your tasks with ease
          </p>
        </div>

        <motion.button
          onClick={() => setShowAddTask(true)}
          className="btn-primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          Add Task
        </motion.button>
      </div>

      {/* Kanban Board */}
      <div className="grid lg:grid-cols-3 gap-6 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={getTasksByStatus(column.id)}
            onUpdate={updateTask}
            onDelete={deleteTask}
            onComplete={handleComplete}
          />
        ))}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => !isGenerating && setShowAddTask(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-xl font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Create New Task
                </h2>
                <button
                  onClick={() => !isGenerating && setShowAddTask(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  disabled={isGenerating}
                >
                  <X
                    className="w-5 h-5"
                    style={{ color: "var(--text-tertiary)" }}
                  />
                </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    placeholder="What do you need to do?"
                    className="input-field"
                    disabled={isGenerating}
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Priority
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) =>
                        setNewTask({ ...newTask, priority: e.target.value })
                      }
                      className="input-field"
                      disabled={isGenerating}
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Est. Time (min)
                    </label>
                    <input
                      type="number"
                      value={newTask.estimatedTime}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          estimatedTime: e.target.value,
                        })
                      }
                      placeholder="30"
                      className="input-field"
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={handleAIBreakdown}
                    disabled={!newTask.title.trim() || isGenerating}
                    className="btn-secondary flex-1 gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isGenerating ? (
                      <>
                        <div className="spinner w-4 h-4" />
                        Generating...
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
                    className="btn-primary flex-1"
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
