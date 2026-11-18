const priorityStyles = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  const deadline = todo.deadline ? new Date(todo.deadline) : null;
  const isOverdue =
    deadline && !todo.completed
      ? (() => {
          const endOfDeadline = new Date(deadline);
          endOfDeadline.setHours(23, 59, 59, 999);
          return endOfDeadline.getTime() < new Date().setHours(0, 0, 0, 0);
        })()
      : false;

  return (
    <article
      className={`rounded-2xl border bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(15,23,42,0.10)] ${isOverdue ? "border-red-300" : "border-slate-200"} ${todo.completed ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onToggle(todo)}
          className={`mt-0.5 flex min-h-11 min-w-11 items-center justify-center rounded-full border-2 ${todo.completed ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-transparent hover:border-indigo-500"}`}
          aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
        >
          ✓
        </button>
        <div className="min-w-0 flex-1">
          <h3
            className={`break-words text-base font-semibold text-slate-900 ${todo.completed ? "line-through" : ""}`}
          >
            {todo.name}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${priorityStyles[todo.priority]}`}
            >
              {todo.priority}
            </span>
            {deadline && (
              <span
                className={
                  isOverdue ? "font-semibold text-red-600" : "text-slate-500"
                }
              >
                {isOverdue ? "Overdue · " : ""}
                {deadline.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onEdit(todo)}
            className="min-h-11 min-w-11 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
            aria-label="Edit task"
          >
            ✎
          </button>
          <button
            type="button"
            onClick={() => onDelete(todo)}
            className="min-h-11 min-w-11 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600"
            aria-label="Delete task"
          >
            ⌫
          </button>
        </div>
      </div>
    </article>
  );
}
