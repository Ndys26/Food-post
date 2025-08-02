// File: src/components/ModifierManagerPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../auth/authService';
import './DashboardPage.css';

const ModifierManagerPage = () => {
    const [modifiers, setModifiers] = useState([]);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchModifiers = async () => {
            const token = getToken();
            const response = await axios.get('http://localhost:5000/api/v1/modifiers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setModifiers(response.data.data.modifiers);
        };
        fetchModifiers();
    }, []);

    const handleAddModifier = async (e) => {
        e.preventDefault();
        const token = getToken();
        try {
            const response = await axios.post('http://localhost:5000/api/v1/modifiers', 
                { name, price_change: price },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setModifiers([response.data.data.modifier, ...modifiers]);
            setName(''); setPrice('');
        } catch (err) {
            setError('Failed to add modifier.');
        }
    };

return (
    <div className="dashboard-container">
        <h1>Manage Modifiers</h1>
        <div className="add-stall-container">
            <h3>Create New Modifier Option</h3>
            {/* Find this form section */}
            <form onSubmit={handleAddModifier} className="add-stall-form">
                
                {/* >>> ADD THIS LINE TO DISPLAY THE ERROR <<< */}
                {error && <div className="error-message">{error}</div>}

                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Modifier Name (e.g., Extra Cheese)"/>
                <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price Change (e.g., 1.50)"/>
                <button type="submit">Create Modifier</button>
            </form>
        </div>
            <hr />
            <h2>Available Modifier Options</h2>
            <div className="stalls-list">
                {modifiers.map(mod => (
                    <div key={mod.modifier_id} className="stall-card">
                        <h3>{mod.name}</h3>
                        <p>Price Change: ${parseFloat(mod.price_change).toFixed(2)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ModifierManagerPage;