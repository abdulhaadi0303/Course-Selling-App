const { Router } = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { authUser } = require("../middlewares/user.js");
const { validate, signupSchema, signinSchema } = require("../middlewares/user.js");
const { UserModel, CourseModel } = require("../db.js");

const userRouter = Router();
const JWT_USER_PASSWORD = process.env.JWT_USER_PASSWORD;

// Signup route
userRouter.post("/signup", validate(signupSchema), async function (req, res) {
  try {
    const { email, password, name } = req.body;

    const useralreadyexists = await UserModel.findOne({ email });
    if (useralreadyexists) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    const hashpassword = await bcrypt.hash(password, 10);

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

    const userexist = await UserModel.findOne({ email });
    if (!userexist) {
      return res.status(404).json({
        message: "User with this email does not exist",
      });
    }

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

// Purchased courses endpoint
userRouter.get("/course", authUser, function (req, res) {
  res.json({
    message: "Purchased courses endpoint",
  });
});

// All courses endpoint
userRouter.get("/course/all", function (req, res) {
  res.json({
    message: "All courses endpoint",
  });
});

module.exports = {
  userRouter,
};
