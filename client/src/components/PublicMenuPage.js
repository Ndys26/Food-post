// File: src/components/PublicMenuPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PublicMenuPage.css';

const PublicMenuPage = () => {
    const { stallId } = useParams();
    const navigate = useNavigate();

    const [stall, setStall] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setError(''); setLoading(true);
            try {
                const stallResponse = await axios.get(`https://food-court-pos-api.onrender.com/api/v1/stalls/${stallId}`);
                const menuResponse = await axios.get(`https://food-court-pos-api.onrender.com/api/v1/stalls/${stallId}/menu-items`);
                setStall(stallResponse.data.data.stall);
                setMenuItems(menuResponse.data.data.items);
            } catch (err) { setError('Sorry, we could not load the menu for this stall.'); } 
            finally { setLoading(false); }
        };
        fetchData();
    }, [stallId]);

    const handleAddToCart = (item) => setCart([...cart, item]);
    
    const handlePlaceOrder = async () => {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        if (!customerName.trim()) {
            alert("Please enter your name!");
            return;
        }

        // --- THIS IS THE CORRECTED OBJECT ---
        const orderData = {
            stallId: stallId,
            items: cart, // The comma is now here
            notes: `Customer: ${customerName}`
        };

        try {
            const response = await axios.post('https://food-court-pos-api.onrender.com/api/v1/orders', orderData);
            
            const newOrderId = response.data.data.order.order_id;
            console.log('Order submitted successfully! Order ID:', newOrderId);
            
            localStorage.setItem('last_order_id', newOrderId);
            
            navigate(`/orders/${newOrderId}`);

        } catch (err) {
            console.error('Failed to submit order:', err);
            alert('There was an error placing your order. Please try again.');
        }
    };
    
    const cartTotal = cart.reduce((total, item) => total + parseFloat(item.price), 0);

    if (loading) return <div className="menu-container"><div className="loading-message">Loading Menu...</div></div>;
    if (error) return <div className="menu-container"><div className="error-message">{error}</div></div>;

    return (
        <div className="menu-container">
            <header className="menu-header">
                <h1>{stall.name}</h1>
                <p>{stall.description}</p>
            </header>

            <div className="menu-list">
                <h2>Our Menu</h2>
                {menuItems.map(item => (
                    <div key={item.item_id} className="menu-item-card">
                        <div>
                            <h3>{item.name}</h3>
                            <p className="item-description">{item.description}</p>
                            <p className="item-price">${parseFloat(item.price).toFixed(2)}</p>
                        </div>
                        <button className="add-to-cart-btn" onClick={() => handleAddToCart(item)}>
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>

            <div className="cart-section">
                <h2>Your Order</h2>
                {cart.length === 0 ? <p>Your cart is empty.</p> : (
                    <ul className="cart-list">
                        {cart.map((cartItem, index) => (
                           <li key={index} className="cart-item">
                               <span>{cartItem.name}</span>
                               <span>${parseFloat(cartItem.price).toFixed(2)}</span>
                           </li>
                        ))}
                    </ul>
                )}
                <div className="cart-total">
                    <strong>Total:</strong>
                    <strong>${cartTotal.toFixed(2)}</strong>
                </div>
                <div className="customer-name-input">
                    <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Please enter your name"
                        required
                    />
                </div>
                <button className="place-order-btn" onClick={handlePlaceOrder}>
                    Place Your Order
                </button>
            </div>
        </div>
    );
};

export default PublicMenuPage;