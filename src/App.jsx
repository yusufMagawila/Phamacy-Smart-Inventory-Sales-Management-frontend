import React, { useState } from 'react';
import { Box, CssBaseline, CircularProgress, Typography } from '@mui/material';

// Components
import BHCPharmacyDashboard from './components/dashboard/BHCPharmacyDashboard';
import BHCLogin from './pages/BHCLogin'; 
import { jwtDecode } from "jwt-decode"; // 🚨 NEW: Import JWT decoder (install with: npm install jwt-decode)

// =======================================================
// MOCK AUTH HOOK (Centralized in App.jsx)
// =======================================================
const useAuth = () => {
    // 1. Add state for the user object
    const [user, setUser] = useState(null); 
    
    // Check if a token exists in localStorage on initial load
    const token = localStorage.getItem('token');
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);
    const [isLoading, setIsLoading] = useState(false); 

    // 2. Calculate isAdmin based on user role (default to false if user is null)
    const isAdmin = user?.role === 'Admin';
    
    // Function to handle successful login (called by BHCLogin)
    // 🚨 MODIFIED: Now accepts the full user data object
    const login = (token, userData) => {
        // Decode token to get user data if it's not passed directly
        if (!userData && token) {
            try {
                const decoded = jwtDecode(token);
                userData = decoded.user; 
            } catch (e) {
                console.error("Failed to decode token:", e);
                return;
            }
        }
        
        localStorage.setItem('token', token);
        setUser(userData); // Store the user data
        setIsAuthenticated(true);
    };

    // Function to handle logout (called by BHCPharmacyDashboard)
    const logout = () => {
        setIsLoading(true);
        setTimeout(() => {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser(null); // Clear user data
            setIsLoading(false);
            console.log("User Logged out.");
        }, 300); 
    };

    // 3. Return the user and isAdmin flags
    return { isAuthenticated, isLoading, login, logout, user, isAdmin };
};

function App() {
    // 1. Get the global auth state (now includes user and isAdmin)
    const { isAuthenticated, isLoading, login, logout, user, isAdmin } = useAuth();

    // 2. Display loading state while checking auth
    if (isLoading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>
                    Loading...
                </Typography>
            </Box>
        );
    }

    // 3. Define the complete useAuthProp object
    // Note: We use the actual object, not a function that returns the object, for clarity
    const authProps = { isAuthenticated, login, logout, user, isAdmin };

    // 4. Render the correct component based on authentication state
    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <CssBaseline />
            
            {isAuthenticated ? (
                // Dashboard: Pass the full auth object
                <BHCPharmacyDashboard 
                    useAuthProp={authProps} 
                />
            ) : (
                // Login: Pass the full auth object
                <BHCLogin 
                    useAuthProp={authProps} 
                />
            )}
        </Box>
    );
}

export default App;