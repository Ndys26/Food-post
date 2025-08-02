// File: server/routes/stallRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // notice the path is ../db
const adminMiddleware = require('../middleware/adminMiddleware'); // ../middleware/

// You will need to move your authMiddleware and adminMiddleware files
// into a new folder called "middleware" inside the "server" folder.

// --- STALLS ROUTES ---
// Note: the base path /stalls will be added in index.js
router.get('/', async (req, res) => { /* ... existing code ... */ });
router.get('/:stallId', async (req, res) => { /* ... existing code ... */ });
router.post('/', adminMiddleware, async (req, res) => { /* ... existing code ... */ });
router.put('/:stallId', adminMiddleware, async (req, res) => { /* ... existing code ... */ });
router.delete('/:stallId', adminMiddleware, async (req, res) => { /* ... existing code ... */ });

// --- MENU ROUTES NESTED UNDER STALLS ---
router.post('/:stallId/menu-items', adminMiddleware, async (req, res) => { /* ... existing code ... */ });
router.get('/:stallId/menu-items', async (req, res) => { /* ... existing code ... */ });

module.exports = router;