// File: src/components/Layout.js
import React from 'react';
import { Outlet, Navigate, useNavigate, Link } from 'react-router-dom'; // Make sure Link is imported
import { isLoggedIn, logout } from '../auth/authService';

const Layout = () => {
    const navigate = useNavigate();
    const isAuthenticated = isLoggedIn();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div>
            <header style={{ padding: '10px 20px', background: '#f1f1f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Food Court POS Dashboard</h3>
                <nav>
                    <Link to="/dashboard" style={{margin: '0 10px'}}>Dashboard</Link>
                    <Link to="/kitchen" style={{margin: '0 10px'}}>Kitchen View</Link>
                    <Link to="/reports" style={{margin: '0 10px'}}>Reports</Link>
                    
                    {/* <<< This is the new link >>> */}
                    <Link to="/inventory" style={{margin: '0 10px'}}>Inventory</Link>
                    <Link to="/modifiers" style={{margin: '0 10px'}}>Modifiers</Link>
                </nav>
                <button onClick={handleLogout}>Logout</button>
            </header>
            <main style={{ padding: '20px' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;