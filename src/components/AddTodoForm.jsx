import { useState } from "react";

const blank = { name: "", priority: "medium", deadline: "" };

export default function AddTodoForm({ open, todo, onClose, onSave }) {
  const [form, setForm] = useState(() =>
    todo
      ? {
          name: todo.name,
          priority: todo.priority,
          deadline: todo.deadline
            ? new Date(todo.deadline).toISOString().slice(0, 10)
            : "",
        }
      : blank,
  );
  const [error, setError] = useState("");

  if (!open) return null;

  const submit = async (event) => {
    event.preventEvent?.();
    event.preventDefault();
    if (!form.name.trim()) return setError("Task name is required");
    await onSave({
      name: form.name.trim(),
      priority: form.priority,
      deadline: form.deadline || null,
      ...(todo ? { completed: todo.completed } : {}),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-slate-950/40 p-0 sm:items-center sm:justify-center sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={submit}
        className="w-full rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            {todo ? "Edit task" : "Add task"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 min-w-11 rounded-full text-2xl text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {error && (
          <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <label className="mb-4 block text-sm font-semibold text-slate-700">
          Task name
          <input
            autoFocus
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            maxLength={200}
            className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 caret-indigo-600 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="What needs to be done?"
          />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Priority
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Deadline
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-base text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 flex-1 rounded-xl border border-slate-300 font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="min-h-12 flex-1 rounded-xl bg-indigo-600 px-4 font-semibold text-white hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
