const jwt = require("jsonwebtoken");
const { createError } = require("../helpers/error");

// Middleware to verify the token
const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  console.log(token);

  // If no token is found, return an error
  if (!token) {
    return next(createError(401, "You are not authenticated! here"));
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(createError(403, "Token is not valid"));
    }

    // If the token is valid, attach the user to the request object and proceed to the next middleware/route handler
    req.user = user;
    next();
  });
};

const verifySupport = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) {
      // Pass the error to the error handling middleware
      return next(err);
    }

    // Check if the user has the necessary role (support or admin)
    if (req.user.role !== "support" && req.user.role !== "admin") {
      console.log(req.user.role);
      return next(createError(401, "You are not authenticated! in Support"));
    }

    next();
  });
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) {
      // Pass the error to the error handling middleware
      return next(err);
    }

    // Check if the user has the necessary role (admin)
    if (req.user.role !== "admin") {
      console.log(req.user.role);
      return next(createError(401, "You are not authenticated! in Admin"));
    }

    next();
  });
};

module.exports = { verifyToken, verifySupport, verifyAdmin };
