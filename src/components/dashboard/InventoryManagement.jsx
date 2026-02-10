import React from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, LinearProgress, useTheme,
    alpha
} from '@mui/material';
import {
    Refresh, AddCircleOutline, Edit, Delete,
    UploadFile, Warning as WarningIcon
} from '@mui/icons-material';
import { green, orange, blue, red, teal, purple } from '@mui/material/colors';

// Import shared styled components from the main file
import { GradientButton, AnimatedPaper, SearchInput } from './BHCPharmacyDashboard';

const InventoryManagement = ({
    medicines,
    loading,
    searchQuery,
    setSearchQuery,
    handleRefresh,
    handleOpenAddMedicineModal,
    handleOpenCSVModal,
    handleOpenEditMedicineModal,
    handleOpenDeleteConfirmation,
    isDateExpired,
    formatDateForDisplay,
}) => {
    const theme = useTheme();
    
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
                <Typography variant="h3" sx={{ 
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${purple[500]})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold'
                }}>
                    📦 Inventory Management
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                    <GradientButton 
                        gradientColor={green}
                        startIcon={<AddCircleOutline />} 
                        onClick={handleOpenAddMedicineModal}
                    >
                        Add Medicine
                    </GradientButton>
                    <GradientButton 
                        gradientColor={teal}
                        startIcon={<UploadFile />} 
                        onClick={handleOpenCSVModal}
                    >
                        CSV Upload
                    </GradientButton>
                    <IconButton 
                        onClick={handleRefresh}
                        sx={{
                            background: `linear-gradient(45deg, ${blue[500]}, ${purple[500]})`,
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
                <SearchInput 
                    type="text" 
                    placeholder="🔍 Search Inventory by Name or SKU..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                {loading ? (
                    <LinearProgress sx={{ 
                        height: 4,
                        borderRadius: 2,
                        background: alpha(theme.palette.primary.main, 0.2),
                        '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${blue[500]}, ${teal[500]})`,
                            borderRadius: 2
                        }
                    }} />
                ) : (
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
                                    <TableCell>Medicine Details</TableCell>
                                    <TableCell>Batch #</TableCell>
                                    <TableCell align="center">Stock Level</TableCell>
                                    <TableCell align="center">Pricing</TableCell>
                                    <TableCell>Expiry</TableCell>
                                    <TableCell>Reorder</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {medicines.map((medicine, index) => {
                                    const isExpired = isDateExpired(medicine.expiryDate);
                                    const isLowStock = medicine.quantity <= medicine.reorderLevel;

                                    return (
                                        <TableRow 
                                            key={medicine.id}
                                            sx={{
                                                // animation: `${slideIn} 0.5s ease-out ${index * 0.1}s both`, // Removed slideIn
                                                background: isExpired 
                                                    ? `linear-gradient(90deg, ${alpha(red[500], 0.08)}, transparent)`
                                                    : isLowStock 
                                                    ? `linear-gradient(90deg, ${alpha(orange[500], 0.08)}, transparent)`
                                                    : 'inherit',
                                                '&:last-child td, &:last-child th': { border: 0 },
                                                '&:hover': {
                                                    background: isExpired 
                                                        ? `linear-gradient(90deg, ${alpha(red[500], 0.12)}, ${alpha(red[500], 0.08)})`
                                                        : isLowStock 
                                                        ? `linear-gradient(90deg, ${alpha(orange[500], 0.12)}, ${alpha(orange[500], 0.08)})`
                                                        : `linear-gradient(90deg, ${alpha(blue[500], 0.05)}, ${alpha(teal[500], 0.05)})`,
                                                    transform: 'scale(1.01)',
                                                    transition: 'all 0.3s ease'
                                                }
                                            }}
                                        >
                                            <TableCell component="th" scope="row">
                                                <Typography variant="subtitle1" fontWeight="600">
                                                    {medicine.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    SKU: {medicine.sku}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {medicine.batchNumber}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    background: isLowStock ? orange[50] : green[50],
                                                    color: isLowStock ? orange[700] : green[700],
                                                    px: 2,
                                                    py: 0.5,
                                                    borderRadius: 8,
                                                    fontWeight: 'bold',
                                                    border: `2px solid ${isLowStock ? orange[200] : green[200]}`
                                                }}>
                                                    {medicine.quantity}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box>
                                                    <Typography variant="body2" fontWeight="600">
                                                        TZS{parseFloat(medicine.unitPrice).toFixed(2)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Cost: TZS{parseFloat(medicine.costPrice).toFixed(2)}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    {isExpired && <WarningIcon color="error" sx={{ fontSize: 18, mr: 1 }} />}
                                                    <Typography variant="body2" color={isExpired ? 'error' : 'text.primary'}>
                                                        {formatDateForDisplay(medicine.expiryDate)}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    background: blue[50],
                                                    color: blue[700],
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: 6,
                                                    fontSize: '0.875rem'
                                                }}>
                                                    {medicine.reorderLevel}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" gap={0.5}>
                                                    <IconButton 
                                                        onClick={() => handleOpenEditMedicineModal(medicine)}
                                                        sx={{
                                                            background: `linear-gradient(45deg, ${blue[500]}, ${teal[500]})`,
                                                            color: 'white',
                                                            '&:hover': {
                                                                transform: 'scale(1.1)'
                                                            }
                                                        }}
                                                    >
                                                        <Edit />
                                                    </IconButton>
                                                    <IconButton 
                                                        onClick={() => handleOpenDeleteConfirmation(medicine.id, medicine.name)}
                                                        sx={{
                                                            background: `linear-gradient(45deg, ${red[500]}, ${orange[500]})`,
                                                            color: 'white',
                                                            '&:hover': {
                                                                transform: 'scale(1.1)'
                                                            }
                                                        }}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </AnimatedPaper>
        </Box>
    );
};

export default InventoryManagement;