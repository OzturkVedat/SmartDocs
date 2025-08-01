const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "my-secret-key";

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("[Auth] Authorization header missing or invalid format.");
    return res.status(401).json({ error: "Unauthorized." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // `userId` available here
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      console.warn("[Auth] Token expired at:", err.expiredAt);
      return res.status(401).json({ error: "Auth expired. Login again." });
    }

    console.error("[Auth] JWT validation error:", err.message);
    return res.status(403).json({ error: "Invalid token." });
  }
};

module.exports = authenticateJWT;
