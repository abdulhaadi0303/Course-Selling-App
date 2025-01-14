const { Router } = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { AdminModel, CourseModel } = require("../db.js");
const { ensureAuthenticated, validate, signupSchema, signinSchema, courseSchema } = require("../middlewares/admin.js");

const adminRouter = Router();

// Configure session middleware
adminRouter.use(
  session({
    secret: process.env.SESSION_SECRET, // Key for signing cookies
    resave: false, // Prevents session resaving if nothing has changed
    saveUninitialized: false, // Prevents creating uninitialized sessions
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // Session lasts 1 day
      httpOnly: true, // Prevents client-side JS from accessing cookies
    },
  })
);

// Initialize Passport middleware
adminRouter.use(passport.initialize());
adminRouter.use(passport.session());

// Configure Passport Local Strategy
passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const admin = await AdminModel.findOne({ email });
      if (!admin) {
        return done(null, false, { message: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return done(null, false, { message: "Invalid email or password" });
      }

      return done(null, admin);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((admin, done) => {
  done(null, admin._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const admin = await AdminModel.findById(id);
    done(null, admin);
  } catch (err) {
    done(err);
  }
});

// Signup route with validation
adminRouter.post("/signup", validate(signupSchema), async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const adminExists = await AdminModel.findOne({ email });
    if (adminExists) {
      return res.status(409).json({ message: "Admin with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new AdminModel({ email, password: hashedPassword, name });
    await admin.save();

    res.status(201).json({ message: "Admin signed up successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

// Signin route with validation
adminRouter.post("/signin", validate(signinSchema), (req, res, next) => {
  passport.authenticate("local", (err, admin, info) => {
    if (err) {
      return res.status(500).json({ message: "Internal server error", error: err.message });
    }

    if (!admin) {
      return res.status(401).json({ message: info.message });
    }

    req.logIn(admin, (err) => {
      if (err) {
        return res.status(500).json({ message: "Login failed", error: err.message });
      }

      res.json({ message: "Successfully logged in" });
    });
  })(req, res, next);
});

// Protected routes
adminRouter.post("/course", ensureAuthenticated, validate(courseSchema), async (req, res) => {
  const Id = req.adminId; 
  const { title, description, imageUrl, price } = req.body;

  try {
    await CourseModel.create({
      title,
      description,
      creatorId: Id,
      imageUrl,
      price,
    });

    res.json({
      message: "Course created successfully",
      courseId: course._id,
    });

  } catch (err) {
    // if (err.code === 11000) {
    //   return res.status(409).json({ message: "Course title or description already exists" });
    // }
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

adminRouter.put("/course", ensureAuthenticated, (req, res) => {
  res.json({ message: "Course updated successfully" });
});

adminRouter.get("/course/bulk", ensureAuthenticated, (req, res) => {
  res.json({ message: "Bulk courses retrieved successfully" });
});

module.exports = {
  adminRouter,
};
