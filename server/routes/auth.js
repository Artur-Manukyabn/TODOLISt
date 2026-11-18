import express from "express";
import passport from "passport";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login?error=oauth_failed",
  }),
  (_req, res) =>
    res.redirect(process.env.CLIENT_URL || "http://localhost:5173"),
);

router.get("/logout", (req, res, next) => {
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
