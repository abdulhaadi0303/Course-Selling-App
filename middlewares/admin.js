const { z } = require("zod");

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

// Data Formate Validation middleware
function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
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


// Middleware to protect routes
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized access" });
}



module.exports = {
    ensureAuthenticated,
    validate,
    signupSchema,
    signinSchema,
  };