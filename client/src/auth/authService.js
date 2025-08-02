// File: src/auth/authService.js
const TOKEN_KEY = 'food_court_token';

export const login = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};
export const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
};

export const getToken = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    // THE FIRST SPY
    console.log(`[SPY] getToken() was called. It found this in localStorage:`, token);
    return token;
};

export const isLoggedIn = () => {
    const token = getToken();
    const result = !!token;
    // THE SECOND SPY
    console.log(`[SPY] isLoggedIn() is running. It decided the result is:`, result);
    return result;
};