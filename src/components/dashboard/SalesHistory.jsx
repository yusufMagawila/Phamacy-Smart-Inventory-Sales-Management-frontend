import React from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, LinearProgress, useTheme,
    alpha
} from '@mui/material';
import { Refresh, TrendingUp, ShoppingCart } from '@mui/icons-material';
import { green, teal } from '@mui/material/colors';

// Import shared styled components and external components
import { GradientButton, AnimatedPaper } from './BHCPharmacyDashboard';
import SaleHistoryRow from '../SalesHistoryRow';

const SalesHistory = ({ salesHistory, loading, fetchSalesHistory, handleOpenNewSaleModal }) => {
    const theme = useTheme();

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
                <Typography variant="h3" sx={{ 
                    background: `linear-gradient(90deg, ${green[500]}, ${teal[500]})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold'
                }}>
                    💰 Sales & Transactions
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                    <GradientButton 
                        gradientColor={green}
                        startIcon={<TrendingUp />} 
                        onClick={handleOpenNewSaleModal}
                    >
                        Process New Sale
                    </GradientButton>
                    <IconButton 
                        onClick={fetchSalesHistory}
                        sx={{
                            background: `linear-gradient(45deg, ${green[500]}, ${teal[500]})`,
                            color: 'white',
                            '&:hover': {
                                transform: 'rotate(180deg)',
                                transition: 'transform 0.6s ease'
                            }
                        }}
                    >
                        <Refresh />
                    </IconButton>
                </Box>
            </Box>

            <AnimatedPaper>
                {loading ? (
                    <LinearProgress sx={{ 
                        height: 4,
                        borderRadius: 2,
                        background: alpha(green[500], 0.2),
                        '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${green[500]}, ${teal[500]})`,
                            borderRadius: 2
                        }
                    }} />
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ 
                                background: `linear-gradient(90deg, ${alpha(green[500], 0.1)}, ${alpha(teal[500], 0.1)})`,
                                '& .MuiTableCell-root': {
                                    fontWeight: 'bold',
                                    color: green[700],
                                    fontSize: '1rem',
                                }
                            }}>
                                <TableRow>
                                    <TableCell>Receipt Details</TableCell>
                                    <TableCell>Sale Date</TableCell>
                                    <TableCell>Cashier</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell align="right">Total Amount</TableCell>
                                    <TableCell>Details</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {salesHistory.map((sale, index) => (
                                    <SaleHistoryRow key={sale.id} sale={sale} index={index} />
                                ))}
                                {salesHistory.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                            <Box sx={{ 
                                                p: 4, 
                                                color: 'text.secondary',
                                                background: `linear-gradient(90deg, ${alpha(theme.palette.background.paper, 0.8)}, transparent)`,
                                                borderRadius: 3,
                                                border: `2px dashed ${theme.palette.divider}`
                                            }}>
                                                <ShoppingCart sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                                <Typography variant="h6" color="text.disabled">
                                                    No sales recorded yet
                                                </Typography>
                                                <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                                                    Process your first sale to see transaction history
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </AnimatedPaper>
        </Box>
    );
};

export default SalesHistory;