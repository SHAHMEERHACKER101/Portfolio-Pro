// Message handling functionality for contact form
function initMessaging() {
    // This is already handled in main.js initContactForm()
    // but keeping this file for any additional message-related functionality
}

// Function to export messages (for admin use)
function exportMessages() {
    const messages = JSON.parse(localStorage.getItem('messages_v2') || '[]');
    
    if (messages.length === 0) {
        showToast('No messages to export', 'error');
        return;
    }
    
    const csvContent = generateMessagesCSV(messages);
    downloadCSV(csvContent, 'contact-messages.csv');
    showToast('Messages exported successfully');
}

function generateMessagesCSV(messages) {
    const headers = ['Name', 'Email', 'Message', 'Date', 'Status'];
    const csvRows = [headers.join(',')];
    
    messages.forEach(message => {
        const row = [
            escapeCSV(message.name),
            escapeCSV(message.email),
            escapeCSV(message.message),
            escapeCSV(new Date(message.timestamp).toLocaleString()),
            escapeCSV(message.status)
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

function escapeCSV(value) {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename);
    } else {
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Function to clear all messages (admin only)
function clearAllMessages() {
    if (!confirm('Are you sure you want to delete all messages? This action cannot be undone.')) {
        return;
    }
    
    localStorage.removeItem('messages_v2');
    loadAdminMessages();
    showToast('All messages cleared');
}

// Function to get message statistics
function getMessageStats() {
    const messages = JSON.parse(localStorage.getItem('messages_v2') || '[]');
    
    return {
        total: messages.length,
        unread: messages.filter(m => m.status === 'unread').length,
        read: messages.filter(m => m.status === 'read').length,
        thisMonth: messages.filter(m => {
            const messageDate = new Date(m.timestamp);
            const now = new Date();
            return messageDate.getMonth() === now.getMonth() && 
                   messageDate.getFullYear() === now.getFullYear();
        }).length
    };
}

// Make functions global if needed
window.exportMessages = exportMessages;
window.clearAllMessages = clearAllMessages;