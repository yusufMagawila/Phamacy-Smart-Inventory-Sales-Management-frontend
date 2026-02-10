// src/components/modals/UploadCSVModal.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Modal, Alert, Button, LinearProgress
} from '@mui/material';
import { UploadFile } from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/utilityFunctions';

/**
 * Modal for uploading CSV files to bulk update inventory.
 */
const UploadCSVModal = ({ open, onClose, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        setAlert(null);
        setFile(null);
    }, [open]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setAlert({ type: 'warning', message: 'Please select a CSV file to upload.' });
            return;
        }

        setLoading(true);
        setAlert(null);
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('csvFile', file);

        try {
            const response = await axios.post(`${API_BASE_URL}/pharmacy/inventory/upload-csv`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            setAlert({ type: 'success', message: response.data.message });
            onUploadSuccess();
            setTimeout(onClose, 1500); 
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to upload CSV.';
            setAlert({ type: 'error', message: errorMessage });
            console.error('CSV Upload Error:', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: { xs: '90%', sm: 400 }, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2
            }}>
                <Typography variant="h5" mb={2}>Bulk Upload Inventory (CSV)</Typography>
                {alert && <Alert severity={alert.type} sx={{ mb: 2 }}>{alert.message}</Alert>}
                <input type="file" accept=".csv" onChange={handleFileChange} />
                {file && <Alert severity="info" sx={{ mt: 2 }}>Selected file: **{file.name}**</Alert>}
                <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                    <Button onClick={onClose} variant="outlined" disabled={loading}>Cancel</Button>
                    <Button onClick={handleUpload} variant="contained" color="success" startIcon={<UploadFile />} disabled={loading || !file}>
                        {loading ? <LinearProgress color="inherit" sx={{ width: '100%' }} /> : 'Upload & Sync'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default UploadCSVModal;
