// File: src/components/DashboardPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../auth/authService';
import AddStallForm from './AddStallForm';
import { Link } from 'react-router-dom';
import './DashboardPage.css';

const DashboardPage = () => {
    const [stalls, setStalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- Data fetching and handlers ---
    const fetchStalls = async () => {
        try { setLoading(true); const response = await axios.get('http://localhost:5000/api/v1/stalls'); setStalls(response.data.data.stalls); } 
        catch (err) { setError('Failed to fetch stalls.'); console.error('Error fetching stalls:', err); } 
        finally { setLoading(false); }
    };
    useEffect(() => { fetchStalls(); }, []);

    const handleDelete = async (stallId) => {
        if (!window.confirm("Are you sure you want to delete this stall?")) { return; }
        try { const token = getToken(); await axios.delete(`http://localhost:5000/api/v1/stalls/${stallId}`, { headers: { 'Authorization': `Bearer ${token}` } }); setStalls(stalls.filter(stall => stall.stall_id !== stallId)); } 
        catch (err) { setError('Failed to delete stall.'); console.error('Error deleting stall:', err); }
    };

    const handleStallAdded = (newStall) => setStalls([newStall, ...stalls]);
    
    // --- THIS IS THE NEW FUNCTION ---
    const handleGetQrLink = (stallId) => {
        const publicUrl = `${window.location.origin}/stalls/${stallId}`;
        window.prompt("Copy this URL to create your QR code:", publicUrl);
    };


    if (loading) return <div>Loading your stalls...</div>;

    return (
        <div className="dashboard-container">
            <AddStallForm onStallAdded={handleStallAdded} />
            <hr /> 
            <h1>Your Stalls</h1>
            <p>Manage your stalls and get their QR code links below.</p>
            {error && <div className="error-message main-error">{error}</div>}

            <div className="stalls-list">
                {stalls.length === 0 ? <p>No stalls currently exist.</p> : (
                    stalls.map(stall => (
                        <div key={stall.stall_id} className="stall-card">
                            <Link to={`/stalls/${stall.stall_id}/manage`} className="stall-info-link">
                                <div className="stall-info">
                                    <h3>{stall.name}</h3>
                                    <p>{stall.description}</p>
                                </div>
                            </Link>
                            
                            {/* --- THIS IS THE NEW BUTTONS SECTION --- */}
                            <div className="stall-actions">
                                <button onClick={() => handleGetQrLink(stall.stall_id)} className="qr-link-btn">
                                    QR Link
                                </button>
                                <button onClick={() => handleDelete(stall.stall_id)} className="delete-button">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DashboardPage;