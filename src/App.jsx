import { useEffect, useMemo, useState } from "react";
import api from "./api/axios";
import AddTodoForm from "./components/AddTodoForm";
import TodoList from "./components/TodoList";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("deadline");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const me = await api.get("/api/auth/me");
        setUser(me.data);
        const list = await api.get("/api/todos");
        setTodos(list.data);
      } catch (error) {
        if (error.response?.status !== 401) console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const visibleTodos = useMemo(() => {
    const priorityRank = { high: 0, medium: 1, low: 2 };
    return [...todos]
      .filter(
        (todo) => priorityFilter === "all" || todo.priority === priorityFilter,
      )
      .filter(
        (todo) =>
          statusFilter === "all" ||
          (statusFilter === "completed" ? todo.completed : !todo.completed),
      )
      .sort((a, b) => {
        if (sortBy === "priority")
          return priorityRank[a.priority] - priorityRank[b.priority];
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      });
  }, [todos, priorityFilter, statusFilter, sortBy]);

  const saveTodo = async (payload) => {
    try {
      if (editing) {
        const { data } = await api.patch(`/api/todos/${editing.id}`, payload);
        setTodos((current) =>
          current.map((todo) => (todo.id === data.id ? data : todo)),
        );
      } else {
        const { data } = await api.post("/api/todos", payload);
        setTodos((current) => [data, ...current]);
      }
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      alert(error.response?.data?.message || "Could not save task");
    }
  };

  const toggleTodo = async (todo) => {
    try {
      const { data } = await api.patch(`/api/todos/${todo.id}`, {
        completed: !todo.completed,
      });
      setTodos((current) =>
        current.map((item) => (item.id === todo.id ? data : item)),
      );
    } catch (error) {
      alert(error.response?.data?.message || "Could not update task");
    }
  };

  const deleteTodo = async (todo) => {
    if (!window.confirm(`Delete “${todo.name}”?`)) return;
    try {
      await api.delete(`/api/todos/${todo.id}`);
      setTodos((current) => current.filter((item) => item.id !== todo.id));
    } catch (error) {
      alert(error.response?.data?.message || "Could not delete task");
    }
  };

  const logout = async () => {
    await api.post("/api/auth/logout");
    window.location.reload();
  };

  const submitAuth = async (event) => {
    event.preventDefault();
    setAuthError("");

    try {
      const endpoint =
        authMode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload =
        authMode === "register"
          ? authForm
          : { email: authForm.email, password: authForm.password };
      const { data } = await api.post(endpoint, payload);
      setUser(data);
      const todosResponse = await api.get("/api/todos");
      setTodos(todosResponse.data);
    } catch (error) {
      setAuthError(error.response?.data?.message || "Authentication failed");
    }
  };

  if (loading)
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
      </main>
    );

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-10">
        <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-7 text-center shadow-2xl sm:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-3xl text-white">
            ✓
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome to ToDo</h1>
          <p className="mt-3 text-base text-slate-300">
            {authMode === "login"
              ? "Sign in to manage your tasks."
              : "Create an account to get started."}
          </p>

          <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setAuthError("");
              }}
              className={`min-h-11 rounded-lg font-semibold ${
                authMode === "login"
                  ? "bg-white text-slate-900"
                  : "text-slate-300"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("register");
                setAuthError("");
              }}
              className={`min-h-11 rounded-lg font-semibold ${
                authMode === "register"
                  ? "bg-white text-slate-900"
                  : "text-slate-300"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={submitAuth} className="mt-5 space-y-4 text-left">
            {authMode === "register" && (
              <label className="block text-sm font-semibold text-slate-200">
                Username
                <input
                  required
                  value={authForm.username}
                  onChange={(event) =>
                    setAuthForm({ ...authForm, username: event.target.value })
                  }
                  className="mt-2 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-base text-white outline-none focus:border-indigo-500"
                />
              </label>
            )}
            <label className="block text-sm font-semibold text-slate-200">
              Email
              <input
                required
                type="email"
                value={authForm.email}
                onChange={(event) =>
                  setAuthForm({ ...authForm, email: event.target.value })
                }
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-base text-white outline-none focus:border-indigo-500"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-200">
              Password
              <input
                required
                type="password"
                minLength={6}
                value={authForm.password}
                onChange={(event) =>
                  setAuthForm({ ...authForm, password: event.target.value })
                }
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-base text-white outline-none focus:border-indigo-500"
              />
            </label>
            {authError && (
              <p className="rounded-lg bg-red-950/70 p-3 text-sm text-red-300">
                {authError}
              </p>
            )}
            <button
              type="submit"
              className="min-h-12 w-full rounded-xl bg-indigo-600 px-5 font-bold text-white hover:bg-indigo-500"
            >
              {authMode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-xl text-white">
              ✓
            </div>
            <span className="text-xl font-bold">ToDo</span>
          </div>
          <div className="flex items-center gap-2">
            {user.profileImage && (
              <img
                src={user.profileImage}
                alt=""
                className="h-11 w-11 rounded-full object-cover"
              />
            )}
            <button
              onClick={logout}
              className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
        <aside className="mb-6 lg:mb-0">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-6">
            <p className="truncate text-sm text-slate-500">Signed in as</p>
            <p className="truncate font-bold">{user.username}</p>
            <button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className="mt-5 min-h-12 w-full rounded-xl bg-indigo-600 px-4 font-bold text-white hover:bg-indigo-700"
            >
              + Add task
            </button>
          </div>
        </aside>

        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-600">
                My workspace
              </p>
              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                Today's tasks
              </h1>
            </div>
            <button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className="min-h-12 rounded-xl bg-indigo-600 px-5 font-bold text-white sm:hidden"
            >
              + Add task
            </button>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-2 rounded-2xl border border-slate-200 bg-white p-3 sm:grid-cols-3">
            <select
              aria-label="Filter priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="all">All priorities</option>
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>
            <select
              aria-label="Filter status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            <select
              aria-label="Sort tasks"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="deadline">Sort by deadline</option>
              <option value="priority">Sort by priority</option>
              <option value="name">Sort by name</option>
            </select>
          </div>

          <TodoList
            todos={visibleTodos}
            onToggle={toggleTodo}
            onEdit={(todo) => {
              setEditing(todo);
              setFormOpen(true);
            }}
            onDelete={deleteTodo}
          />
        </section>
      </div>

      <AddTodoForm
        key={editing?.id || "new"}
        open={formOpen}
        todo={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={saveTodo}
      />
    </main>
  );
}
