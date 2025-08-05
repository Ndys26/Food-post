// File: src/components/RecipeManager.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../auth/authService';

const RecipeManager = ({ menuItemId, allInventoryItems }) => {
    const [recipe, setRecipe] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInventoryId, setSelectedInventoryId] = useState('');
    const [quantityUsed, setQuantityUsed] = useState('');

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                setLoading(true);
                const token = getToken();
                const response = await axios.get(`https://food-court-pos-api.onrender.com/api/v1/menu-items/${menuItemId}/recipe`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setRecipe(response.data.data.recipe);
            } catch (err) {
                console.error("Failed to fetch recipe", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecipe();
    }, [menuItemId]);

    const handleAddIngredient = async (e) => {
        e.preventDefault();
        if (!selectedInventoryId || !quantityUsed) return;
        try {
            const token = getToken();
            const response = await axios.post('https://food-court-pos-api.onrender.com/api/v1/recipes', 
                { menu_item_id: menuItemId, inventory_item_id: selectedInventoryId, quantity_used: quantityUsed },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setRecipe([...recipe, response.data.data.recipeItem]);
            setSelectedInventoryId('');
            setQuantityUsed('');
        } catch (err) {
            alert("Failed to add ingredient.");
        }
    };

    if (loading) return <p>Loading recipe...</p>;

    return (
        <div className="recipe-manager">
            <h5>Recipe:</h5>
            <ul className="recipe-list">
                {recipe.length > 0 ? recipe.map(ing => (
                    <li key={ing.recipe_item_id}>
                        {ing.ingredient_name} <span>({ing.quantity_used} {ing.unit})</span>
                    </li>
                )) : (
                    <li>No ingredients assigned yet.</li>
                )}
            </ul>
            <form onSubmit={handleAddIngredient} className="add-ingredient-form">
                <select value={selectedInventoryId} onChange={e => setSelectedInventoryId(e.target.value)} required>
                    <option value="">-- Add Ingredient --</option>
                    {allInventoryItems.map(invItem => (
                        <option key={invItem.inventory_item_id} value={invItem.inventory_item_id}>
                            {invItem.name} ({invItem.unit})
                        </option>
                    ))}
                </select>
                <input type="number" value={quantityUsed} onChange={e => setQuantityUsed(e.target.value)} placeholder="Qty" required />
                <button type="submit">+</button>
            </form>
        </div>
    );
};

export default RecipeManager;