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

//Add New Course
adminRouter.post("/course", ensureAuthenticated, validate(courseSchema), async (req, res) => {
  const AdminId = req.adminId;
  const { title, description, imageUrl, price } = req.body;

  try {
    const course = await CourseModel.create({
      title,
      description,
      creatorId: AdminId,
      imageUrl,
      price,
    });

    res.json({
      message: "Course created successfully",
      courseId: course._id,
    });

  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.title) {
      return res.status(409).json({
        message: `A course with the title "${title}" already exists. Please use a unique title.`,
      });
    }

    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
});

//Update a course 
adminRouter.put("/course", ensureAuthenticated, validate(courseSchema), async (req, res) => {
  const AdminId = req.adminId; // Extract AdminId from the authenticated user
  const { title, description, imageUrl, price, courseId } = req.body;

  try {
    // Check if the course exists with the given ID and belongs to the authenticated admin
    const existingCourse = await CourseModel.findOne({ _id: courseId, creatorId: AdminId });

    if (!existingCourse) {
      return res.status(404).json({
        message: "Course not found or you do not have permission to update this course.",
      });
    }

    // Proceed with the update if the course exists
    const result = await CourseModel.updateOne(
      { _id: courseId, creatorId: AdminId }, // Filter to ensure the course ID and creator match
      {
        title,
        description,
        imageUrl,
        price,
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "Course update failed. No changes made." });
    }

    res.json({
      message: "Course updated successfully",
      courseId: courseId,
    });
  } catch (err) {
    // General error handling
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
});


adminRouter.get("/course/bulk", ensureAuthenticated, async  (req, res) => {
  const AdminId = req.adminId; // Extract AdminId from the authenticated user

  try {

    //find the admin from its given id 
    const admin = await AdminModel.findById(AdminId, { name: 1 });

    const courses = await CourseModel.find(
      {creatorId: AdminId }, 
    );

    res.json({
      message: "All Courses of " + admin.name,
      courses: courses,
    });
  } catch (err) {
    // General error handling
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }

});




module.exports = {
  adminRouter,
};
