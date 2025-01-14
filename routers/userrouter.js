const { Router } = require("express");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userRouter = Router();
const JWT_USER_PASSWORD = process.env.JWT_USER_PASSWORD;
const { authUser } = require("../middlewares/user.js");
const { validate, signupSchema, signinSchema } = require("../middlewares/user.js");

const { UserModel, AdminModel, CourseModel, PurchaseModel } = require("../db.js");

userRouter.post("/signup", async function (req, res) {

    const requiredbody = z.object({
        email: z.string().email().min(6).max(100),
        password: z.string().min(5).max(25),
        name: z.string().min(3).max(50)
    });

    try {
        const { email, password, name } = requiredbody.parse(req.body);

        const useralreadyexists = await UserModel.findOne({ email });
        if (useralreadyexists) {
            return res.status(409).json({
                message: "User with this email already exists"
            });
        }

        const hashpassword = await bcrypt.hash(password, 10);

        await UserModel.create({
            email,
            password: hashpassword,
            name
        });

        console.log("Request Handled Successfully");

        res.status(201).json({ message: "You are signed up" });
    } catch (e) {
        if (e instanceof z.ZodError) {
            return res.status(400).json({
                message: "Validation error",
                error: e.errors
            });
        }
        return res.status(500).json({
            message: "Internal server error",
            error: e.message
        });
        console.log("Error Occured");
    }
});


userRouter.post("/signin", async function (req, res) {
    try {
        // Extract data from body
        const { email, password } = req.body;

        // Check if user exists
        const userexist = await UserModel.findOne({ email });
        if (!userexist) {
            return res.status(404).json({
                message: "User with this email does not exist"
            });
        }

        // Match password using bcrypt
        const match = await bcrypt.compare(password, userexist.password);
        if (match) {
            // Generate JWT token
            const token = jwt.sign({ id: userexist._id },JWT_USER_PASSWORD);
            return res.json({
                token: token,
                message: "Successfully Logged In"
            });
        } else {
            return res.status(403).json({
                message: "Password Mismatch"
            });
        }
    } catch (err) {
        // Handle internal errors
        res.status(500).json({
            message: "Internal Working Error",
            error: err.message
        });
    }
})


userRouter.get("/course", authUser, function(req, res) {
    res.json({
        message: "Purchased courses endpoint"
    })
})

userRouter.get("/course/all", function(req, res) {
    res.json({
        message: "All courses endpoint"
    })
})


module.exports = {
    userRouter: userRouter
}