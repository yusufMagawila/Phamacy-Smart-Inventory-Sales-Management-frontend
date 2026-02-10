import React from 'react';
import {
    Box, Typography, Grid,
    CardContent, CardActions, Button,
    Table, TableBody, TableCell, TableContainer, TableRow, TableHead,
    alpha, useTheme
} from '@mui/material';
import {
    Warning as WarningIcon, AttachMoney,
    Inventory
} from '@mui/icons-material';
import { green, orange, blue, red, teal } from '@mui/material/colors';

// Import shared styled components from the main file
import { AnimatedPaper, GlassCard, FloatingIcon } from './BHCPharmacyDashboard';

const PharmacyDashboard = ({ dashboardData, lowStockMedicines, setTabValue, formatDateForDisplay }) => {
    const theme = useTheme();

    return (
        <Grid container spacing={3}>
            {/* Enhanced KPI Cards */}
            <Grid item xs={12} md={4}>
                <GlassCard color={blue[600]}>
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    TZS{parseFloat(dashboardData.totalInventoryValue).toFixed(2)}
                                </Typography>
                                <Typography variant="h6" sx={{ opacity: 0.9 }}>Total Inventory Value</Typography>
                            </Box>
                            <FloatingIcon>
                                <Inventory sx={{ fontSize: 30 }} />
                            </FloatingIcon>
                        </Box>
                    </CardContent>
                </GlassCard>
            </Grid>
            <Grid item xs={12} md={4}>
                <GlassCard color={green[600]}>
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    TZS{parseFloat(dashboardData.todaysRevenue).toFixed(2)}
                                </Typography>
                                <Typography variant="h6" sx={{ opacity: 0.9 }}>Today's Revenue</Typography>
                            </Box>
                            <FloatingIcon>
                                <AttachMoney sx={{ fontSize: 30 }} />
                            </FloatingIcon>
                        </Box>
                    </CardContent>
                </GlassCard>
            </Grid>
            <Grid item xs={12} md={4}>
                <GlassCard color={red[600]}>
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {dashboardData.lowStockCount}
                                </Typography>
                                <Typography variant="h6" sx={{ opacity: 0.9 }}>Low Stock Items</Typography>
                            </Box>
                            <FloatingIcon>
                                <WarningIcon sx={{ fontSize: 30 }} />
                            </FloatingIcon>
                        </Box>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', p: 2, position: 'relative', zIndex: 1 }}>
                        <Button 
                            size="small" 
                            sx={{ 
                                color: '#fff', 
                                background: alpha('#fff', 0.2),
                                backdropFilter: 'blur(10px)',
                                '&:hover': { background: alpha('#fff', 0.3) }
                            }}
                            onClick={() => setTabValue(1)}
                        >
                            View Inventory
                        </Button>
                    </CardActions>
                </GlassCard>
            </Grid>

            {/* Enhanced Low Stock List */}
            <Grid item xs={12}>
                <Typography variant="h4" gutterBottom sx={{ 
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${teal[500]})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold',
                    mb: 3
                }}>
                    ⚠️ Low Stock Alerts
                </Typography>
                <AnimatedPaper>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ 
                                background: `linear-gradient(90deg, ${alpha(blue[500], 0.1)}, ${alpha(teal[500], 0.1)})`,
                                '& .MuiTableCell-root': {
                                    fontWeight: 'bold',
                                    color: blue[700],
                                    fontSize: '1rem',
                                }
                            }}>
                                <TableRow>
                                    <TableCell>Medicine Name</TableCell>
                                    <TableCell>SKU</TableCell>
                                    <TableCell align="center">Current Stock</TableCell>
                                    <TableCell align="center">Reorder Level</TableCell>
                                    <TableCell>Expiry Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {lowStockMedicines.length > 0 ? (
                                    lowStockMedicines.map((medicine, index) => (
                                        <TableRow 
                                            key={medicine.id}
                                            sx={{ 
                                                // animation: `${slideIn} 0.5s ease-out ${index * 0.1}s both`, // Removed slideIn as it's defined in BHCPharmacyDashboard
                                                '&:last-child td, &:last-child th': { border: 0 },
                                                background: `linear-gradient(90deg, ${alpha(orange[500], 0.05)}, transparent)`,
                                                '&:hover': {
                                                    background: `linear-gradient(90deg, ${alpha(orange[500], 0.1)}, ${alpha(orange[500], 0.05)})`,
                                                    transform: 'scale(1.01)',
                                                    transition: 'all 0.3s ease'
                                                }
                                            }}
                                        >
                                            <TableCell component="th" scope="row">
                                                <Typography variant="subtitle1" fontWeight="600">
                                                    {medicine.name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {medicine.sku}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    background: red[50],
                                                    color: red[700],
                                                    px: 2,
                                                    py: 0.5,
                                                    borderRadius: 8,
                                                    fontWeight: 'bold'
                                                }}>
                                                    {medicine.quantity}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    background: blue[50],
                                                    color: blue[700],
                                                    px: 2,
                                                    py: 0.5,
                                                    borderRadius: 8,
                                                    fontWeight: 'bold'
                                                }}>
                                                    {medicine.reorderLevel}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatDateForDisplay(medicine.expiryDate)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            <Box sx={{ 
                                                p: 4, 
                                                color: green[700], 
                                                background: `linear-gradient(90deg, ${green[50]}, ${alpha(green[100], 0.5)})`,
                                                borderRadius: 2,
                                                border: `2px dashed ${green[200]}`
                                            }}>
                                                🎉 All stock levels are adequate!
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </AnimatedPaper>
            </Grid>
        </Grid>
    );
};

export default PharmacyDashboard;