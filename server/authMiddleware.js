// File: server/authMiddleware.js with spies
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    console.log('[SPY on Middleware] The guard has been called.');

    const authHeader = req.header('Authorization');
    if (!authHeader) {
        console.log('[SPY on Middleware] REJECTED: No Authorization header found.');
        return res.status(401).json({ status: "error", message: "Access denied. No Authorization header." });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        console.log('[SPY on Middleware] REJECTED: No token found after "Bearer".');
        return res.status(401).json({ status: "error", message: "Access denied. No token provided." });
    }
    
    console.log('[SPY on Middleware] Found token:', token.substring(0, 15) + "...");

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('[SPY on Middleware] SUCCESS: Token verified successfully. Decoded user:', decoded);
        req.user = decoded;
        next(); // Let the request pass!
    } catch (err) {
        console.log('[SPY on Middleware] REJECTED: Token is not valid. JWT Error:', err.message);
        res.status(400).json({ status: "error", message: "Token is not valid." });
    }
};