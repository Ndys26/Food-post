// File: src/components/OrderTrackerPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import './OrderTrackerPage.css';

const socket = io('http://localhost:5000');

const OrderTrackerPage = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        socket.emit('join_order_room', orderId);

        socket.on('order_status_update', (updatedOrder) => {
            if (updatedOrder.order_id === orderId) {
                setOrder(updatedOrder);
                if (updatedOrder.status === 'READY') {
                    alert(`Great news! Your order (...${orderId.slice(-6)}) is now READY for pickup!`);
                }
            }
        });
        
        const fetchOrder = async () => {
            try {
                // IMPORTANT: The API endpoint must be correct here
                const response = await axios.get(`http://localhost:5000/api/v1/orders/${orderId}`);
                setOrder(response.data.data.order);
            } catch (err) {
                setError('Could not find your order. Please check the ID.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();

        return () => { socket.off('order_status_update'); };

    }, [orderId]);

    if (loading) return <div className="tracker-container"><p>Loading order details...</p></div>;
    if (error) return <div className="tracker-container"><p className="error-message">{error}</p></div>;
    if (!order) return <div className="tracker-container"><p>Order not found.</p></div>;

    return (
        <div className="tracker-container">
            <div className="tracker-card">
                <h2>Your Order Status</h2>
                <p className="order-id">ORDER ID: ...{order.order_id.slice(-6)}</p>
                <div className="status-display">
                    <p>Current Status:</p>
                    <p className={`status-pill status-${order.status?.toLowerCase()}`}>{order.status}</p>
                </div>
                <div className="status-timeline">
                    <div className={`step ${['PENDING', 'IN_PROGRESS', 'READY', 'SERVED'].includes(order.status) ? 'completed' : ''}`}>Order Placed</div>
                    <div className={`step ${['IN_PROGRESS', 'READY', 'SERVED'].includes(order.status) ? 'completed' : ''}`}>In Progress</div>
                    <div className={`step ${['READY', 'SERVED'].includes(order.status) ? 'completed' : ''}`}>Ready for Pickup</div>
                </div>
                <hr />
                <p className="footer-note">We'll alert you when your order is ready!</p>
                <Link to="/" className="home-link">← Back to Stall Selection</Link>
            </div>
        </div>
    );
};

// This line is essential
export default OrderTrackerPage;