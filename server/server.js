import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import todosRoutes from "./routes/todos.js";
import { configurePassport } from "./config/passport.js";

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

app.set("trust proxy", 1);

const configuredOrigins = (
  process.env.CLIENT_URLS ||
  process.env.CLIENT_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, "");
      const allowed =
        configuredOrigins.includes(normalizedOrigin) ||
        normalizedOrigin.endsWith(".vercel.app");

      callback(
        allowed ? null : new Error("Origin is not allowed by CORS"),
        allowed,
      );
    },
  }),
);
app.use(express.json());

await mongoose.connect(process.env.MONGODB_URI);
console.log("MongoDB connected");

app.use(
  session({
    name: "todo.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

configurePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/todos", todosRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res
    .status(error.status || 500)
    .json({ message: error.message || "Internal server error" });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
