// src/utils/utilityFunctions.js

/**
 * This should point to your Express server's root.
 */
export const API_BASE_URL = import.meta.env.BACKEND_URL;
/**
 * Formats a date object or string into the required YYYY-MM-DD format for HTML input type="date".
 */
export const formatDateForInput = (date) => {
    if (!date) return new Date().toISOString().split('T')[0];
    try {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    } catch (e) {
        return new Date().toISOString().split('T')[0];
    }
};

/**
 * Formats a date string for display (e.g., Oct 16, 2025, 10:40 AM).
 */
export const formatDateForDisplay = (date) => {
    if (!date) return 'N/A';
    try {
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return String(date);
    }
};

/**
 * Checks if a given date string represents an expired date (before today).
 */
export const isDateExpired = (dateString) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiryDate = new Date(dateString);
        expiryDate.setHours(0, 0, 0, 0);
        return expiryDate < today;
    } catch (e) {
        return false;
    }
};
