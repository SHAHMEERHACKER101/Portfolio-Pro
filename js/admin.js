// Admin Panel Functionality
class AdminPanel {
  constructor() {
    this.isLoggedIn = false;
    this.init();
  }

  init() {
    this.setupLoginForm();
    this.setupLogout();
    this.checkLoginStatus();
  }

  setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin(e);
    });
  }

  setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', () => {
      this.logout();
    });
  }

  handleLogin(e) {
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');

    // Check credentials
    if (username === 'shahmeer606' && password === '9MJMKHmjfP695IW') {
      this.isLoggedIn = true;
      localStorage.setItem('adminLoggedIn', 'true');
      this.showDashboard();
      this.loadMessages();
    } else {
      alert('Invalid credentials');
    }
  }

  logout() {
    this.isLoggedIn = false;
    localStorage.removeItem('adminLoggedIn');
    this.showLogin();
  }

  checkLoginStatus() {
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (loggedIn === 'true') {
      this.isLoggedIn = true;
      this.showDashboard();
      this.loadMessages();
    }
  }

  showLogin() {
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('loginForm').reset();
  }

  showDashboard() {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
  }

  loadMessages() {
    const messages = JSON.parse(localStorage.getItem('portfolioMessages') || '[]');
    const messagesList = document.getElementById('messagesList');
    
    if (messages.length === 0) {
      messagesList.innerHTML = '<p style="color: var(--gray-400); text-align: center;">No messages yet.</p>';
      return;
    }

    // Sort messages by date (newest first)
    messages.sort((a, b) => new Date(b.date) - new Date(a.date));

    messagesList.innerHTML = messages.map(message => `
      <div class="message-item" data-message-id="${message.id}">
        <div class="message-header">
          <div>
            <div class="message-from">${message.name} (${message.email})</div>
            <div class="message-date">${new Date(message.date).toLocaleString()}</div>
          </div>
        </div>
        <div class="message-content">${message.message}</div>
        <div class="message-actions">
          <button class="reply-button" onclick="adminPanel.replyToMessage('${message.email}', '${message.name}')">
            Reply
          </button>
          <button class="delete-button" onclick="adminPanel.deleteMessage(${message.id})">
            Delete
          </button>
        </div>
      </div>
    `).join('');
  }

  replyToMessage(email, name) {
    const subject = `Re: Your Portfolio Inquiry`;
    const body = `Hi ${name},\n\nThank you for reaching out! I'd love to discuss your project.\n\nBest regards,\nShahmeer Baqai`;
    
    // Create mailto link
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  }

  deleteMessage(messageId) {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    const messages = JSON.parse(localStorage.getItem('portfolioMessages') || '[]');
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    localStorage.setItem('portfolioMessages', JSON.stringify(updatedMessages));
    
    this.loadMessages();
    
    // Show success message
    if (window.PortfolioApp) {
      const app = new window.PortfolioApp();
      app.showSuccessMessage('Message deleted successfully');
    }
  }

  // Export messages as JSON
  exportMessages() {
    const messages = JSON.parse(localStorage.getItem('portfolioMessages') || '[]');
    const dataStr = JSON.stringify(messages, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `portfolio-messages-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  // Import messages from JSON
  importMessages(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedMessages = JSON.parse(e.target.result);
        const existingMessages = JSON.parse(localStorage.getItem('portfolioMessages') || '[]');
        
        // Merge messages (avoid duplicates by ID)
        const allMessages = [...existingMessages];
        importedMessages.forEach(msg => {
          if (!allMessages.find(existing => existing.id === msg.id)) {
            allMessages.push(msg);
          }
        });
        
        localStorage.setItem('portfolioMessages', JSON.stringify(allMessages));
        this.loadMessages();
        
        if (window.PortfolioApp) {
          const app = new window.PortfolioApp();
          app.showSuccessMessage(`Imported ${importedMessages.length} messages`);
        }
      } catch (error) {
        alert('Error importing messages: Invalid file format');
      }
    };
    reader.readAsText(file);
  }

  // Clear all messages
  clearAllMessages() {
    if (!confirm('Are you sure you want to delete ALL messages? This cannot be undone.')) {
      return;
    }

    localStorage.removeItem('portfolioMessages');
    this.loadMessages();
    
    if (window.PortfolioApp) {
      const app = new window.PortfolioApp();
      app.showSuccessMessage('All messages cleared');
    }
  }

  // Get message statistics
  getMessageStats() {
    const messages = JSON.parse(localStorage.getItem('portfolioMessages') || '[]');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      total: messages.length,
      today: messages.filter(msg => new Date(msg.date) >= today).length,
      thisWeek: messages.filter(msg => new Date(msg.date) >= thisWeek).length,
      thisMonth: messages.filter(msg => new Date(msg.date) >= thisMonth).length
    };
  }
}

// Initialize admin panel
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
  adminPanel = new AdminPanel();
});

// Export for global use
window.adminPanel = adminPanel;