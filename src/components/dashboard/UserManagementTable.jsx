import React from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, LinearProgress, useTheme, Chip,
    alpha
} from '@mui/material';
import {
    Refresh, Delete, LockReset, PeopleAlt
} from '@mui/icons-material';
import { green, blue, red, purple, teal, grey } from '@mui/material/colors';

// Import shared styled components from the main file
import { AnimatedPaper, GradientButton } from './BHCPharmacyDashboard';

const UserManagementTable = ({
    users,
    loading,
    fetchUsers,
    handleOpenResetPasswordModal,
    handleDeleteUser,
}) => {
    const theme = useTheme();
    
    // Helper function for Role Chip color
    const getRoleColor = (role) => {
        switch (role.toUpperCase()) {
            case 'ADMIN':
                return { background: red[50], color: red[700] };
            case 'CASHIER':
                return { background: blue[50], color: blue[700] };
            default:
                return { background: grey[50], color: grey[700] };
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
                <Typography variant="h4" sx={{ 
                    background: `linear-gradient(90deg, ${blue[500]}, ${purple[500]})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <PeopleAlt sx={{ fontSize: 32 }} /> Registered Users
                </Typography>
                <IconButton 
                    onClick={fetchUsers}
                    sx={{
                        background: `linear-gradient(45deg, ${blue[500]}, ${purple[500]})`,
                        color: 'white',
                        '&:hover': {
                            transform: 'rotate(180deg)',
                            transition: 'transform 0.6s ease'
                        }
                    }}
                    disabled={loading}
                >
                    <Refresh />
                </IconButton>
            </Box>

            <AnimatedPaper sx={{ p: 0 }}>
                {loading && <LinearProgress sx={{ 
                    height: 4,
                    borderRadius: 2,
                    background: alpha(theme.palette.primary.main, 0.2),
                    '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${blue[500]}, ${purple[500]})`,
                        borderRadius: 2
                    }
                }} />}
                
                <TableContainer>
                    <Table>
                        <TableHead sx={{ 
                            background: `linear-gradient(90deg, ${alpha(blue[500], 0.1)}, ${alpha(purple[500], 0.1)})`,
                            '& .MuiTableCell-root': {
                                fontWeight: 'bold',
                                color: blue[700],
                                fontSize: '1rem',
                            }
                        }}>
                            <TableRow>
                                <TableCell>User ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Email / Username</TableCell>
                                <TableCell align="center">Role</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.length > 0 ? (
                                users.map((userItem, index) => {
                                    const { background, color } = getRoleColor(userItem.role);

                                    return (
                                        <TableRow 
                                            key={userItem.id}
                                            sx={{
                                                '&:last-child td, &:last-child th': { border: 0 },
                                                '&:hover': {
                                                    background: alpha(purple[500], 0.05),
                                                    transform: 'scale(1.01)',
                                                    transition: 'all 0.3s ease'
                                                }
                                            }}
                                        >
                                            <TableCell component="th" scope="row">
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {userItem.id}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body1" fontWeight="600">
                                                    {userItem.name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {userItem.email || userItem.username}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip 
                                                    label={userItem.role}
                                                    sx={{ 
                                                        background: background, 
                                                        color: color, 
                                                        fontWeight: 'bold' 
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box display="flex" gap={1} justifyContent="center">
                                                    <IconButton 
                                                        onClick={() => handleOpenResetPasswordModal(userItem)}
                                                        size="small"
                                                        sx={{ color: purple[600], '&:hover': { background: purple[50] } }}
                                                        title="Reset Password"
                                                    >
                                                        <LockReset />
                                                    </IconButton>
                                                    <IconButton 
                                                        onClick={() => handleDeleteUser(userItem.id, userItem.name || userItem.email)}
                                                        size="small"
                                                        sx={{ color: red[600], '&:hover': { background: red[50] } }}
                                                        title="Delete User"
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                        <Typography variant="h6" color="text.disabled">
                                            No users found.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </AnimatedPaper>
        </Box>
    );
};

export default UserManagementTable;