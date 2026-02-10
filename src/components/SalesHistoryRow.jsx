// src/components/SalesHistoryRow.jsx
import React, { useState } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, IconButton
} from '@mui/material';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import { grey } from '@mui/material/colors';
import { formatDateForDisplay } from '../utils/utilityFunctions';

/**
 * Helper component to simulate a CSS collapse effect.
 */
const Collapse = ({ in: open, children, timeout, unmountOnExit, ...props }) => (
    <Box sx={{ transition: `height ${timeout || 300}ms` }} {...props} style={{ overflow: 'hidden', height: open ? 'auto' : 0 }}>
        {children}
    </Box>
);

/**
 * Displays a single row in the Sales History table with expandable details.
 */
const SaleHistoryRow = ({ sale }) => {
    const [open, setOpen] = useState(false);
    
    // 🚀 FIX 1: Access the cashier/user using the correct alias 'user'
    const cashierName = sale.user ? sale.user.username : 'N/A'; 
    
    const saleDate = formatDateForDisplay(sale.createdAt);

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' }, cursor: 'pointer' }} onClick={() => setOpen(!open)}>
                <TableCell>{sale.receiptNumber ? sale.receiptNumber.substring(0, 8) + '...' : 'N/A'}</TableCell>
                <TableCell>{saleDate}</TableCell>
                <TableCell>{cashierName}</TableCell>
                <TableCell>{sale.customerName || 'Cash Customer'}</TableCell>
                <TableCell align="right">TZS{parseFloat(sale.totalAmount).toFixed(2)}</TableCell>
                <TableCell>
                    <IconButton size="small">
                        {open ? <RemoveCircleOutline /> : <AddCircleOutline />}
                    </IconButton>
                </TableCell>
            </TableRow>
            {/* Expanded Row for Items */}
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Items Sold
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: grey[100] }}>
                                        <TableCell>Medicine Name</TableCell>
                                        <TableCell align="center">SKU</TableCell>
                                        <TableCell align="center">Quantity</TableCell>
                                        <TableCell align="right">Price @ Sale</TableCell>
                                        <TableCell align="right">Subtotal</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sale.items?.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.medicine?.name || 'Item Not Found'}</TableCell>
                                            <TableCell align="center">{item.medicine?.sku || 'N/A'}</TableCell>
                                            
                                            {/* 🚀 FIX 2: Use the new column name 'quantity' */}
                                            <TableCell align="center">{item.quantity}</TableCell> 
                                            
                                            {/* 🚀 FIX 2: Use the new column name 'pricePerUnit' */}
                                            <TableCell align="right">TZS{parseFloat(item.pricePerUnit).toFixed(2)}</TableCell> 
                                            
                                            <TableCell align="right">TZS{parseFloat(item.subtotal).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

export default SaleHistoryRow;