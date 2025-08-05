// File: src/components/AddStallForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { getToken } from '../auth/authService';
import './AddStallForm.css'; // We'll create this file for styling

// This component will receive a function from its parent to refresh the stalls list
const AddStallForm = ({ onStallAdded }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (!name) {
            setError('Stall name is required.');
            return;
        }

        try {
            const token = getToken();
            if (!token) {
                setError('Authentication error. Please log in again.');
                return;
            }

            const response = await axios.post('https://food-court-pos-api.onrender.com/api/v1/stalls', 
                { name, description }, // The data to send
                { headers: { 'Authorization': `Bearer ${token}` } } // The auth header
            );

            // Call the parent's function to update the list
            onStallAdded(response.data.data.stall);
            
            // Clear the form fields for the next entry
            setName('');
            setDescription('');

        } catch (err) {
            setError('Failed to add stall. Please try again.');
            console.error('Error adding stall:', err);
        }
    };

    return (
        <div className="add-stall-container">
            <h3>Add a New Stall</h3>
            <form onSubmit={handleSubmit} className="add-stall-form">
                {error && <div className="error-message">{error}</div>}
                <div className="form-group">
                    <label htmlFor="stall-name">Stall Name</label>
                    <input
                        id="stall-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Pizza Palace"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="stall-description">Description</label>
                    <textarea
                        id="stall-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., Authentic Italian style pizza"
                    />
                </div>
                <button type="submit">Add Stall</button>
            </form>
        </div>
    );
};

export default AddStallForm;