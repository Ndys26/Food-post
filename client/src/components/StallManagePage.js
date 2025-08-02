// File: src/components/StallManagePage.js
import React, { useState, useEffect, useCallback } from 'react'; // <<< 1. Import useCallback
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { getToken } from '../auth/authService';
import AddMenuItemForm from './AddMenuItemForm';
import RecipeManager from './RecipeManager';
import ModifierManager from './ModifierManager';
import './DashboardPage.css';
import './StallManagePage.css';

const StallManagePage = () => {
    const { stallId } = useParams();
    const [stall, setStall] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [allModifiers, setAllModifiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // <<< 2. Wrap the entire fetchData function in useCallback >>>
    const fetchData = useCallback(async () => {
        try {
            const token = getToken();
            setLoading(true);
            setError(''); // Clear previous errors on a new fetch

            const [stallRes, menuRes, inventoryRes, modifiersRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/v1/stalls/${stallId}`),
                axios.get(`http://localhost:5000/api/v1/stalls/${stallId}/menu-items`),
                axios.get('http://localhost:5000/api/v1/inventory', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/v1/modifiers', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            
            setStall(stallRes.data.data.stall);
            setMenuItems(menuRes.data.data.items);
            setInventory(inventoryRes.data.data.items);
            setAllModifiers(modifiersRes.data.data.modifiers);

        } catch (err) { 
            setError('Failed to load page data. Please refresh.');
            console.error(err);
        } finally { 
            setLoading(false); 
        }
    }, [stallId]); // useCallback has its own dependency array

    // <<< 3. Update the useEffect hook to depend on fetchData >>>
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleMenuItemAdded = (newItem) => setMenuItems([newItem, ...menuItems]);
    
    const handleMenuItemDelete = async (itemId) => {
        if (!window.confirm("Delete this menu item permanently?")) return;
        try {
            const token = getToken(); // Get the token directly here
            await axios.delete(`http://localhost:5000/api/v1/menu-items/${itemId}`, { 
                headers: { 'Authorization': `Bearer ${token}` } // Correct usage
            });
            // After deleting, re-fetch all data to ensure the list is accurate
            fetchData();
        } catch (err) { 
            setError('Failed to delete menu item.'); 
        }
    };

    if (loading) return <div className="dashboard-container"><p>Loading...</p></div>;
    if (error) return <div className="dashboard-container"><p className="error-message">{error}</p></div>;

    return (
        <div className="dashboard-container">
            <p><Link to="/dashboard">← Back to Dashboard</Link></p>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h1>Manage: {stall?.name}</h1>
                <p>{stall?.description}</p>
            </div>
            
            <AddMenuItemForm stallId={stallId} onMenuItemAdded={handleMenuItemAdded} />
            <hr />

            <h2>Menu, Recipes, & Modifiers</h2>
            <div className="stalls-list">
                {menuItems.map(item => (
                    <div key={item.item_id} className="stall-card">
                        <div className="stall-info">
                            <h3>{item.name} (${parseFloat(item.price).toFixed(2)})</h3>
                            <p>{item.description}</p>
                            
                            <RecipeManager 
                                menuItemId={item.item_id} 
                                allInventoryItems={inventory}
                            />
                            
                            <ModifierManager 
                                menuItem={item} 
                                allModifiers={allModifiers}
                                onModifierAssigned={fetchData} 
                            />
                        </div>
                        <button onClick={() => handleMenuItemDelete(item.item_id)} className="delete-button">Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StallManagePage;