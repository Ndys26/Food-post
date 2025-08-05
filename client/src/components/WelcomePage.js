// File: src/components/WelcomePage.js
import React from 'react';
import { Link } from 'react-router-dom'; // We use Link for navigation
import './WelcomePage.css'; // We'll create this CSS file

const WelcomePage = () => {
    return (
        <div className="welcome-container">
            <div className="welcome-box">
                <h1>Welcome to the Food Court POS</h1>
                <p>The all-in-one solution for managing your food court operations.</p>
                <Link to="/login">
                    <button className="welcome-login-button">
                        Proceed to Admin & Staff Login
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default WelcomePage;