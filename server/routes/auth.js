import express from "express";
import passport from "passport";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const username = req.body.username?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!username || !email || !password)
      return res
        .status(400)
        .json({ message: "Username, email and password are required" });
    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: "Email is already registered" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      username,
      email,
      password: passwordHash,
      profileImage: "",
    });

    req.login(user, (error) => {
      if (error) return next(error);
      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        profileImage: "",
      });
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) return next(error);
    if (!user)
      return res
        .status(401)
        .json({ message: info?.message || "Invalid credentials" });

    req.login(user, (loginError) => {
      if (loginError) return next(loginError);
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage || "",
      });
    });
  })(req, res, next);
});

router.post("/logout", (req, res, next) => {
  req.logout((error) => {
    if (error) return next(error);
    req.session.destroy((sessionError) => {
      if (sessionError) return next(sessionError);
      res.clearCookie("todo.sid");
      res.json({ ok: true });
    });
  });
});

router.get("/me", (req, res) => {
  if (!req.isAuthenticated?.() || !req.user)
    return res.status(401).json({ message: "Unauthorized" });
  const { _id, username, email, profileImage } = req.user;
  res.json({ id: _id, username, email, profileImage });
});

export default router;
