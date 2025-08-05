// File: src/components/KitchenDashboard.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { getToken } from '../auth/authService';
import './KitchenDashboard.css';

const socket = io('http://localhost:5000');

const KitchenDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        socket.on('connect', () => console.log('[Socket.IO] Connected to server!'));
        socket.on('new_order', (newOrder) => {
            console.log('[Socket.IO] Received new order:', newOrder);
            setOrders((prevOrders) => [newOrder, ...prevOrders]);
        });
        socket.on('order_status_update', (updatedOrder) => {
            console.log('[Socket.IO] Received status update:', updatedOrder);
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.order_id === updatedOrder.order_id ? updatedOrder : order
                )
            );
        });
        socket.on('disconnect', () => console.log('[Socket.IO] Disconnected.'));
        return () => {
            socket.off('connect');
            socket.off('new_order');
            socket.off('order_status_update');
            socket.off('disconnect');
        };
    }, []);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const token = getToken();
            setError('');
            await axios.put(`https://food-court-pos-api.onrender.com/api/v1/orders/${orderId}/status`, 
                { status: newStatus },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
        } catch (err) {
            console.error('Failed to update status:', err);
            setError('Could not update order status.');
        }
    };
    
    const renderActionButtons = (order) => {
        switch (order.status) {
            case 'PENDING':
                return <button onClick={() => handleUpdateStatus(order.order_id, 'IN_PROGRESS')} className="action-btn progress-btn">Start Cooking</button>;
            case 'IN_PROGRESS':
                return <button onClick={() => handleUpdateStatus(order.order_id, 'READY')} className="action-btn ready-btn">Mark as Ready</button>;
            case 'READY':
                return <button onClick={() => handleUpdateStatus(order.order_id, 'SERVED')} className="action-btn served-btn">Mark as Served</button>;
            case 'SERVED':
                return <p className="status-text">Order Complete</p>;
            default:
                return null;
        }
    };

    return (
        <div className="kitchen-dashboard">
            <h1>Live Kitchen Orders</h1>
            {error && <p className="error-message">{error}</p>}

            <div className="order-list-container">
                {orders.length === 0 ? (
                    <p className="no-orders-message">Waiting for new orders...</p>
                ) : (
                    orders.map((order) => (
                        <div key={order.order_id} className={`order-card status-${order.status.toLowerCase()}`}>
                            <h3>Order ID: ...{order.order_id.slice(-6)}</h3>
                            
                            {/* THIS IS THE NEW LINE TO DISPLAY THE CUSTOMER NAME */}
                            {order.order_notes && <p className="order-notes">{order.order_notes}</p>}

                            <p><strong>Total:</strong> ${parseFloat(order.total_amount).toFixed(2)}</p>
                            <p><strong>Status:</strong> <span className="status-badge">{order.status}</span></p>
                            <p><strong>Received:</strong> {new Date(order.created_at).toLocaleTimeString()}</p>
                            <div className="order-actions">
                                {renderActionButtons(order)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default KitchenDashboard;