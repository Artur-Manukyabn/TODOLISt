import express from "express";

const router = express.Router();

export function isAuthenticated(req, res, next) {
  if (req.isAuthenticated?.() && req.user) return next();
  return res.status(401).json({ message: "Unauthorized" });
}

router.use(isAuthenticated);

router.get("/", (req, res) => {
  const todos = [...req.user.todos]
    .sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    })
    .map((todo) => ({
      id: todo._id,
      name: todo.name,
      priority: todo.priority,
      deadline: todo.deadline,
      completed: todo.completed,
      createdAt: todo.createdAt,
    }));
  res.json(todos);
});

router.post("/", async (req, res, next) => {
  try {
    const { name, priority = "medium", deadline } = req.body;
    if (!name?.trim())
      return res.status(400).json({ message: "Task name is required" });
    if (!["low", "medium", "high"].includes(priority))
      return res.status(400).json({ message: "Invalid priority" });

    const parsedDeadline = deadline ? new Date(deadline) : null;
    if (parsedDeadline && Number.isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({ message: "Invalid deadline" });
    }

    req.user.todos.push({
      name: name.trim(),
      priority,
      deadline: parsedDeadline,
      completed: false,
    });
    await req.user.save();
    const todo = req.user.todos.at(-1);
    res
      .status(201)
      .json({
        id: todo._id,
        name: todo.name,
        priority: todo.priority,
        deadline: todo.deadline,
        completed: todo.completed,
      });
  } catch (error) {
    next(error);
  }
});

router.patch("/:todoId", async (req, res, next) => {
  try {
    const todo = req.user.todos.id(req.params.todoId);
    if (!todo) return res.status(404).json({ message: "Task not found" });

    if (Object.prototype.hasOwnProperty.call(req.body, "name")) {
      if (!req.body.name?.trim())
        return res.status(400).json({ message: "Task name is required" });
      todo.name = req.body.name.trim();
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "priority")) {
      if (!["low", "medium", "high"].includes(req.body.priority))
        return res.status(400).json({ message: "Invalid priority" });
      todo.priority = req.body.priority;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "deadline")) {
      if (req.body.deadline === null || req.body.deadline === "") {
        todo.deadline = null;
      } else {
        const deadline = new Date(req.body.deadline);
        if (Number.isNaN(deadline.getTime()))
          return res.status(400).json({ message: "Invalid deadline" });
        todo.deadline = deadline;
      }
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "completed")) {
      if (typeof req.body.completed !== "boolean")
        return res.status(400).json({ message: "completed must be boolean" });
      todo.completed = req.body.completed;
    }

    await req.user.save();
    res.json({
      id: todo._id,
      name: todo.name,
      priority: todo.priority,
      deadline: todo.deadline,
      completed: todo.completed,
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:todoId", async (req, res, next) => {
  try {
    const todo = req.user.todos.id(req.params.todoId);
    if (!todo) return res.status(404).json({ message: "Task not found" });
    todo.deleteOne();
    await req.user.save();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
