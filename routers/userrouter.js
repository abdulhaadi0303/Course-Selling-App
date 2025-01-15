const { Router } = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { authUser } = require("../middlewares/user.js");
const { validate, signupSchema, signinSchema } = require("../middlewares/user.js");
const { UserModel, CourseModel,PurchaseModel } = require("../db.js");

const userRouter = Router();
const JWT_USER_PASSWORD = process.env.JWT_USER_PASSWORD;

// Signup route
userRouter.post("/signup", validate(signupSchema), async function (req, res) {
  try {
    //Extracting Data
    const { email, password, name } = req.body;

    //Checking if user already exist then returning
    const useralreadyexists = await UserModel.findOne({ email });
    if (useralreadyexists) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    //Hashing Password
    const hashpassword = await bcrypt.hash(password, 10);

    //Saving user in DB
    await UserModel.create({
      email,
      password: hashpassword,
      name,
    });


    res.status(201).json({ message: "You are signed up" });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
});

// Signin route
userRouter.post("/signin", validate(signinSchema), async function (req, res) {
  try {
    const { email, password } = req.body;

    //Checking If user exist or not
    const userexist = await UserModel.findOne({ email });
    if (!userexist) {
      return res.status(404).json({
        message: "User with this email does not exist",
      });
    }

    //if usre with email provided exist then checking password
    const match = await bcrypt.compare(password, userexist.password);
    if (match) {
      const token = jwt.sign({ id: userexist._id }, JWT_USER_PASSWORD);
      return res.json({
        token: token,
        message: "Successfully Logged In",
      });
    } else {
      return res.status(403).json({
        message: "Password Mismatch",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Internal Working Error",
      error: err.message,
    });
  }
});


userRouter.post("/makepurchase", authUser, async function (req, res) {
  try {
    const { courseId } = req.body;
    const userId = req.userId; // Extracted from auth middleware

    // Validate input fields
    if (!courseId || !userId) {
      return res.status(400).json({ message: "courseId and userId are required." });
    }

    // Check if the provided IDs are valid ObjectId values
    if (!mongoose.isValidObjectId(courseId) || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid courseId or userId." });
    }

    // Check if the user already purchased the course
    const existingPurchase = await PurchaseModel.findOne({ course_id: courseId, user_id: userId });
    if (existingPurchase) {
      return res.status(400).json({
        message: "You have already purchased this course.",
      });
    }

    // Create a new purchase record
    const purchase = await PurchaseModel.create({
      course_id: courseId,
      user_id: userId,
    });

    res.json({
      message: "Purchased new course successfully.",
      purchase: {
        course_id: purchase.course_id,
        user_id: purchase.user_id,
        dateofpurchase: purchase.dateofpurchase,
      },
    });

  } catch (err) {
    res.status(500).json({
      message: "Internal working Error",
      error: err.message,
    });
  }
});



userRouter.get("/purchases", authUser, async function (req, res) {
  const userId = req.userId; // Extract the authenticated user's ID

  try {
    // Fetch purchases for the user and populate the course details
    const purchases = await PurchaseModel.find({ user_id: userId }).populate("course_id");
    //.populate() When you call .populate("course_id"), Mongoose performs an additional query to the 
    // Course collection to fetch the document(s) associated with the course_id.

    const length = purchases.length;
    res.json({
      message: "User purchases fetched successfully",
      "Total Puchases ": length,
      purchases,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
});


// Show All courses endpoint
userRouter.get("/preview", async function (req, res) {

  const courses = await CourseModel.find({});
  const length = courses.length;

  res.json({
    "Total Courses": length,
    courses,
  });

});

module.exports = {
  userRouter,
};
