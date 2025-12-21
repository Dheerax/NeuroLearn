import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Circle,
  CheckCircle,
  Clock,
  LayoutGrid,
  List,
  Calendar,
  Zap,
  Filter,
  SortAsc,
  ChevronDown,
} from "lucide-react";
import EnhancedTaskCard from "./EnhancedTaskCard";

// View mode types
export const VIEW_MODES = {
  KANBAN: "kanban",
  LIST: "list",
  NOW_NOT_NOW: "now_not_now",
  TIMELINE: "timeline",
};

// View mode selector
export function ViewModeSelector({ mode, onChange }) {
  const modes = [
    { id: VIEW_MODES.KANBAN, icon: LayoutGrid, label: "Board" },
    { id: VIEW_MODES.LIST, icon: List, label: "List" },
    { id: VIEW_MODES.NOW_NOT_NOW, icon: Zap, label: "Now/Later" },
    { id: VIEW_MODES.TIMELINE, icon: Calendar, label: "Timeline" },
  ];

  return (
    <div
      className="flex rounded-xl p-1"
      style={{ background: "var(--bg-tertiary)" }}
    >
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = mode === m.id;
        return (
          <motion.button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
              isActive ? "" : "hover:opacity-80"
            }`}
            style={{
              background: isActive ? "var(--bg-secondary)" : "transparent",
              color: isActive ? "var(--text-primary)" : "var(--text-tertiary)",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{m.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

// Kanban View
export function KanbanView({
  tasks,
  onUpdate,
  onDelete,
  onComplete,
  onStartTimer,
  activeTimerTaskId,
}) {
  const columns = [
    { id: "pending", title: "To Do", icon: Circle, color: "#94a3b8" },
    { id: "in-progress", title: "In Progress", icon: Clock, color: "#f59e0b" },
    { id: "completed", title: "Done", icon: CheckCircle, color: "#10b981" },
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      {columns.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);
        const Icon = column.icon;

        return (
          <div key={column.id} className="flex flex-col">
            {/* Column Header */}
            <div
              className="flex items-center gap-2 mb-4 sticky top-0 z-10 py-2 px-1"
              style={{ background: "var(--bg-primary)" }}
            >
              <Icon className="w-5 h-5" style={{ color: column.color }} />
              <h3
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {column.title}
              </h3>
              <span
                className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                }}
              >
                {columnTasks.length}
              </span>
            </div>

            {/* Tasks */}
            <div className="space-y-3 flex-1 pb-4 min-h-[200px]">
              <AnimatePresence mode="popLayout">
                {columnTasks.map((task) => (
                  <EnhancedTaskCard
                    key={task.id}
                    task={task}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onComplete={onComplete}
                    onStartTimer={onStartTimer}
                    isTimerActive={activeTimerTaskId === task.id}
                  />
                ))}
              </AnimatePresence>

              {columnTasks.length === 0 && (
                <div
                  className="text-center py-8 px-4 rounded-xl border-2 border-dashed"
                  style={{ borderColor: "var(--border-light)" }}
                >
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {column.id === "pending"
                      ? "Add your first task!"
                      : "No tasks here"}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// List View
export function ListView({
  tasks,
  onUpdate,
  onDelete,
  onComplete,
  onStartTimer,
  activeTimerTaskId,
  sortBy = "priority",
}) {
  // Sort tasks
  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === "priority") {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return (
        (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2)
      );
    }
    if (sortBy === "dueDate") {
      return new Date(a.dueDate || "9999") - new Date(b.dueDate || "9999");
    }
    if (sortBy === "energy") {
      const energyOrder = { low: 0, medium: 1, high: 2 };
      return (
        (energyOrder[a.energyLevel] || 1) - (energyOrder[b.energyLevel] || 1)
      );
    }
    return 0;
  });

  // Group completed and pending
  const pendingTasks = sortedTasks.filter((t) => t.status !== "completed");
  const completedTasks = sortedTasks.filter((t) => t.status === "completed");

  return (
    <div className="space-y-6">
      {/* Pending Tasks */}
      <div>
        <h3
          className="text-sm font-medium mb-3"
          style={{ color: "var(--text-secondary)" }}
        >
          Active Tasks ({pendingTasks.length})
        </h3>
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {pendingTasks.map((task) => (
              <EnhancedTaskCard
                key={task.id}
                task={task}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onComplete={onComplete}
                onStartTimer={onStartTimer}
                isTimerActive={activeTimerTaskId === task.id}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h3
            className="text-sm font-medium mb-3"
            style={{ color: "var(--text-tertiary)" }}
          >
            Completed ({completedTasks.length})
          </h3>
          <div className="space-y-2 opacity-70">
            <AnimatePresence mode="popLayout">
              {completedTasks.slice(0, 5).map((task) => (
                <EnhancedTaskCard
                  key={task.id}
                  task={task}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onComplete={onComplete}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

// Now/Not Now View (ADHD-friendly)
export function NowNotNowView({
  tasks,
  onUpdate,
  onDelete,
  onComplete,
  onStartTimer,
  activeTimerTaskId,
}) {
  // "Now" = urgent, high priority, or in-progress
  const nowTasks = tasks.filter(
    (t) =>
      t.status !== "completed" &&
      (t.priority === "urgent" ||
        t.priority === "high" ||
        t.status === "in-progress")
  );

  // "Not Now" = everything else pending
  const notNowTasks = tasks.filter(
    (t) =>
      t.status === "pending" && t.priority !== "urgent" && t.priority !== "high"
  );

  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* NOW Column */}
      <div>
        <div
          className="flex items-center gap-3 mb-4 p-3 rounded-xl"
          style={{
            background: "linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)",
          }}
        >
          <Zap className="w-6 h-6 text-white" />
          <div>
            <h3 className="font-bold text-white text-lg">DO NOW</h3>
            <p className="text-white/80 text-sm">Focus on these first</p>
          </div>
          <span className="ml-auto px-3 py-1 rounded-full bg-white/20 text-white font-bold">
            {nowTasks.length}
          </span>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {nowTasks.map((task) => (
              <EnhancedTaskCard
                key={task.id}
                task={task}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onComplete={onComplete}
                onStartTimer={onStartTimer}
                isTimerActive={activeTimerTaskId === task.id}
              />
            ))}
          </AnimatePresence>

          {nowTasks.length === 0 && (
            <div
              className="text-center py-12 rounded-xl border-2 border-dashed"
              style={{ borderColor: "var(--border-light)" }}
            >
              <span className="text-4xl mb-2 block">🎉</span>
              <p style={{ color: "var(--text-tertiary)" }}>Nothing urgent!</p>
            </div>
          )}
        </div>
      </div>

      {/* NOT NOW Column */}
      <div>
        <div
          className="flex items-center gap-3 mb-4 p-3 rounded-xl"
          style={{ background: "var(--bg-tertiary)" }}
        >
          <Clock
            className="w-6 h-6"
            style={{ color: "var(--text-secondary)" }}
          />
          <div>
            <h3
              className="font-bold text-lg"
              style={{ color: "var(--text-primary)" }}
            >
              LATER
            </h3>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              When you have time
            </p>
          </div>
          <span
            className="ml-auto px-3 py-1 rounded-full font-bold"
            style={{
              background: "var(--bg-secondary)",
              color: "var(--text-secondary)",
            }}
          >
            {notNowTasks.length}
          </span>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {notNowTasks.map((task) => (
              <EnhancedTaskCard
                key={task.id}
                task={task}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onComplete={onComplete}
                onStartTimer={onStartTimer}
                isTimerActive={activeTimerTaskId === task.id}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Completed section */}
        {completedTasks.length > 0 && (
          <div
            className="mt-6 pt-4 border-t"
            style={{ borderColor: "var(--border-light)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle
                className="w-4 h-4"
                style={{ color: "var(--success)" }}
              />
              <span
                className="text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                Done today ({completedTasks.length})
              </span>
            </div>
            <div className="space-y-2 opacity-60">
              {completedTasks.slice(0, 3).map((task) => (
                <EnhancedTaskCard
                  key={task.id}
                  task={task}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onComplete={onComplete}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Timeline View (for visual scheduling)
export function TimelineView({
  tasks,
  onUpdate,
  onDelete,
  onComplete,
  onStartTimer,
  activeTimerTaskId,
}) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8am to 8pm

  // Group tasks by estimated time slot (simplified)
  const getTasksForHour = (hour) => {
    return tasks.filter((t) => {
      if (t.status === "completed") return false;
      // For now, distribute tasks based on priority
      if (t.priority === "urgent" && hour >= 8 && hour <= 10) return true;
      if (t.priority === "high" && hour >= 10 && hour <= 12) return true;
      if (t.priority === "medium" && hour >= 14 && hour <= 16) return true;
      if (t.priority === "low" && hour >= 16) return true;
      return false;
    });
  };

  return (
    <div className="space-y-1">
      <p className="text-sm mb-4" style={{ color: "var(--text-tertiary)" }}>
        📅 Visual schedule based on priority. Drag tasks to reschedule.
      </p>

      {hours.map((hour) => {
        const hourTasks = getTasksForHour(hour);
        const isCurrentHour = new Date().getHours() === hour;

        return (
          <div
            key={hour}
            className={`flex gap-4 p-2 rounded-lg ${
              isCurrentHour ? "ring-2" : ""
            }`}
            style={{
              background: isCurrentHour
                ? "var(--primary-500)10"
                : "transparent",
              ringColor: "var(--primary-500)",
            }}
          >
            <div
              className="w-16 flex-shrink-0 text-sm font-medium"
              style={{
                color: isCurrentHour
                  ? "var(--primary-500)"
                  : "var(--text-tertiary)",
              }}
            >
              {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
            </div>

            <div
              className="flex-1 min-h-[60px] border-l-2 pl-4"
              style={{ borderColor: "var(--border-light)" }}
            >
              {hourTasks.length > 0 ? (
                <div className="space-y-2">
                  {hourTasks.map((task) => (
                    <EnhancedTaskCard
                      key={task.id}
                      task={task}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      onComplete={onComplete}
                      onStartTimer={onStartTimer}
                      isTimerActive={activeTimerTaskId === task.id}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="h-full min-h-[40px] flex items-center rounded-lg border-2 border-dashed px-4"
                  style={{ borderColor: "var(--border-light)" }}
                >
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Available slot
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
