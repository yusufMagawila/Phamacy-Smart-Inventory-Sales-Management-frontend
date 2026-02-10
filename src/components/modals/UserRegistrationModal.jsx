// --- src/components/modals/UserRegistrationModal.jsx ---

import React, { useState } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, TextField, Select, MenuItem, InputLabel, 
    FormControl, Grid, Typography, LinearProgress 
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/utilityFunctions';


const UserRegistrationModal = ({ open, onClose, onRegisterSuccess }) => {
    const [formData, setFormData] = useState({
        // Updated field from 'name' to 'username' (to match Sequelize model)
        username: '', 
        // Updated field from 'email' to 'phoneNumber'
        phoneNumber: '', 
        password: '',
        role: 'cashier' // Default to cashier
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async () => {
        setError(null);
        setIsLoading(true);

        // Client-Side Validation: Check username, phone number, and password
        if (!formData.username || !formData.phoneNumber || !formData.password) {
            setError('Please fill in all required fields (Username, Phone Number, and Password).');
            setIsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            
            const response = await axios.post(
                `${API_BASE_URL}/admin/users/register`,
                formData, // Sends { username, phoneNumber, password, role }
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Pass the Admin's token
                        'Content-Type': 'application/json',
                    }
                }
            );

            console.log('User Registered:', response.data.user);
            
            // Clear the form, close the modal, and notify the dashboard
            setFormData({ username: '', phoneNumber: '', password: '', role: 'cashier' });
            onRegisterSuccess(response.data.message);
            onClose();

        } catch (err) {
            console.error('Registration Error:', err.response || err);
            const errorMessage = err.response?.data?.message || 'Registration failed due to a server error or invalid data.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Reset state on close
    const handleClose = () => {
        setFormData({ username: '', phoneNumber: '', password: '', role: 'cashier' });
        setError(null);
        setIsLoading(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', bgcolor: 'primary.main', color: 'white' }}>
                <PersonAdd sx={{ mr: 1 }} /> Register New User
            </DialogTitle>
            <DialogContent dividers>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Use this form to create new user accounts and assign their roles within the system.
                </Typography>
                {isLoading && <LinearProgress sx={{ mb: 2 }} />}
                {error && (
                    <Typography color="error" variant="body2" sx={{ mb: 2, p: 1, border: '1px solid', borderColor: 'error.main', borderRadius: 1 }}>
                        {error}
                    </Typography>
                )}
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Username" // Label updated
                            name="username" // Name attribute updated
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Phone Number" // Label updated
                            name="phoneNumber" // Name attribute updated
                            type="tel" // Use 'tel' type for better mobile support
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Password (min 8 characters)"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required>
                            <InputLabel id="role-select-label">Role</InputLabel>
                            <Select
                                labelId="role-select-label"
                                label="Role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <MenuItem value="cashier">Cashier</MenuItem>
                                <MenuItem value="Admin">Admin</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="inherit">
                    Cancel
                </Button>
                <Button 
                    onClick={handleRegister} 
                    color="primary" 
                    variant="contained" 
                    // Disabled check updated for new fields
                    disabled={isLoading || !formData.username || !formData.phoneNumber || !formData.password}
                >
                    {isLoading ? 'Registering...' : 'Register User'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserRegistrationModal;