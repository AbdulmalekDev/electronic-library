import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import axios from 'axios'; // We still need raw axios for errors or if we want to bypass the interceptor

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    // Backend returns { success: true, data: { user: ... } }
                    setUser(res.data.data.user || res.data.data);
                } catch (err) {
                    console.error('Failed to Load user', err);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, [token]);

    const login = async (email, password) => {
        // Backend expects 'username' which can be email or username
        const res = await api.post('/auth/login', { username: email, password });
        // Backend returns { success: true, data: { token, user } }
        const responseData = res.data.data || res.data;
        const newToken = responseData.token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(responseData.user);
        return res.data;
    };

    const register = async (userData) => {
        const res = await api.post('/auth/register', userData);
        const responseData = res.data.data || res.data;
        const newToken = responseData.token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(responseData.user);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        // No need to delete axios defaults here as we use the 'api' instance
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            register,
            logout,
            isAuthenticated: !!user,
            isLogin: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
