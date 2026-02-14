import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Paper,
    Table, TableBody, TableCell, TableContainer, TableRow,
    Button, IconButton, Tabs, Tab, Grid,
    Card, CardContent, CardActions,
    LinearProgress, TableHead,
    alpha, useTheme,
    Snackbar,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import {
    LocalPharmacy, Refresh, AddCircleOutline,
    Dashboard, Inventory, ShoppingCart
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { green, orange, blue, red, purple, teal } from '@mui/material/colors';
import axios from 'axios';

// Local Imports
import { formatDateForDisplay, isDateExpired, API_BASE_URL } from '../../utils/utilityFunctions';
import ConfirmationDialog from '../modals/ConfirmationDialog';
import MedicineFormModal from '../modals/MedicineFormModal';
import UploadCSVModal from '../modals/UploadCSVModal';
import NewSaleModal from '../modals/NewSaleModal';
import UserRegistrationModal from '../modals/UserRegistrationModal';
import ResetPasswordModal from '../modals/ResetPasswordModal'; // ✅ NEW MODAL IMPORT

// ✅ NEW COMPONENT IMPORTS
import PharmacyDashboard from './PharmacyDashboard';
import InventoryManagement from './InventoryManagement';
import SalesHistory from './SalesHistory';
import AdminPanel from './AdminPanel';

// Helper function for Snackbar Alert
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// ANIMATIONS & STYLED COMPONENTS (Retained for shared use)
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;
const glowAnimation = keyframes`
  0%, 100% { box-shadow: 0 0 20px ${alpha(blue[500], 0.3)}; }
  50% { box-shadow: 0 0 30px ${alpha(blue[500], 0.6)}; }
`;
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;
export const AnimatedPaper = styled(Paper)(({ theme }) => ({
    borderRadius: 20,
    background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
    boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
    padding: theme.spacing(4),
    marginBottom: theme.spacing(4),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    animation: `${slideIn} 0.6s ease-out`,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: `linear-gradient(90deg, ${blue[500]}, ${teal[500]})`,
    }
}));
export const GlassCard = styled(Card)(({ theme, color = blue[500] }) => ({
    background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.8)})`,
    color: '#fff',
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha('#fff', 0.2)}`,
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        transform: 'translateY(-12px) scale(1.02)',
        boxShadow: `0 20px 40px ${alpha(color, 0.4)}`,
        animation: `${glowAnimation} 2s infinite`,
    },
}));
export const FloatingIcon = styled(Box)(({ theme }) => ({
    animation: `${floatAnimation} 3s ease-in-out infinite`,
    background: alpha('#fff', 0.2),
    borderRadius: '50%',
    padding: theme.spacing(1.5),
    display: 'inline-flex',
    backdropFilter: 'blur(5px)',
}));
export const GradientButton = styled(Button, {
    shouldForwardProp: (prop) => prop !== 'gradientColor',
})(({ theme, gradientColor = blue }) => ({
    background: `linear-gradient(45deg, ${gradientColor[500]}, ${gradientColor[700]})`,
    borderRadius: 12,
    padding: '12px 24px',
    fontWeight: 'bold',
    textTransform: 'none',
    boxShadow: `0 4px 15px ${alpha(gradientColor[500], 0.3)}`,
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    color: '#fff',
}));
export const StyledTabs = styled(Tabs)(({ theme }) => ({
    '& .MuiTab-root': {
        textTransform: 'none',
        fontWeight: '600',
        fontSize: '1rem',
        minHeight: 60,
        color: theme.palette.text.secondary,
        transition: 'all 0.3s ease',
        borderRadius: 12,
        margin: '0 4px',
    },
    '& .MuiTabs-indicator': {
        height: 4,
        borderRadius: 2,
        background: `linear-gradient(90deg, ${blue[500]}, ${teal[500]})`,
    },
}));
export const SearchInput = styled('input')(({ theme }) => ({
    width: '100%',
    padding: '16px 20px',
    marginBottom: '20px',
    borderRadius: 12,
    border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    outline: 'none',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    background: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(10px)',
}));


