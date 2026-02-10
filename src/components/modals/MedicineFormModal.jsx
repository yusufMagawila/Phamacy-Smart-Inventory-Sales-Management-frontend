// src/components/modals/MedicineFormModal.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Modal, Alert, TextField, Button, Grid, LinearProgress
} from '@mui/material';
import axios from 'axios';
import { formatDateForInput, API_BASE_URL } from '../../utils/utilityFunctions';

/**
 * Modal for adding new or editing existing medicine inventory items.
 */
const MedicineFormModal = ({ open, onClose, medicine, onSaveSuccess }) => {
    const isEdit = medicine && medicine.id;
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [formData, setFormData] = useState({
        name: '', sku: '', batchNumber: '', quantity: 0, unitPrice: 0, costPrice: 0, expiryDate: formatDateForInput(new Date()), reorderLevel: 10, description: ''
    });

    useEffect(() => {
        if (isEdit) {
            // Populate form if editing
            setFormData({
                name: medicine.name || '',
                sku: medicine.sku || '',
                batchNumber: medicine.batchNumber || '',
                quantity: medicine.quantity || 0,
                unitPrice: medicine.unitPrice || 0,
                costPrice: medicine.costPrice || 0,
                expiryDate: formatDateForInput(medicine.expiryDate),
                reorderLevel: medicine.reorderLevel || 10,
                description: medicine.description || ''
            });
        } else {
            // Reset form for adding new item
            setFormData({
                name: '', sku: '', batchNumber: '', quantity: 0, unitPrice: 0, costPrice: 0, expiryDate: formatDateForInput(new Date()), reorderLevel: 10, description: ''
            });
        }
        setAlert(null);
    }, [isEdit, medicine, open]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        setAlert(null);
        // NOTE: Replace with proper Auth Context token retrieval
        const token = localStorage.getItem('token'); 
        const url = isEdit ? `${API_BASE_URL}/pharmacy/inventory/${medicine.id}` : `${API_BASE_URL}/pharmacy/inventory`;
        const method = isEdit ? 'put' : 'post';

        try {
            await axios({
                method,
                url,
                headers: { Authorization: `Bearer ${token}` },
                data: formData
            });
            setAlert({ type: 'success', message: `Medicine ${isEdit ? 'updated' : 'added'} successfully.` });
            onSaveSuccess();
            setTimeout(onClose, 1500); 
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to save medicine.';
            setAlert({ type: 'error', message: errorMessage });
            console.error('Save error:', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: { xs: '90%', sm: 500 }, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2
            }}>
                <Typography variant="h5" mb={2}>{isEdit ? 'Edit Medicine' : 'Add New Medicine'}</Typography>
                {alert && <Alert severity={alert.type} sx={{ mb: 2 }}>{alert.message}</Alert>}
                <Grid container spacing={2}>
                    <Grid item xs={12}><TextField name="name" label="Name" value={formData.name} onChange={handleChange} fullWidth /></Grid>
                    <Grid item xs={6}><TextField name="sku" label="SKU" value={formData.sku} onChange={handleChange} fullWidth /></Grid>
                    <Grid item xs={6}><TextField name="batchNumber" label="Batch Number" value={formData.batchNumber} onChange={handleChange} fullWidth /></Grid>
                    
                    <Grid item xs={6}><TextField label="Quantity" type="number" name="quantity" value={formData.quantity} onChange={handleChange} fullWidth /></Grid>
                    <Grid item xs={6}><TextField label="Unit Price ($)" type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} fullWidth /></Grid>
                    <Grid item xs={6}><TextField label="Cost Price ($)" type="number" name="costPrice" value={formData.costPrice} onChange={handleChange} fullWidth /></Grid>
                    <Grid item xs={6}><TextField label="Reorder Level" type="number" name="reorderLevel" value={formData.reorderLevel} onChange={handleChange} fullWidth /></Grid>
                    
                    <Grid item xs={12}><TextField label="Expiry Date" type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
                    <Grid item xs={12}><TextField name="description" label="Description" value={formData.description} onChange={handleChange} multiline rows={2} fullWidth /></Grid>
                </Grid>
                <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                    <Button onClick={onClose} variant="outlined" disabled={loading}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" color="primary" disabled={loading}>
                        {loading ? <LinearProgress color="inherit" sx={{ width: '100%' }} /> : (isEdit ? 'Save Changes' : 'Add Medicine')}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default MedicineFormModal;
