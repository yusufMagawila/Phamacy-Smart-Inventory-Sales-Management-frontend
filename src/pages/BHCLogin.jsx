import React, { useState } from 'react';
import { 
    Box, Typography, Paper, TextField, Button, 
    InputAdornment, LinearProgress, CircularProgress,
    IconButton // 1. Import IconButton
} from '@mui/material';
import { 
    LocalPharmacy, AccountCircle, Lock,
    Visibility, VisibilityOff // 2. Import Visibility icons
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { blue, red } from '@mui/material/colors';
import axios from 'axios';
    
// IMPORTANT: Replace with your actual backend base URL
const API_BASE_URL =import.meta.env.VITE_BACKEND_URL; 
const LOGIN_ENDPOINT = `${API_BASE_URL}/auth/login`; 

// Custom styled component for the Login Box
const LoginContainer = styled(Paper)(({ theme }) => ({
    width: '100%',
    maxWidth: 400,
    padding: theme.spacing(5),
    borderRadius: 16,
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    margin: 'auto',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
}));


// Component now accepts useAuthProp from App.jsx
const BHCLogin = ({ useAuthProp }) => {
    // Use the passed prop function to get auth details
    const { login, isAuthenticated } = useAuthProp;
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // 3. New state for password visibility
    const [showPassword, setShowPassword] = useState(false); 

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Send Request to Backend
            const response = await axios.post(LOGIN_ENDPOINT, {
                username,
                password,
            });

            // 2. Process Successful Response
            const { token, user, message } = response.data;
            
            // Pass both the token AND the user object to the login function
            login(token, user); 
            console.log(message); 

        } catch (err) {
            // 3. Process Error Response
            console.error('Login failed:', err);
            const errorMessage = err.response?.data?.message || 'Failed to connect to the server.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    // Function to toggle password visibility
    const handleClickShowPassword = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    // Prevent form submission when clicking the toggle button
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    if (isAuthenticated) {
        return (
            <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>Redirecting to Dashboard...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: blue[50],
            p: 2 
        }}>
            <LoginContainer component="form" onSubmit={handleLogin}>
                <LocalPharmacy sx={{ fontSize: 60, color: blue[600], mb: 1 }} />
                <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
                    Mahonda Pharmacy Login
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" mb={3} align="center">
                    Enter your credentials to access the dashboard.
                </Typography>

                {loading && <LinearProgress sx={{ width: '100%', mb: 2 }} />}

                {error && (
                    <Box sx={{ p: 1.5, mb: 2, width: '100%', bgcolor: red[50], color: red[700], borderRadius: 1 }}>
                        <Typography variant="body2" align="center">
                            {error}
                        </Typography>
                    </Box>
                )}

                <TextField
                    label="Username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    fullWidth
                    required
                    margin="normal"
                    variant="outlined"
                    disabled={loading}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <AccountCircle color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    label="Password"
                    // 4. Dynamically set type based on state
                    type={showPassword ? 'text' : 'password'} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    required
                    margin="normal"
                    variant="outlined"
                    disabled={loading}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Lock color="action" />
                            </InputAdornment>
                        ),
                        // 5. Add End Adornment for the Toggle Button
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={loading || !username || !password}
                    sx={{ mt: 3, py: 1.5, borderRadius: 2 }}
                >
                    {loading ? 'Logging In...' : 'Login'}
                </Button>
            </LoginContainer>
        </Box>
    );
};

export default BHCLogin;
