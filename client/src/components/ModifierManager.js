// File: src/components/ModifierManager.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../auth/authService';

const ModifierManager = ({ menuItem, allModifiers, onModifierAssigned }) => {
    const [assignedModifiers, setAssignedModifiers] = useState([]);
    const [selectedModifierId, setSelectedModifierId] = useState('');

    useEffect(() => {
        // Function to get the modifiers currently assigned to THIS menu item
        const fetchAssignedModifiers = async () => {
            try {
                const token = getToken();
                const response = await axios.get(`https://food-court-pos-api.onrender.com/api/v1/menu-items/${menuItem.item_id}/modifiers`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setAssignedModifiers(response.data.data.modifiers);
            } catch (error) {
                console.error("Could not fetch assigned modifiers", error);
            }
        };
        fetchAssignedModifiers();
    }, [menuItem.item_id]);
    
    // Create a list of modifiers that are available to be assigned (i.e., not already assigned)
    const availableToAssign = allModifiers.filter(mod => 
        !assignedModifiers.some(assigned => assigned.modifier_id === mod.modifier_id)
    );
    
    const handleAssignModifier = async (e) => {
        e.preventDefault();
        if (!selectedModifierId) return;
        try {
            const token = getToken();
            await axios.post('https://food-court-pos-api.onrender.com/api/v1/menu-item-modifiers', 
                { menu_item_id: menuItem.item_id, modifier_id: selectedModifierId },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            // Find the full modifier object to add to our local state
            const newlyAssigned = allModifiers.find(m => m.modifier_id === selectedModifierId);
            setAssignedModifiers([...assignedModifiers, newlyAssigned]);
            setSelectedModifierId(''); // Reset the dropdown
        } catch (err) {
            alert('Failed to assign modifier.');
        }
    };

    return (
        <div className="recipe-manager"> {/* Reusing styles */}
            <h5>Available Modifiers:</h5>
            <ul className="recipe-list">
                {assignedModifiers.length > 0 ? assignedModifiers.map(mod => (
                    <li key={mod.modifier_id}>
                        {mod.name} <span>(+${parseFloat(mod.price_change).toFixed(2)})</span>
                    </li>
                )) : <li>No modifiers assigned yet.</li>}
            </ul>

            <form onSubmit={handleAssignModifier} className="add-ingredient-form">
                <select value={selectedModifierId} onChange={e => setSelectedModifierId(e.target.value)} required>
                    <option value="">-- Assign a Modifier --</option>
                    {availableToAssign.map(mod => (
                        <option key={mod.modifier_id} value={mod.modifier_id}>{mod.name}</option>
                    ))}
                </select>
                <button type="submit">Assign</button>
            </form>
        </div>
    );
};

export default ModifierManager;