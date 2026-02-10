import React, { useState } from 'react';
import {
    Modal, Box, Typography, TextField, Button, IconButton,
    CircularProgress, alpha
} from '@mui/material';
import { Close, LockReset } from '@mui/icons-material';
import { purple, red } from '@mui/material/colors';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/utilityFunctions';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 450,
    bgcolor: 'background.paper',
    borderRadius: 3,
    boxShadow: 24,
    p: 4,
};

const ResetPasswordModal = ({ open, onClose, user, onPasswordResetSuccess }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleClose = () => {
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        onClose();
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        
        if (!user || !user.id) {
            setError('Error: No user selected for password reset.');
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            await axios.put(`${API_BASE_URL}/admin/users/${user.id}/reset-password`, { // 💡 ASSUMED RESET PASSWORD ENDPOINT
                newPassword: newPassword,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            onPasswordResetSuccess(`Password for ${user.name || user.email} has been successfully reset.`);
            
        } catch (err) {
            console.error('Password Reset Error:', err);
            setError(err.response?.data?.message || 'Failed to reset password. Please check the network connection or server logs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style} component="form" onSubmit={handleReset}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: purple[600] }}>
                        Reset Password
                    </Typography>
                    <IconButton onClick={handleClose}>
                        <Close />
                    </IconButton>
                </Box>

                <Typography variant="subtitle1" gutterBottom>
                    User: <Typography component="span" fontWeight="bold">{user?.name || user?.email || 'N/A'}</Typography>
                </Typography>

                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="newPassword"
                    label="New Password"
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoFocus
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {error && (
                    <Typography color={red[500]} sx={{ mt: 1 }}>
                        {error}
                    </Typography>
                )}

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                        mt: 3, mb: 2,
                        background: `linear-gradient(45deg, ${purple[500]}, ${purple[700]})`,
                        '&:hover': {
                            background: `linear-gradient(45deg, ${purple[600]}, ${purple[800]})`,
                        }
                    }}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockReset />}
                >
                    {loading ? 'Processing...' : 'Reset Password'}
                </Button>
            </Box>
        </Modal>
    );
};

export default ResetPasswordModal;