// src/components/modals/ConfirmationDialog.jsx
import React from 'react';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography
} from '@mui/material';

/**
 * A generic confirmation dialog component.
 */
const ConfirmationDialog = ({ open, title, content, onConfirm, onCancel }) => {
    return (
        <Dialog open={open} onClose={onCancel}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Typography>{content}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} color="inherit">Cancel</Button>
                <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationDialog;
