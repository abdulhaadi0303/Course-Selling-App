const jwt = require("jsonwebtoken");

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

module.exports = {
    authUser,
}
