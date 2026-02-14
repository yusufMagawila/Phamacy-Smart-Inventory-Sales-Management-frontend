// --- src/components/ActivityLogViewer.jsx ---

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Paper, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, Alert, IconButton, Button
} from '@mui/material';
import { Refresh, History, Warning as WarningIcon } from '@mui/icons-material';
import { red } from '@mui/material/colors';
import axios from 'axios';
import { API_BASE_URL, formatDateForDisplay } from '../utils/utilityFunctions'; // Assuming these utils exist

const ActivityLogViewer = () => {
    const [logData, setLogData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchActivityLog = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Retrieve the Admin's JWT from local storage for authorization
            const token = localStorage.getItem('token');
            
            const response = await axios.get(
                `${API_BASE_URL}/api/admin/activity-log`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Pass the Admin's token
                    }
                }
            );

            // Assuming the backend response structure is { log: [...] }
            setLogData(response.data.log);
            
        } catch (err) {
            console.error('Failed to fetch activity log:', err.response || err);
            const status = err.response?.status;
            let errorMessage = 'Failed to load activity log.';
            
            if (status === 403) {
                errorMessage = 'Permission Denied. You must be an Administrator to view this log.';
            } else if (status === 401) {
                errorMessage = 'Authentication Required. Please log in again.';
            }
            setError(errorMessage);
            setLogData([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActivityLog();
    }, [fetchActivityLog]);

    // Helper to render the user information, handling potential missing user object
    const getUserIdentifier = (log) => {
        if (log.user) {
            return `${log.user.username || log.user.email} (${log.userRole})`;
        }
        return `User ID: ${log.userId || 'Unknown'} (${log.userRole})`;
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 3, border: `1px solid ${red[100]}` }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: red[700], display: 'flex', alignItems: 'center' }}>
                    <History sx={{ mr: 1 }} /> System Activity Log
                </Typography>
                <IconButton onClick={fetchActivityLog} disabled={isLoading} color="primary">
                    <Refresh />
                </IconButton>
            </Box>

            {isLoading && <CircularProgress size={24} sx={{ display: 'block', margin: '20px auto' }} />}
            
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {!isLoading && !error && logData.length === 0 && (
                <Alert severity="info">
                    No recent activity records found.
                </Alert>
            )}

            {!isLoading && !error && logData.length > 0 && (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: red[50] }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Action Performed</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Entity</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logData.map((log) => (
                                <TableRow key={log.id} hover>
                                    <TableCell>{formatDateForDisplay(log.createdAt || log.timestamp)}</TableCell>
                                    <TableCell>{getUserIdentifier(log)}</TableCell>
                                    <TableCell>{log.action}</TableCell>
                                    <TableCell>{log.entityType || 'System'} {log.entityId ? `(#${log.entityId})` : ''}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
};

export default ActivityLogViewer;
