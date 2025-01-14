const { z } = require("zod");
const mongoose = require("mongoose"); // Ensure mongoose is required

// Define validation schemas
const signupSchema = z.object({
  email: z.string().email().min(6).max(100),
  password: z.string().min(5).max(25),
  name: z.string().min(3).max(50),
});

const signinSchema = z.object({
  email: z.string().email().min(6).max(100),
  password: z.string().min(5).max(25),
});

const courseSchema = z.object({
  title: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  price: z.number().nonnegative(),
});

// Data Format Validation middleware
function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
      // console.log("validated");
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: e.errors,
        });
      }
      next(e);
    }
  };
}

// Middleware to protect routes and pass user ID to req
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    // Extract the user ID from the authenticated user
    req.adminId = req.user?._id; // Ensure `req.user` is populated by Passport
    // console.log("Authencation Passed") 
    return next();
  }
  // If not authenticated, send a 401 Unauthorized response
  res.status(401).json({ message: "Unauthorized access" });
}

module.exports = {
  ensureAuthenticated,
  validate,
  signupSchema,
  signinSchema,
  courseSchema,
};