const BHCPharmacyDashboard = ({ useAuthProp }) => {
    const theme = useTheme();
    const { isAuthenticated, logout, user, isAdmin } = useAuthProp; 
    
    // --- STATE MANAGEMENT ---
    const [tabValue, setTabValue] = useState(0);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [openMedicineFormModal, setOpenMedicineFormModal] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [openCSVModal, setOpenCSVModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ open: false, id: null, name: '', type: '' }); // type: 'medicine' or 'user'
    const [openNewSaleModal, setOpenNewSaleModal] = useState(false);
    const [salesHistory, setSalesHistory] = useState([]);
    const [dashboardData, setDashboardData] = useState({ lowStockCount: 0, totalInventoryValue: 0.00, todaysRevenue: 0.00 });
    const [openUserRegistrationModal, setOpenUserRegistrationModal] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    // ✅ NEW USER MANAGEMENT STATE
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [openResetPasswordModal, setOpenResetPasswordModal] = useState(false);
    const [resetPasswordUser, setResetPasswordUser] = useState(null);

    // --- HANDLERS (RETAINED) ---
    const handleChangeTab = (event, newValue) => { setTabValue(newValue); };
    const handleOpenAddMedicineModal = () => { setSelectedMedicine(null); setOpenMedicineFormModal(true); };
    const handleOpenEditMedicineModal = (medicine) => { setSelectedMedicine(medicine); setOpenMedicineFormModal(true); };
    const handleCloseMedicineFormModal = () => { setOpenMedicineFormModal(false); setSelectedMedicine(null); };
    const handleOpenCSVModal = () => setOpenCSVModal(true);
    const handleCloseCSVModal = () => setOpenCSVModal(false);
    const handleOpenNewSaleModal = () => setOpenNewSaleModal(true);
    const handleCloseNewSaleModal = () => setOpenNewSaleModal(false);
    const handleOpenUserRegistrationModal = () => setOpenUserRegistrationModal(true);
    const handleCloseUserRegistrationModal = () => { setOpenUserRegistrationModal(false); fetchUsers(); }; // Refresh user list on close
    const handleRegistrationSuccess = (message) => {
        setSnackbar({ open: true, message: message || 'User registered successfully!', severity: 'success' });
    };
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') { return; }
        setSnackbar({ ...snackbar, open: false });
    };
    
    // --- NEW USER MANAGEMENT HANDLERS ---
    const handleOpenResetPasswordModal = (user) => {
        setResetPasswordUser(user);
        setOpenResetPasswordModal(true);
    };
    const handleCloseResetPasswordModal = () => {
        setResetPasswordUser(null);
        setOpenResetPasswordModal(false);
    };
    const handlePasswordResetSuccess = (message) => {
        handleCloseResetPasswordModal();
        setSnackbar({ open: true, message: message || 'Password reset successfully!', severity: 'success' });
    };

    // --- DATA FETCHING ---
    const fetchInventory = useCallback(async (search = '') => {
      
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_BASE_URL}/api/pharmacy/inventory`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { search }
            });
            const inventory = response.data || [];
            setMedicines(inventory);
            
            const lowStockCount = inventory.filter(med => med.quantity <= med.reorderLevel).length;
            const totalInventoryValue = inventory.reduce((sum, med) => sum + (med.quantity * med.costPrice), 0);
            
            setDashboardData(prev => ({
                ...prev,
                lowStockCount,
                totalInventoryValue,
            }));

        } catch (error) {
            console.error('Error fetching inventory:', error);
            setMedicines([]); 
        } finally {
            setLoading(false);
        }
    }, [])

    const fetchDashboardSummary = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn("No auth token found");
        return;
    }

    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/pharmacy/dashboard/summary`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        setDashboardData(prev => ({
            ...prev,
            lowStockCount: response.data.lowStockCount,
            totalInventoryValue: response.data.totalInventoryValue,
            todaysRevenue: response.data.todaysRevenue
        }));

    } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
    }
}, [API_BASE_URL]);


    const fetchSalesHistory = useCallback(async () => {
        // ... (Sales history fetching logic remains the same) ...
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_BASE_URL}/api/pharmacy/sales/history`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const sales = response.data || [];
            setSalesHistory(sales);
            
            const todaysRevenue = sales
                .filter(sale => formatDateForDisplay(sale.createdAt).startsWith(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })))
                .reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);

            setDashboardData(prev => ({ ...prev, todaysRevenue }));

        } catch (error) {
            console.error('Error fetching sales history:', error);
            setSalesHistory([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        setLoadingUsers(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin/users`, { // 💡 ASSUMED USER API ENDPOINT
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setSnackbar({ open: true, message: 'Failed to load user list.', severity: 'error' });
            setUsers([]);
        } finally {
            setLoadingUsers(false);
        }
    }, []);

    const handleRefresh = useCallback(() => {
        fetchInventory(searchQuery);
        fetchSalesHistory();
        if (isAdmin && tabValue === 3) { // Only fetch users if Admin and on Admin tab
            fetchUsers();
        }
    }, [fetchInventory, fetchSalesHistory, fetchUsers, searchQuery, isAdmin, tabValue]);

    useEffect(() => {
        if (isAuthenticated) {
            handleRefresh();
        }
    }, [isAuthenticated, handleRefresh]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (tabValue === 1) {
                fetchInventory(searchQuery);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, fetchInventory, tabValue]);
    
    useEffect(() => {
        // Fetch users when navigating to the Admin tab
        if (isAdmin && tabValue === 3) {
            fetchUsers();
        }
    }, [isAdmin, tabValue, fetchUsers]);


    // --- DELETE LOGIC (UPDATED TO HANDLE BOTH MEDICINE AND USER) ---
    const handleOpenDeleteConfirmation = (id, name, type) => {
        setDeleteConfirmation({ open: true, id, name, type });
    };

    const handleDelete = async () => {
        const { id, name, type } = deleteConfirmation;
        setDeleteConfirmation({ open: false, id: null, name: '', type: '' });
        
        const token = localStorage.getItem('token');
        
        try {
            if (type === 'medicine') {
                await axios.delete(`${API_BASE_URL}/api/pharmacy/inventory/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                handleRefresh();
                setSnackbar({ open: true, message: `${name} deleted successfully.`, severity: 'success' });

            } else if (type === 'user') {
                await axios.delete(`${API_BASE_URL}/api/admin/users/${id}`, { // 💡 ASSUMED USER DELETE ENDPOINT
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchUsers();
                setSnackbar({ open: true, message: `User ${name} deleted successfully.`, severity: 'success' });
            }
        } catch (error) {
            console.error('Delete Error:', error.response?.data?.message || `Failed to delete ${type}.`);
            setSnackbar({ 
                open: true, 
                message: error.response?.data?.message || `Error: Failed to delete ${type}.`, 
                severity: 'error' 
            });
        }
    };
    
    // Pass the correct handler for medicine deletion to InventoryManagement
    const handleDeleteMedicine = (id, name) => handleOpenDeleteConfirmation(id, name, 'medicine');
    const handleDeleteUser = (id, name) => handleOpenDeleteConfirmation(id, name, 'user');

    const lowStockMedicines = medicines.filter(med => med.quantity <= med.reorderLevel);

    // --- RENDER TAB CONTENT ---
    const renderTabContent = () => {
        switch (tabValue) {
            case 0:
                return (
                    <PharmacyDashboard
                        dashboardData={dashboardData}
                        lowStockMedicines={lowStockMedicines}
                        setTabValue={setTabValue}
                        formatDateForDisplay={formatDateForDisplay}
                    />
                );
            case 1:
                return (
                    <InventoryManagement
                        medicines={medicines}
                        loading={loading}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        handleRefresh={handleRefresh}
                        handleOpenAddMedicineModal={handleOpenAddMedicineModal}
                        handleOpenCSVModal={handleOpenCSVModal}
                        handleOpenEditMedicineModal={handleOpenEditMedicineModal}
                        handleOpenDeleteConfirmation={handleDeleteMedicine} // Use specific medicine handler
                        isDateExpired={isDateExpired}
                        formatDateForDisplay={formatDateForDisplay}
                    />
                );
            case 2:
                return (
                    <SalesHistory
                        salesHistory={salesHistory}
                        loading={loading}
                        fetchSalesHistory={fetchSalesHistory}
                        handleOpenNewSaleModal={handleOpenNewSaleModal}
                    />
                );
            case 3:
                return (
                    <AdminPanel
                        user={user}
                        handleOpenUserRegistrationModal={handleOpenUserRegistrationModal}
                        // ✅ NEW USER MANAGEMENT PROPS
                        users={users}
                        loadingUsers={loadingUsers}
                        fetchUsers={fetchUsers}
                        handleOpenResetPasswordModal={handleOpenResetPasswordModal}
                        handleDeleteUser={handleDeleteUser}
                    />
                );
            default:
                return (
                    <PharmacyDashboard
                        dashboardData={dashboardData}
                        lowStockMedicines={lowStockMedicines}
                        setTabValue={setTabValue}
                        formatDateForDisplay={formatDateForDisplay}
                    />
                );
        }
    };

    if (!isAuthenticated) {
        // ... (Login required message) ...
    }

    return (
        <Box sx={{ p: 4, minHeight: '100vh', background: `linear-gradient(135deg, ${alpha(blue[50], 0.3)}, ${alpha(teal[50], 0.3)})`, backgroundAttachment: 'fixed' }}>
            {/* ... Header and Tabs UI (Retained) ... */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={6} flexWrap="wrap" gap={3}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Box sx={{
                        background: `linear-gradient(135deg, ${blue[500]}, ${teal[500]})`,
                        borderRadius: 4,
                        p: 2,
                        animation: `${glowAnimation} 3s infinite`
                    }}>
                        <LocalPharmacy sx={{ fontSize: 48, color: 'white' }} />
                    </Box>
                    <Box>
                        <Typography variant="h2" component="h1" sx={{ 
                            fontWeight: 'bold',
                            background: `linear-gradient(90deg, ${blue[500]}, ${teal[500]}, ${purple[500]})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            lineHeight: 1.2
                        }}>
                                Mahonda Pharmacy
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ mt: 0.5 }}>
                            Smart Inventory & Sales Management
                        </Typography>
                    </Box>
                </Box>
                <GradientButton 
                    gradientColor={red}
                    onClick={logout}
                >
                    🚪 Logout
                </GradientButton>
            </Box>

            <StyledTabs 
                value={tabValue} 
                onChange={handleChangeTab} 
                sx={{ 
                    mb: 4,
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    p: 1
                }}
            >
                <Tab icon={<Dashboard sx={{ mr: 1 }} />} iconPosition="start" label="Dashboard & Alerts" />
                <Tab icon={<Inventory sx={{ mr: 1 }} />} iconPosition="start" label="Inventory" />
                <Tab icon={<ShoppingCart sx={{ mr: 1 }} />} iconPosition="start" label="Sales History" />
                {isAdmin && (
                    <Tab icon={<LocalPharmacy sx={{ mr: 1 }} />} iconPosition="start" label="Admin" />
                )}
            </StyledTabs>
            
            {renderTabContent()}
            
            {/* Modals (Retained) */}
            <MedicineFormModal open={openMedicineFormModal} onClose={handleCloseMedicineFormModal} medicine={selectedMedicine} onSaveSuccess={handleRefresh} />
            <UploadCSVModal open={openCSVModal} onClose={handleCloseCSVModal} onUploadSuccess={handleRefresh} />
            <NewSaleModal 
                open={openNewSaleModal} 
                onClose={handleCloseNewSaleModal} 
                inventory={medicines} 
                onSaleSuccess={handleRefresh} 
            />
            <UserRegistrationModal
                open={openUserRegistrationModal}
                onClose={handleCloseUserRegistrationModal}
                onRegisterSuccess={handleRegistrationSuccess}
            />
            
            {/* ✅ NEW RESET PASSWORD MODAL */}
            <ResetPasswordModal
                open={openResetPasswordModal}
                onClose={handleCloseResetPasswordModal}
                user={resetPasswordUser}
                onPasswordResetSuccess={handlePasswordResetSuccess}
            />

            {/* Confirmation Dialog (Updated Content Logic) */}
            <ConfirmationDialog
                open={deleteConfirmation.open}
                title={`Confirm ${deleteConfirmation.type === 'user' ? 'User' : 'Medicine'} Deletion`}
                content={deleteConfirmation.type === 'user' 
                    ? `Are you sure you want to delete the user: ${deleteConfirmation.name}? This action cannot be undone.`
                    : `Are you sure you want to delete the medicine: ${deleteConfirmation.name}? This action cannot be undone.`
                }
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirmation({ open: false, id: null, name: '', type: '' })}
            />

            {/* Snackbar for success/error messages */}
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default BHCPharmacyDashboard;
