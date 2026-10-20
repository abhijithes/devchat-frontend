import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Pencil,
  Circle,
  CheckCircle2,
  Calendar,
  Search,
  Inbox,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import DialogueBox from "../../components/dailogue-box/dialogueBox";
import taskService from "../../services/personal-tasks-service";
import DvcCalander from "../../components/dvc-calander/DvcCalander";

/* ============================================================
   Types
   ============================================================ */
type Priority = "low" | "medium" | "high";
type Filter = "all" | "active" | "completed";

interface Task {
  id: string;
  user: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string; // ISO
  createdAt: number;
}

type TaskInput = {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string; // ISO
};

/* ============================================================
   Helpers
   ============================================================ */
const priorityStyles: Record<
  Priority,
  { dot: string; text: string; bg: string }
> = {
  low: { dot: "bg-emerald-400", text: "text-emerald-600", bg: "bg-emerald-50" },
  medium: { dot: "bg-amber-400", text: "text-amber-600", bg: "bg-amber-50" },
  high: { dot: "bg-rose-400", text: "text-rose-600", bg: "bg-rose-50" },
};

const formatDate = (iso?: string) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const isOverdue = (iso?: string, completed?: boolean) => {
  if (!iso || completed) return false;
  return new Date(iso).getTime() < Date.now() - 86_400_000;
};

const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/* ============================================================
   Empty state
   ============================================================ */
const EmptyState: React.FC<{ filter: Filter; hasSearch: boolean }> = ({
  filter,
  hasSearch,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
      <Inbox size={22} className="text-zinc-400" />
    </div>
    <p className="text-zinc-700 font-medium">
      {hasSearch
        ? "No matching tasks"
        : filter === "completed"
          ? "Nothing completed yet"
          : filter === "active"
            ? "All caught up"
            : "No tasks yet"}
    </p>
    <p className="text-sm text-zinc-400 mt-1 max-w-xs">
      {hasSearch
        ? "Try a different search term."
        : "Add your first task to get started."}
    </p>
  </motion.div>
);

/* ============================================================
   Error banner
   ============================================================ */
const ErrorBanner: React.FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 ring-1 ring-rose-200 text-rose-700 text-sm">
    <AlertCircle size={16} />
    <span className="flex-1">{message}</span>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-xs font-medium px-2.5 py-1 rounded-md bg-rose-100 hover:bg-rose-200 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);

/* ============================================================
   Skeleton loader
   ============================================================ */
const TaskSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="flex flex-col gap-2" aria-hidden="true">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="flex items-start gap-3 p-4 rounded-xl bg-white ring-1 ring-zinc-200/70 animate-pulse"
      >
        <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-zinc-200" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="h-4 bg-zinc-200 rounded w-2/3" />
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded-md bg-zinc-100" />
              <div className="w-6 h-6 rounded-md bg-zinc-100" />
            </div>
          </div>
          <div className="mt-2 h-3 bg-zinc-100 rounded w-5/6" />
          <div className="flex items-center gap-2 mt-3">
            <div className="h-4 w-16 rounded-full bg-zinc-100" />
            <div className="h-4 w-20 rounded-full bg-zinc-100" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ============================================================
   Task row
   ============================================================ */
