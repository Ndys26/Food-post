// File: server/adminMiddleware.js

// This is our basic security guard from before
const authMiddleware = require('./authMiddleware');

// This is our NEW Admin security guard
const adminMiddleware = (req, res, next) => {
    // First, run the basic auth check to see if the user is even logged in
    authMiddleware(req, res, () => {
        // If the first guard passes, check the user's role
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ status: "error", message: "Forbidden: Admins only." });
        }
        // If the user is an Admin, let them pass
        next();
    });
};

module.exports = adminMiddleware;