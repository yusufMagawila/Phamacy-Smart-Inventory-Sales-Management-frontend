// src/components/modals/NewSaleModal.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Alert, TextField, Button, Grid, Dialog, DialogActions, 
    DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer, 
    TableRow, Paper, List, ListItem, ListItemText, IconButton, LinearProgress,TableHead
} from '@mui/material';
import { AddCircleOutline, RemoveCircleOutline, Delete, CheckCircle } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { blue } from '@mui/material/colors';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/utilityFunctions';

// Custom style for table header
const TableHeader = styled(TableHead)(({ theme }) => ({
    backgroundColor: blue[50],
    '& .MuiTableCell-root': {
        fontWeight: 'bold',
        color: blue[700],
    },
}));

/**
 * Modal for processing a new sale transaction.
 */
const NewSaleModal = ({ open, onClose, inventory, onSaleSuccess }) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        setSelectedItems([]);
        setCustomerName('');
        setAlert(null);
    }, [open]);

    // Filter inventory to show only items with stock > 0
    const filteredInventory = inventory.filter(med =>
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) && med.quantity > 0
    );

    const totalAmount = selectedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    const handleAddItem = (medicine) => {
        setAlert(null);
        const existingItem = selectedItems.find(item => item.medicineId === medicine.id);
        if (existingItem) {
            if (existingItem.quantity < medicine.quantity) {
                 handleUpdateItemQuantity(medicine.id, existingItem.quantity + 1);
            } else {
                setAlert({ type: 'warning', message: `Cannot add more than the available stock (${medicine.quantity}).` });
            }
        } else {
            setSelectedItems(prev => [...prev, {
                medicineId: medicine.id,
                name: medicine.name,
                unitPrice: parseFloat(medicine.unitPrice),
                maxQuantity: medicine.quantity,
                quantity: 1
            }]);
        }
    };

    const handleUpdateItemQuantity = (medicineId, newQuantity) => {
        setSelectedItems(prev => prev.map(item => {
            if (item.medicineId === medicineId) {
                const inventoryItem = inventory.find(i => i.id === medicineId);
                const max = inventoryItem ? inventoryItem.quantity : item.maxQuantity;
                
                const quantity = Math.max(1, Math.min(newQuantity, max));
                return { ...item, quantity };
            }
            return item;
        }));
    };

    const handleRemoveItem = (medicineId) => {
        setSelectedItems(prev => prev.filter(item => item.medicineId !== medicineId));
    };

    const handleProcessNewSale = async () => {
    if (selectedItems.length === 0) {
        setAlert({ type: 'warning', message: 'Please add items to the sale.' });
        return;
    }

    setLoading(true);
    setAlert(null);
    const token = localStorage.getItem('token');
    
    try {
        await axios.post(`${API_BASE_URL}/pharmacy/sales/direct`, {
            // FIX APPLIED HERE: Sending the required price and subtotal details
            items: selectedItems.map(item => ({
                medicineId: item.medicineId,
                quantity: item.quantity,
                // These fields are CRITICAL for the SaleItem model data integrity
                pricePerUnit: item.unitPrice, 
                subtotal: item.quantity * item.unitPrice, 
            })),
            customerName: customerName || 'Walk-in Customer',
            totalAmount: totalAmount 
        }, {
            headers: { Authorization: `Bearer ${token}` },
        });

        setAlert({ type: 'success', message: `Sale completed for $${totalAmount.toFixed(2)}.` });
        onSaleSuccess(); // This triggers handleRefresh in the parent component
        setTimeout(onClose, 1500);
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to process sale. Check if stock levels are still sufficient.';
        setAlert({ type: 'error', message: errorMessage });
        console.error('Sale Error:', errorMessage);
    } finally {
        setLoading(false);
    }
};

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>Process New Sale</DialogTitle>
            <DialogContent>
                {alert && <Alert severity={alert.type} sx={{ mb: 2 }}>{alert.message}</Alert>}
                <Grid container spacing={3}>
                    {/* Left Panel: Inventory Search */}
                    <Grid item xs={12} md={5}>
                        <Typography variant="h6" mb={2}>Available Inventory</Typography>
                        <TextField
                            label="Search Medicine (Name or SKU)"
                            fullWidth
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <Paper style={{ maxHeight: 400, overflow: 'auto' }}>
                            <List dense>
                                {filteredInventory.map(medicine => (
                                    <ListItem
                                        key={medicine.id}
                                        secondaryAction={
                                            <IconButton edge="end" aria-label="add" color="primary" onClick={() => handleAddItem(medicine)} disabled={medicine.quantity <= 0}>
                                                <AddCircleOutline />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText
                                            primary={medicine.name}
                                            secondary={`SKU: ${medicine.sku} | Price: TZS${parseFloat(medicine.unitPrice).toFixed(2)} | Stock: ${medicine.quantity}`}
                                        />
                                    </ListItem>
                                ))}
                                {filteredInventory.length === 0 && (
                                    <ListItem><ListItemText primary="No stock available or matches found." sx={{ textAlign: 'center', py: 2 }} /></ListItem>
                                )}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Right Panel: Selected Items */}
                    <Grid item xs={12} md={7}>
                        <Typography variant="h6" mb={2}>Selected Items ({selectedItems.length})</Typography>
                        <TextField
                            label="Customer Name (Optional)"
                            fullWidth
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHeader>
                                    <TableRow>
                                        <TableCell>Medicine</TableCell>
                                        <TableCell align="center">Price</TableCell>
                                        <TableCell align="center">Qty</TableCell>
                                        <TableCell align="right">Subtotal</TableCell>
                                        <TableCell align="center">Action</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedItems.map(item => (
                                        <TableRow key={item.medicineId}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell align="center">TZS{item.unitPrice.toFixed(2)}</TableCell>
                                            <TableCell align="center">
                                                <Box display="flex" alignItems="center">
                                                    <IconButton size="small" onClick={() => handleUpdateItemQuantity(item.medicineId, item.quantity - 1)} disabled={item.quantity <= 1}>
                                                        <RemoveCircleOutline fontSize="small" />
                                                    </IconButton>
                                                    <Typography variant="body2" sx={{ width: 20, textAlign: 'center' }}>{item.quantity}</Typography>
                                                    <IconButton size="small" onClick={() => handleUpdateItemQuantity(item.medicineId, item.quantity + 1)} disabled={item.quantity >= item.maxQuantity}>
                                                        <AddCircleOutline fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">TZS{(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                                            <TableCell align="center">
                                                <IconButton size="small" color="error" onClick={() => handleRemoveItem(item.medicineId)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {selectedItems.length === 0 && (
                                        <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 3 }}>No items selected.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Box sx={{ mt: 3, p: 2, bgcolor: blue[50], borderRadius: 1, textAlign: 'right' }}>
                            <Typography variant="h5" color="primary">
                                TOTAL: TZS{totalAmount.toFixed(2)}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="outlined" disabled={loading}>Cancel</Button>
                <Button onClick={handleProcessNewSale} variant="contained" color="success" disabled={selectedItems.length === 0 || loading} startIcon={<CheckCircle />}>
                    {loading ? 'Processing...' : `Process Sale (TZS${totalAmount.toFixed(2)})`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default NewSaleModal;
