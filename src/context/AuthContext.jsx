// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// Corrected path for a file in src/context/ accessing src/utils/
import { API_BASE_URL } from '../utils/utilityFunctions';

// NOTE: Firebase imports are kept ONLY to satisfy the environment's mandatory
// global variables (__firebase_config, __initial_auth_token). 
// The actual application login uses the custom API endpoint.
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithCustomToken, 
    signInAnonymously,
    signOut 
} from 'firebase/auth';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Global environment variables check
const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' 
    ? __initial_auth_token 
    : null;

// Initialize Firebase once
let authInstance = null;
if (Object.keys(firebaseConfig).length > 0) {
    const appInstance = initializeApp(firebaseConfig);
    authInstance = getAuth(appInstance);
}

// Key for storing the JWT in local storage
const TOKEN_STORAGE_KEY = 'bhc_auth_token';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    // --- Core Authentication Logic (API based) ---

    /**
     * Attempts to log in using username/password against the backend API.
     */
    const login = async (username, password) => {
        setLoading(true);
        setAuthError(null);
        try {
            // 1. Call custom backend login endpoint
            const response = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
            const { token, user: userData } = response.data;

            // 2. Store JWT and set user state
            localStorage.setItem(TOKEN_STORAGE_KEY, token);
            setUser(userData);
            
            // 3. Optional: Sign in to Firebase anonymously or with custom token for environment satisfaction
            if (authInstance) {
                if (initialAuthToken) {
                    // Sign in with the environment token to keep the Firebase session alive
                    await signInWithCustomToken(authInstance, initialAuthToken); 
                } else {
                    await signInAnonymously(authInstance);
                }
            }

            return userData;
        } catch (error) {
            console.error('API Login Error:', error);
            const errorMessage = error.response?.data?.message || 'Login failed. Check server status and credentials.';
            setAuthError(errorMessage);
            setUser(null);
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Clears session storage and logs out.
     */
    const logout = async () => {
        setLoading(true);
        setAuthError(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setUser(null);
        
        // Also sign out from Firebase if initialized
        if (authInstance) {
            try {
                // This clears the Firebase session
                await signOut(authInstance); 
            } catch (error) {
                console.warn("Firebase sign-out failed, continuing with application logout.");
            }
        }
        setLoading(false);
    };

    // --- Initialization Check ---
    useEffect(() => {
        const checkTokenAndSignEnvironment = async () => {
            const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
            
            // 1. Check if a valid JWT is stored (Basic check)
            if (storedToken) {
                // For this example, we'll assume a token means a previous successful login 
                // and mock a generic user object.
                setUser({ id: 'recovered_session_id', username: 'session_user', role: 'pharmacist' }); 
            }
            
            // 2. Satisfy Environment's Firebase Auth Requirement
            if (authInstance) {
                try {
                    // Always try to establish the Firebase session based on environment globals
                    if (initialAuthToken) {
                        await signInWithCustomToken(authInstance, initialAuthToken);
                    } else {
                        await signInAnonymously(authInstance);
                    }
                } catch (e) {
                    console.error("Environment Firebase sign-in failed:", e);
                }
            }

            setLoading(false);
        };
        
        checkTokenAndSignEnvironment();
    }, []);

    const value = {
        isAuthenticated: !!user,
        user,
        loading,
        login,
        logout,
        authError,
        // Method to retrieve the JWT for all authenticated API calls
        getToken: () => localStorage.getItem(TOKEN_STORAGE_KEY) 
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