const TaskRow: React.FC<{
  task: Task;
  busy?: boolean;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}> = ({ task, busy, onToggle, onEdit, onDelete }) => {
  const p = priorityStyles[task.priority];
  const overdue = isOverdue(task.dueDate, task.completed);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: busy ? 0.6 : 1, y: 0 }}
      exit={{ opacity: 0, x: -12, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="group flex items-start gap-3 p-4 rounded-xl bg-white ring-1 ring-zinc-200/70
                 hover:ring-zinc-300 hover:shadow-sm transition-all"
    >
      <button
        onClick={() => onToggle(task.id)}
        disabled={busy}
        className="shrink-0 mt-0.5 disabled:cursor-wait"
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
      >
        {task.completed ? (
          <CheckCircle2 size={20} className="text-emerald-500" />
        ) : (
          <Circle
            size={20}
            className="text-zinc-300 group-hover:text-zinc-400 transition-colors"
          />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p
            className={`text-sm font-medium leading-snug break-words ${
              task.completed ? "line-through text-zinc-400" : "text-zinc-900"
            }`}
          >
            {task.title}
          </p>

          <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(task)}
              disabled={busy}
              className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 disabled:opacity-50"
              aria-label="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              disabled={busy}
              className="p-1.5 rounded-md hover:bg-rose-50 text-zinc-500 hover:text-rose-600 disabled:opacity-50"
              aria-label="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {task.description && (
          <p
            className={`mt-1 text-xs leading-relaxed break-words ${
              task.completed ? "text-zinc-300" : "text-zinc-500"
            }`}
          >
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${p.bg} ${p.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
            {task.priority}
          </span>

          {task.dueDate && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                overdue
                  ? "bg-rose-50 text-rose-600"
                  : "bg-zinc-100 text-zinc-500"
              }`}
            >
              <Calendar size={11} />
              {formatDate(task.dueDate)}
              {overdue && " · overdue"}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ============================================================
   Task form
   ============================================================ */
const TaskForm: React.FC<{
  initial?: Task | null;
  submitting?: boolean;
  onCancel: () => void;
  onSave: (data: TaskInput) => void;
}> = ({ initial, submitting, onCancel, onSave }) => {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [priority, setPriority] = useState<Priority>(
    initial?.priority || "medium",
  );
  const [dueDate, setDueDate] = useState<string>(initial?.dueDate ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-[28rem] max-w-full"
    >
      <div>
        <label className="text-xs font-medium text-zinc-600 mb-1.5 block">
          Title
        </label>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full px-3 py-2.5 text-sm rounded-lg bg-zinc-50 ring-1 ring-zinc-200
                     focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-zinc-600 mb-1.5 block">
          Description <span className="text-zinc-400">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Add details…"
          className="w-full px-3 py-2.5 text-sm rounded-lg resize-none bg-zinc-50 ring-1 ring-zinc-200
                     focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-zinc-600 mb-1.5 block">
            Priority
          </label>
          <div className="flex gap-1.5">
            {(["low", "medium", "high"] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 px-2 py-2 text-xs font-medium rounded-lg transition-all capitalize ${
                  priority === p
                    ? `${priorityStyles[p].bg} ${priorityStyles[p].text} ring-1 ring-current`
                    : "bg-zinc-50 text-zinc-500 ring-1 ring-zinc-200 hover:bg-zinc-100"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-600 mb-1.5 block">
            Due date
          </label>
          <DvcCalander
            mode="single"
            value={dueDate ? new Date(dueDate) : undefined}
            onChange={(v) => {
              const d = v instanceof Date ? v : undefined;
              setDueDate(d ? d.toISOString() : "");
            }}
            minDate={new Date()}
            placeholder="Pick a due date"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim() || submitting}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg
                     bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {initial ? "Save changes" : "Add task"}
        </button>
      </div>
    </form>
  );
};

/* ============================================================
   Main component
   ============================================================ */
const PersonalTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  /* ---------- Fetch ---------- */
  const loadTasks = useCallback(async (opts?: { silent?: boolean }) => {
    if (opts?.silent) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await taskService.getAll();
      setTasks(asArray<Task>(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  /* ---------- Busy helpers ---------- */
  const markBusy = (id: string, busy: boolean) =>
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });

  /* ---------- CRUD ---------- */
  const handleCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditing(task);
    setModalOpen(true);
  };

  const handleSave = async (data: TaskInput) => {
    setSubmitting(true);
    try {
      if (editing) {
        const updated = await taskService.update(editing.id, data);
        setTasks((prev) =>
          prev.map((t) => (t.id === editing.id ? updated : t)),
        );
      } else {
        const created = await taskService.create(data);
        setTasks((prev) => [created, ...prev]);
      }
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    markBusy(id, true);
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
    try {
      const updated = await taskService.toggle(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      );
      setError(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      markBusy(id, false);
    }
  };

  const handleDelete = async (id: string) => {
    const snapshot = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await taskService.remove(id);
    } catch (err) {
      setTasks(snapshot);
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  /* ---------- Derived ---------- */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks
      .filter((t) => {
        if (filter === "active") return !t.completed;
        if (filter === "completed") return t.completed;
        return true;
      })
      .filter((t) => {
        if (!q) return true;
        return (
          t.title.toLowerCase().includes(q) ||
          (t.description?.toLowerCase().includes(q) ?? false)
        );
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return b.createdAt - a.createdAt;
      });
  }, [tasks, filter, search]);

  const counts = useMemo(
    () => ({
      all: tasks.length,
      active: tasks.filter((t) => !t.completed).length,
      completed: tasks.filter((t) => t.completed).length,
    }),
    [tasks],
  );

  const hasSearch = search.trim().length > 0;

  return (
    <div className="h-full ">
      <div className="max-w-2xl mx-auto">
        {/* ===== Header ===== */}
        <div className="flex items-start justify-between mb-8 gap-3">
          <div>
            <h1 className="text-sm tracking-tight">
              Your personal Tasks / Todo managers
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {counts.active === 0
                ? "All done. Nice work."
                : `${counts.active} task${counts.active === 1 ? "" : "s"} left`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadTasks({ silent: true })}
              disabled={loading || refreshing}
              aria-label="Refresh tasks"
              title="Refresh"
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl
                         bg-white ring-1 ring-zinc-200 text-zinc-600
                         hover:bg-zinc-100 hover:text-zinc-900
                         disabled:opacity-50 disabled:cursor-wait
                         transition-all"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>

            <button
              onClick={handleCreate}
              className="input-grad-btn group inline-flex items-center gap-2 px-4 py-2.5
                         rounded-xl bg-zinc-900 text-white text-sm font-medium
                         hover:bg-zinc-800 shadow-sm transition-all"
            >
              <Plus
                size={16}
                className="transition-transform group-hover:rotate-90"
              />
              New task
            </button>
          </div>
        </div>

        {/* ===== Error ===== */}
        {error && (
          <div className="mb-5">
            <ErrorBanner message={error} onRetry={() => loadTasks()} />
          </div>
        )}

        {/* ===== Toolbar ===== */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks…"
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-white ring-1 ring-zinc-200
                         focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="inline-flex items-center gap-0.5 p-1 bg-white rounded-xl ring-1 ring-zinc-200">
            {(["all", "active", "completed"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
                  filter === f
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                {f}
                <span
                  className={`ml-1.5 text-[10px] ${
                    filter === f ? "text-white/60" : "text-zinc-400"
                  }`}
                >
                  {counts[f]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ===== Task list ===== */}
        <div className="flex flex-col gap-2">
          {loading ? (
            <TaskSkeleton rows={4} />
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <EmptyState key="empty" filter={filter} hasSearch={hasSearch} />
              ) : (
                filtered.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    busy={busyIds.has(task.id)}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ===== Modal ===== */}
      <DialogueBox
        opened={modalOpen}
        onClose={() => {
          if (submitting) return;
          setModalOpen(false);
          setEditing(null);
        }}
        heading={editing ? "Edit task" : "New task"}
        className="w-[30rem] max-w-[92vw]"
      >
        <TaskForm
          key={editing?.id ?? "new"}
          initial={editing}
          submitting={submitting}
          onCancel={() => {
            if (submitting) return;
            setModalOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      </DialogueBox>
    </div>
  );
};

export default PersonalTasks;
