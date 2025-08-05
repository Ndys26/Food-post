// File: src/components/StallSelectionPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './DashboardPage.css'; // We can reuse these styles

const StallSelectionPage = () => {
    const [stalls, setStalls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStalls = async () => {
            try {
                const response = await axios.get('https://food-court-pos-api.onrender.com/api/v1/stalls');
                setStalls(response.data.data.stalls);
            } catch (err) {
                console.error("Failed to fetch stalls for selection", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStalls();
    }, []);

    if (loading) return <div className="dashboard-container"><p>Loading Stalls...</p></div>;

    return (
        <div className="dashboard-container">
            <h1 style={{textAlign: 'center', marginBottom: '20px'}}>Welcome to our Food Court!</h1>
            <p style={{textAlign: 'center', marginBottom: '40px'}}>Please choose a stall to see their menu and place an order.</p>
            
            <div className="stalls-list">
                {stalls.length === 0 ? (
                    <p>No stalls are open at the moment.</p>
                ) : (
                    stalls.map(stall => (
                        <Link key={stall.stall_id} to={`/stalls/${stall.stall_id}`} className="stall-info-link">
                             <div className="stall-card" style={{padding: '20px'}}>
                                <div className="stall-info">
                                    <h3>{stall.name}</h3>
                                    <p>{stall.description}</p>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
            
            {/* The Staff & Admin Login link has been removed from this page. */}
            {/* You will now access the login page by going to /login directly. */}

        </div>
    );
};

export default StallSelectionPage;