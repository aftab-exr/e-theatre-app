import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// API URL (we'll call the login endpoint)
const API_BASE_URL = 'http://localhost:8000';

// Create the context
export const AuthContext = createContext();

// Create the provider component
export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"));
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken"));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // This effect runs when the app loads
    // It checks if we have a token in localStorage
    useEffect(() => {
        if (accessToken) {
            // If we have a token, set it as the default
            // auth header for all 'axios' requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            // TODO: We should also fetch the user's details
            // from a /auth/user/ endpoint here.
            // For now, we'll just assume we're logged in.
            console.log("User is authenticated.");
        }
    }, [accessToken]);


    const login = async (username, password) => {
        setLoading(true);
        try {
            // 1. Make the API call to log in
            const response = await axios.post(`${API_BASE_URL}/auth/login/`, {
                username,
                password
            });

            const { access, refresh } = response.data;

            // 2. Set tokens in state and localStorage
            setAccessToken(access);
            setRefreshToken(refresh);
            localStorage.setItem("accessToken", access);
            localStorage.setItem("refreshToken", refresh);

            // 3. Set the default auth header for all future axios requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

            // 4. Set user (in a real app, decode token or fetch /user)
            setUser({ username: username });

            setLoading(false);
            return true; // Signal success

        } catch (error) {
            console.error("Login failed:", error);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setLoading(false);
            return false; // Signal failure
        }
    };

    const logout = () => {
        // TODO: Call the POST /auth/logout/ endpoint
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        axios.defaults.headers.common['Authorization'] = null;
    };

    const authContextValue = {
        accessToken,
        refreshToken,
        user,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};