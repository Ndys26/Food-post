// File: src/components/InventoryPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../auth/authService';
// Let's reuse the same CSS for a consistent look
import './DashboardPage.css'; 

const InventoryPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form state for adding a new item
    const [newItemName, setNewItemName] = useState('');
    const [newItemUnit, setNewItemUnit] = useState('');

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                setLoading(true);
                const token = getToken();
                const response = await axios.get('http://localhost:5000/api/v1/inventory', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setItems(response.data.data.items);
            } catch (err) {
                setError('Failed to fetch inventory.');
            } finally {
                setLoading(false);
            }
        };
        fetchInventory();
    }, []);

    const handleAddItem = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = getToken();
            const response = await axios.post('http://localhost:5000/api/v1/inventory', 
                { name: newItemName, unit: newItemUnit },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setItems([response.data.data.item, ...items]); // Add new item to the top of the list
            setNewItemName(''); // Clear form
            setNewItemUnit('');   // Clear form
        } catch (err) {
            setError('Failed to add item. Is it a duplicate?');
        }
    };

    const handleAddStock = async (itemId) => {
        const quantityToAdd = prompt("How many units are you adding to the stock?");
        if (!quantityToAdd || isNaN(quantityToAdd) || Number(quantityToAdd) <= 0) {
            alert("Please enter a valid positive number.");
            return;
        }

        try {
            const token = getToken();
            const response = await axios.put(`http://localhost:5000/api/v1/inventory/${itemId}/add-stock`,
                { quantityToAdd: Number(quantityToAdd) },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            // Update the quantity in our state to instantly reflect the change
            setItems(items.map(item => item.inventory_item_id === itemId ? response.data.data.item : item));

        } catch(err) {
            setError('Failed to add stock.');
        }
    };

    if (loading) return <p>Loading inventory...</p>;

    return (
        <div className="dashboard-container">
            <h1>Inventory Management</h1>
            
            {/* Form to Add New Ingredients */}
            <div className="add-stall-container"> {/* Reusing class for styling */}
                <h3>Add New Ingredient</h3>
                <form onSubmit={handleAddItem} className="add-stall-form">
                    <div className="form-group">
                        <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Ingredient Name (e.g., Beef Patties)"/>
                    </div>
                    <div className="form-group">
                        <input type="text" value={newItemUnit} onChange={(e) => setNewItemUnit(e.target.value)} placeholder="Usage Unit (e.g., pieces, grams)"/>
                    </div>
                    <button type="submit">Add Ingredient</button>
                </form>
            </div>

            <hr />
            {error && <div className="error-message">{error}</div>}

            <h2>Current Stock</h2>
            <div className="stalls-list">
                {items.map(item => (
                    <div key={item.inventory_item_id} className="stall-card">
                        <div className="stall-info">
                            <h3>{item.name}</h3>
                            <p><strong>Stock:</strong> {parseFloat(item.quantity_in_stock).toFixed(2)} {item.unit}</p>
                        </div>
                        <button onClick={() => handleAddStock(item.inventory_item_id)} className="add-stock-btn">
                            Add Stock
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InventoryPage;