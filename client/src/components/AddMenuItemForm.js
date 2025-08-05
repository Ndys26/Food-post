// File: src/components/AddMenuItemForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { getToken } from '../auth/authService';
import './AddStallForm.css'; // We can reuse the same CSS!

const AddMenuItemForm = ({ stallId, onMenuItemAdded }) => {
    // State for all the form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!name || !price) {
            setError('Item name and price are required.');
            return;
        }

        try {
            const token = getToken();
            const newMenuItem = { name, description, price, category };

            const response = await axios.post(
                `https://food-court-pos-api.onrender.com/api/v1/stalls/${stallId}/menu-items`,
                newMenuItem,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            // Call the parent function to update the list
            onMenuItemAdded(response.data.data.item);

            // Clear the form
            setName('');
            setDescription('');
            setPrice('');
            setCategory('');

        } catch (err) {
            setError('Failed to add menu item.');
            console.error('Error adding menu item:', err);
        }
    };

    return (
        <div className="add-stall-container">
            <h3>Add New Menu Item</h3>
            <form onSubmit={handleSubmit} className="add-stall-form">
                {error && <div className="error-message">{error}</div>}
                <div className="form-group">
                    <label>Item Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Cheeseburger"/>
                </div>
                <div className="form-group">
                    <label>Price</label>
                    <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g., 10.99"/>
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., Beef patty with cheddar"/>
                </div>
                <div className="form-group">
                    <label>Category</label>
                    <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g., Main Dishes"/>
                </div>
                <button type="submit">Add Item</button>
            </form>
        </div>
    );
};

export default AddMenuItemForm;