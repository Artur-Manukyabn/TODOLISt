import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

export function configurePassport() {
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const normalizedEmail = email.trim().toLowerCase();
          const user = await User.findOne({ email: normalizedEmail }).select(
            "+password",
          );
          if (!user)
            return done(null, false, { message: "Invalid email or password" });

          const validPassword = await bcrypt.compare(password, user.password);
          if (!validPassword)
            return done(null, false, { message: "Invalid email or password" });

          done(null, user);
        } catch (error) {
          done(error);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}
