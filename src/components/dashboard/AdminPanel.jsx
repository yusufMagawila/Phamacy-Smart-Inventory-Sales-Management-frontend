import React from 'react';
import {
    Box, Typography, Grid,
    CardContent, CardActions, useTheme, Divider
} from '@mui/material';
import {
    AddCircleOutline, Dashboard, PeopleAlt
} from '@mui/icons-material';
import { red, purple, blue } from '@mui/material/colors';

// Import shared styled components and external components
import { GradientButton, GlassCard, FloatingIcon } from './BHCPharmacyDashboard';
import ActivityLogViewer from '../ActivityLogViewer';
import UserManagementTable from './UserManagementTable'; // ✅ NEW COMPONENT IMPORT

const AdminPanel = ({ 
    user, 
    handleOpenUserRegistrationModal, 
    // ✅ NEW PROPS
    users,
    loadingUsers,
    fetchUsers,
    handleOpenResetPasswordModal,
    handleDeleteUser 
}) => {
    const theme = useTheme();

    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <Typography variant="h3" sx={{ 
                    background: `linear-gradient(90deg, ${purple[600]}, ${red[500]})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold',
                    mb: 3
                }}>
                    🔒 Admin Panel
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Welcome, {user?.name || 'Admin'} ({user?.role || 'administrator'}). Manage users and system activities here.
                </Typography>
            </Grid>
            
            {/* --- USER MANAGEMENT SECTION --- */}
            <Grid item xs={12}>
                <Divider sx={{ my: 2, borderColor: purple[200] }}>
                    <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                        User Management
                    </Typography>
                </Divider>
            </Grid>

            {/* 1. Register New Users Card */}
            <Grid item xs={12} md={6}>
                <GlassCard color={purple[600]}>
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    User Registration
                                </Typography>
                                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                    Create new user accounts and assign roles (Cashier/Admin).
                                </Typography>
                            </Box>
                            <FloatingIcon>
                                <AddCircleOutline sx={{ fontSize: 30 }} />
                            </FloatingIcon>
                        </Box>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', p: 2, position: 'relative', zIndex: 1 }}>
                        <GradientButton 
                            gradientColor={purple}
                            onClick={handleOpenUserRegistrationModal} 
                        >
                            Register New User
                        </GradientButton>
                    </CardActions>
                </GlassCard>
            </Grid>

            {/* 2. System Activity Log Card (Remains the same) */}
            <Grid item xs={12} md={6}>
                <GlassCard color={red[600]}>
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    System Activity Log
                                </Typography>
                                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                    View a chronological record of all user actions in the system.
                                </Typography>
                            </Box>
                            <FloatingIcon>
                                <Dashboard sx={{ fontSize: 30 }} />
                            </FloatingIcon>
                        </Box>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', p: 2, position: 'relative', zIndex: 1 }}>
                        <GradientButton 
                            gradientColor={red}
                            onClick={() => console.log('Viewing Activity Log...')}
                        >
                            View Activity Log
                        </GradientButton>
                    </CardActions>
                </GlassCard>
            </Grid>
            
            {/* 3. Users Table */}
            <Grid item xs={12}>
                <UserManagementTable
                    users={users}
                    loading={loadingUsers}
                    fetchUsers={fetchUsers}
                    handleOpenResetPasswordModal={handleOpenResetPasswordModal}
                    handleDeleteUser={handleDeleteUser}
                />
            </Grid>
            
            {/* 4. Activity Log Viewer Component */}
            <Grid item xs={12}>
                <ActivityLogViewer /> 
            </Grid>
        </Grid>
    );
};

export default AdminPanel;