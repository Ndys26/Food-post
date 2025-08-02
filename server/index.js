// File: server/index.js

// SECTION 1: IMPORTS
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const db = require('./db'); 
const authMiddleware = require('./authMiddleware');
const adminMiddleware = require('./adminMiddleware');
const http = require('http');
const { Server } = require("socket.io");
const { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } = require('date-fns');

// SECTION 2: APP & SERVER SETUP
const app = express();
const server = http.createServer(app); 
const io = new Server(server, { 
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// SECTION 3: MIDDLEWARE
app.use(cors());
app.use(express.json());

// SECTION 4: WEBSOCKET HANDLER
io.on('connection', (socket) => {
    console.log(`[Socket.IO] A user connected: ${socket.id}`);
    socket.on('join_order_room', (orderId) => {
        socket.join(orderId);
        console.log(`[Socket.IO] User ${socket.id} joined room for order ${orderId}`);
    });
    socket.on('disconnect', () => {
        console.log(`[Socket.IO] User disconnected: ${socket.id}`);
    });
});

// SECTION 5: API ROUTES

// --- AUTH ROUTES ---
app.post('/api/v1/auth/register', async (req, res) => { try { const { fullName, email, password, role } = req.body; if (!fullName || !email || !password || !role) { return res.status(400).json({ status: "error", message: "All fields are required." }); } const userCheck = await db.query("SELECT email FROM users WHERE email = $1", [email]); if (userCheck.rows.length > 0) { return res.status(409).json({ status: "error", message: "An account with this email already exists." }); } const salt = await bcrypt.genSalt(10); const hashedPassword = await bcrypt.hash(password, salt); const newUser = await db.query( "INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING user_id, full_name, email, role, created_at", [fullName, email, hashedPassword, role] ); res.status(201).json({ status: "success", message: "User registered successfully!", data: { user: newUser.rows[0] } }); } catch (err) { console.error("Error during user registration:", err.message); res.status(500).json({ status: "error", message: "Server error occurred." }); } });
app.post('/api/v1/auth/login', async (req, res) => { try { const { email, password } = req.body; if (!email || !password) { return res.status(400).json({ status: "error", message: "Email and password are required." }); } const user = await db.query("SELECT * FROM users WHERE email = $1", [email]); if (user.rows.length === 0) { return res.status(401).json({ status: "error", message: "Invalid credentials" }); } const isPasswordValid = await bcrypt.compare(password, user.rows[0].password_hash); if (!isPasswordValid) { return res.status(401).json({ status: "error", message: "Invalid credentials" }); } const tokenPayload = { userId: user.rows[0].user_id, role: user.rows[0].role }; const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' }); res.status(200).json({ status: "success", message: "Logged in successfully!", data: { token: token } }); } catch (err) { console.error("Error during user login:", err.message); res.status(500).json({ status: "error", message: "Server error occurred." }); } });
app.get('/api/v1/protected', authMiddleware, (req, res) => { res.json({ status: "success", message: "You have accessed the protected route!", data: { userInfo: req.user } }); });

// --- STALLS ROUTES ---
app.get('/api/v1/stalls', async (req, res) => { try { const stalls = await db.query("SELECT * FROM stalls ORDER BY name ASC"); res.status(200).json({ status: "success", results: stalls.rows.length, data: { stalls: stalls.rows } }); } catch (err) { console.error("Error getting stalls:", err.message); res.status(500).json({ status: "error", message: "Server error occurred." }); } });
app.get('/api/v1/stalls/:stallId', async (req, res) => { try { const { stallId } = req.params; const stall = await db.query("SELECT * FROM stalls WHERE stall_id = $1", [stallId]); if (stall.rows.length === 0) { return res.status(404).json({ status: "error", message: "Stall not found." }); } res.status(200).json({ status: "success", data: { stall: stall.rows[0] } }); } catch (err) { console.error("Error getting single stall:", err.message); res.status(500).json({ status: "error", message: "Server error occurred." }); } });
app.post('/api/v1/stalls', adminMiddleware, async (req, res) => { try { const { name, description } = req.body; if (!name) { return res.status(400).json({ status: "error", message: "Stall name is required." }); } const newStall = await db.query( "INSERT INTO stalls (name, description, fixed_costs_monthly) VALUES ($1, $2, 0) RETURNING *", [name, description] ); res.status(201).json({ status: "success", message: "Stall created successfully!", data: { stall: newStall.rows[0] } }); } catch (err) { console.error("Error creating stall:", err.message); res.status(500).json({ status: "error", message: "Server error occurred." }); } });
app.put('/api/v1/stalls/:stallId', adminMiddleware, async (req, res) => { try { const { stallId } = req.params; const { name, description, fixed_costs_monthly } = req.body; if (name === undefined || description === undefined || fixed_costs_monthly === undefined) { return res.status(400).json({ status: "error", message: "Name, description, and fixed_costs_monthly are all required." }); } const updatedStall = await db.query( "UPDATE stalls SET name = $1, description = $2, fixed_costs_monthly = $3 WHERE stall_id = $4 RETURNING *", [name, description, fixed_costs_monthly, stallId] ); if (updatedStall.rows.length === 0) { return res.status(404).json({ status: "error", message: "Stall not found." }); } res.status(200).json({ status: "success", message: "Stall updated successfully!", data: { stall: updatedStall.rows[0] } }); } catch (err) { console.error("Error updating stall:", err.message); res.status(500).json({ status: "error", message: "Server error occurred." }); } });
app.delete('/api/v1/stalls/:stallId', adminMiddleware, async (req, res) => { try { const { stallId } = req.params; const deleteOp = await db.query("DELETE FROM stalls WHERE stall_id = $1", [stallId]); if (deleteOp.rowCount === 0) { return res.status(404).json({ status: "error", message: "Stall not found." }); } res.status(204).send(); } catch (err) { console.error("Error deleting stall:", err.message); res.status(500).json({ status: "error", message: "Server error occurred." }); } });

// --- MENU ROUTES ---
app.get('/api/v1/stalls/:stallId/menu-items', async (req, res) => { try { const { stallId } = req.params; const menuItems = await db.query("SELECT * FROM menu_items WHERE stall_id = $1 ORDER BY name ASC", [stallId]); res.status(200).json({ status: "success", results: menuItems.rows.length, data: { items: menuItems.rows } }); } catch (err) { console.error("Error getting menu items:", err.message); res.status(500).json({ status: "error", message: "Server error occurred." }); } });
app.post('/api/v1/stalls/:stallId/menu-items', adminMiddleware, async (req, res) => { try { const { stallId } = req.params; const { name, description, price, category, cost_of_goods_sold } = req.body; if (!name || !price) { return res.status(400).json({ status: "error", message: "Menu item name and price are required." }); } const newItem = await db.query( "INSERT INTO menu_items (stall_id, name, description, price, category, cost_of_goods_sold) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [stallId, name, description, price, category, cost_of_goods_sold] ); res.status(201).json({ status: "success", message: "Menu item added successfully!", data: { item: newItem.rows[0] } }); } catch (err) { console.error("Error adding menu item:", err.message); res.status(500).json({ status: "error", message: "Server error occurred." }); } });
app.delete('/api/v1/menu-items/:itemId', adminMiddleware, async (req, res) => { try { const { itemId } = req.params; const deleteOp = await db.query("DELETE FROM menu_items WHERE item_id = $1", [itemId]); if (deleteOp.rowCount === 0) { return res.status(404).json({ status: "error", message: "Menu item not found." }); } res.status(204).send(); } catch (err) { console.error("Error deleting menu item:", err.message); res.status(500).json({ status: "error", message: "Server error occurred." }); } });

// --- ORDERS ROUTES ---
app.post('/api/v1/orders', async (req, res) => { const { stallId, items, notes } = req.body; if (!stallId || !items || !Array.isArray(items) || items.length === 0) { return res.status(400).json({ status: "error", message: "Invalid order data provided." }); } const client = await db.getClient(); try { await client.query('BEGIN'); let totalAmount = 0; for (const item of items) { totalAmount += parseFloat(item.price); if (item.modifiers && Array.isArray(item.modifiers)) { for (const mod of item.modifiers) { totalAmount += parseFloat(mod.price_change); } } } const orderResult = await client.query('INSERT INTO orders (stall_id, total_amount, order_notes) VALUES ($1, $2, $3) RETURNING *', [stallId, totalAmount, notes]); const newOrder = orderResult.rows[0]; for (const item of items) { const orderItemResult = await client.query('INSERT INTO order_items (order_id, item_id, unit_price, notes) VALUES ($1, $2, $3, $4) RETURNING order_item_id', [newOrder.order_id, item.item_id, item.price, item.notes || null]); const newOrderItemId = orderItemResult.rows[0].order_item_id; if (item.modifiers && Array.isArray(item.modifiers)) { for (const mod of item.modifiers) { await client.query('INSERT INTO selected_modifiers (order_item_id, modifier_id, modifier_name, price_change) VALUES ($1, $2, $3, $4)', [newOrderItemId, mod.modifier_id, mod.name, mod.price_change]); } } const recipeResult = await client.query('SELECT * FROM recipe_items WHERE menu_item_id = $1', [item.item_id]); for (const ingredient of recipeResult.rows) { await client.query('UPDATE inventory_items SET quantity_in_stock = quantity_in_stock - $1 WHERE inventory_item_id = $2;', [ingredient.quantity_used, ingredient.inventory_item_id]); } } await client.query('COMMIT'); io.emit('new_order', newOrder); res.status(201).json({ status: "success", data: { order: newOrder } }); } catch (err) { await client.query('ROLLBACK'); console.error('Error in order submission:', err); res.status(500).json({ status: "error" }); } finally { client.release(); } });
app.put('/api/v1/orders/:orderId/status', authMiddleware, async (req, res) => { try { const { orderId } = req.params; const { status } = req.body; if (!status || !['IN_PROGRESS', 'READY', 'SERVED'].includes(status)) { return res.status(400).json({ status: "error", message: "Invalid status provided." }); } const result = await db.query("UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2 RETURNING *", [status, orderId]); if (result.rows.length === 0) { return res.status(404).json({ status: 'error', message: 'Order not found.' }); } const updatedOrder = result.rows[0]; io.emit('order_status_update', updatedOrder); io.to(orderId).emit('order_status_update', updatedOrder); res.status(200).json({ status: 'success', data: { order: updatedOrder } }); } catch (err) { console.error('Error updating order status:', err); res.status(500).json({ status: "error" }); } });
app.get('/api/v1/orders/:orderId', async (req, res) => { try { const { orderId } = req.params; const result = await db.query("SELECT order_id, status, order_notes, created_at FROM orders WHERE order_id = $1", [orderId]); if (result.rows.length === 0) { return res.status(404).json({ status: 'error', message: 'Order not found.' }); } res.status(200).json({ status: 'success', data: { order: result.rows[0] } }); } catch (err) { console.error("Error fetching order status:", err.message); res.status(500).json({ status: "error" }); } });

// --- INVENTORY ROUTES ---
app.get('/api/v1/inventory', adminMiddleware, async (req, res) => { try { const items = await db.query("SELECT * FROM inventory_items ORDER BY name ASC"); res.status(200).json({ status: "success", data: { items: items.rows } }); } catch (err) { res.status(500).json({ status: "error" }); } });
app.post('/api/v1/inventory', adminMiddleware, async (req, res) => { try { const { name, unit, cost_per_unit } = req.body; const newItem = await db.query("INSERT INTO inventory_items (name, unit, cost_per_unit, quantity_in_stock) VALUES ($1, $2, $3, 0) RETURNING *", [name, unit, cost_per_unit || 0]); res.status(201).json({ status: "success", data: { item: newItem.rows[0] } }); } catch (err) { res.status(500).json({ status: "error" }); } });
app.put('/api/v1/inventory/:itemId/add-stock', adminMiddleware, async (req, res) => { try { const { itemId } = req.params; const { quantityToAdd } = req.body; if (!quantityToAdd || isNaN(quantityToAdd) || Number(quantityToAdd) <= 0) { return res.status(400).json({ status: "error", message: "A valid positive quantity is required." }); } const updatedItem = await db.query("UPDATE inventory_items SET quantity_in_stock = quantity_in_stock + $1 WHERE inventory_item_id = $2 RETURNING *", [quantityToAdd, itemId]); if (updatedItem.rows.length === 0) { return res.status(404).json({ status: "error", message: "Item not found." }); } res.status(200).json({ status: 'success', data: { item: updatedItem.rows[0] } }); } catch (err) { res.status(500).json({ status: "error" }); } });

// --- MODIFIER ROUTES ---
app.get('/api/v1/modifiers', adminMiddleware, async (req, res) => { try { const modifiers = await db.query("SELECT * FROM modifiers ORDER BY name ASC"); res.status(200).json({ status: "success", data: { modifiers: modifiers.rows } }); } catch (err) { res.status(500).json({ status: "error" }); } });
app.post('/api/v1/modifiers', adminMiddleware, async (req, res) => { try { const { name, price_change } = req.body; const newModifier = await db.query("INSERT INTO modifiers (name, price_change) VALUES ($1, $2) RETURNING *", [name, price_change]); res.status(201).json({ status: 'success', data: { modifier: newModifier.rows[0] } }); } catch (err) { res.status(500).json({ status: "error" }); } });
app.get('/api/v1/menu-items/:itemId/modifiers', async (req, res) => { try { const { itemId } = req.params; const query = `SELECT m.* FROM modifiers m JOIN menu_item_modifiers mim ON m.modifier_id = mim.modifier_id WHERE mim.menu_item_id = $1;`; const result = await db.query(query, [itemId]); res.status(200).json({ status: 'success', data: { modifiers: result.rows } }); } catch (err) { res.status(500).json({ status: 'error' }); } });
app.post('/api/v1/menu-item-modifiers', adminMiddleware, async (req, res) => { try { const { menu_item_id, modifier_id } = req.body; await db.query("INSERT INTO menu_item_modifiers (menu_item_id, modifier_id) VALUES ($1, $2)", [menu_item_id, modifier_id]); res.status(201).json({ status: 'success' }); } catch (err) { res.status(500).json({ status: 'error' }); } });

// --- RECIPE ROUTES ---
app.get('/api/v1/menu-items/:itemId/recipe', adminMiddleware, async (req, res) => { try { const { itemId } = req.params; const query = `SELECT ri.recipe_item_id, ri.quantity_used, ii.name AS ingredient_name, ii.unit FROM recipe_items ri JOIN inventory_items ii ON ri.inventory_item_id = ii.inventory_item_id WHERE ri.menu_item_id = $1;`; const recipeItems = await db.query(query, [itemId]); res.status(200).json({ status: 'success', data: { recipe: recipeItems.rows } }); } catch (err) { console.error("Error fetching recipe:", err.message); res.status(500).json({ status: 'error' }); } });
app.post('/api/v1/recipes', adminMiddleware, async (req, res) => { try { const { menu_item_id, inventory_item_id, quantity_used } = req.body; if (!menu_item_id || !inventory_item_id || !quantity_used) { return res.status(400).json({ status: 'error', message: 'Menu item, inventory item, and quantity are required.' }); } const newRecipeItem = await db.query( "INSERT INTO recipe_items (menu_item_id, inventory_item_id, quantity_used) VALUES ($1, $2, $3) RETURNING *", [menu_item_id, inventory_item_id, quantity_used] ); const responseQuery = `SELECT ri.*, ii.name AS ingredient_name, ii.unit FROM recipe_items ri JOIN inventory_items ii ON ri.inventory_item_id = ii.inventory_item_id WHERE ri.recipe_item_id = $1;`; const finalResult = await db.query(responseQuery, [newRecipeItem.rows[0].recipe_item_id]); res.status(201).json({ status: 'success', data: { recipeItem: finalResult.rows[0] } }); } catch (err) { console.error("Error adding recipe item:", err.message); res.status(500).json({ status: 'error' }); } });

// --- REPORTS ROUTES ---
app.get('/api/v1/reports/daily-sales', adminMiddleware, async (req, res) => { /* ... */ });
app.get('/api/v1/reports/weekly-sales', adminMiddleware, async (req, res) => { /* ... */ });
app.get('/api/v1/reports/monthly-sales', adminMiddleware, async (req, res) => { /* ... */ });
app.get('/api/v1/reports/breakeven/:stallId', adminMiddleware, async (req, res) => { /* ... */ });
app.get('/api/v1/reports/menu-profitability/:stallId', adminMiddleware, async (req, res) => { /* ... */ });

// SECTION 6: START SERVER
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is up and running on http://localhost:${PORT}`);
});