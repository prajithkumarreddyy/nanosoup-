import React, { createContext, useState, useContext, useEffect } from 'react';
import API_URL from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for user on init
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (!response.ok) {
                console.error('Login failed:', data);
                throw new Error(data.message || 'Login failed');
            }

            console.log('Login successful:', data.user);
            setUser(data.user);
            setToken(data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Login Error Catch:', error);
            // Check for network error (fetch throws TypeError on network failure)
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                return { success: false, message: 'Unable to connect to server. Is it running?' };
            }
            return { success: false, message: error.message };
        }
    };

    const register = async (username, email, password, role = 'user', mobile) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, role, mobile }),
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.message);

            setUser(data.user);
            setToken(data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/'; // Force refresh and redirect to home
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
