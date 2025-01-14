const jwt = require("jsonwebtoken");

const { z } = require("zod");

function authUser(req, res, next) {
    const token = req.headers.token;

    // Check if token is provided
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_USER_PASSWORD);

        // Attach user ID to the request object
        req.userId = decoded.id; // Use 'id' based on your JWT payload structure
        next();

    } catch (err) {
        // Handle token errors
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid Token" });
        } else {
            console.error("Error verifying token:", err); // Log specific error
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
}


// Signup schema
const signupSchema = z.object({
    email: z.string().email().min(6).max(100),
    password: z.string().min(5).max(25),
    name: z.string().min(3).max(50),
  });
  
  // Login schema
  const signinSchema = z.object({
    email: z.string().email().min(6).max(100),
    password: z.string().min(5).max(25),
  });
  

// Middleware to validate request body/data
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



module.exports = {
    authUser,
    validate,
    signupSchema,
    signinSchema,
}
