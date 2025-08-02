// File: src/components/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Import our new function that saves the token
import { login } from '../auth/authService';

const LoginPage = () => {
    // These states are for managing the form inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // This state is for showing error messages

    // This is the function that lets us navigate to a new page
    const navigate = useNavigate();

    // This is the main function that runs when you click the "Login" button
    const handleSubmit = async (event) => {
        // Prevent the page from refreshing on its own
        event.preventDefault();
        // Clear any old error messages
        setError('');

        try {
            // This is the API call to your backend server
            const response = await axios.post('http://localhost:5000/api/v1/auth/login', {
                email: email,
                password: password
            });

            // If the login is successful, get the token from the response
            const token = response.data.data.token;
            
            // --- The Two Important Steps ---

            // Step 1: Use our service to save the token to the browser's memory
            login(token); 
            
            // Step 2: Navigate the user to the dashboard page
            navigate('/dashboard');

        } catch (err) {
            // If the server sends back an error (like "Invalid credentials")
            // show that error message on the page.
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    // This is the JSX that creates the HTML form
    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Admin & Staff Login</h2>
                
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="login-button">Login</button>
            </form>
        </div>
    );
};
    
export default LoginPage;