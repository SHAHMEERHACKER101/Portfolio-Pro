// Admin system with GitHub integration
let githubToken = null;
let githubUsername = null;
let githubRepo = 'Portfolio-Pro';
let adminSession = null;

// Admin credentials
const ADMIN_USERNAME = 'shahmeer606';
const ADMIN_PASSWORD = '9MJMKHmjfP695IW';

// Initialize admin system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin system initializing...');
    
    // Check for existing session
    checkAdminSession();
    
    // Initialize event listeners
    initAdminEventListeners();
    
    console.log('Admin system ready');
});

// Initialize Event Listeners
function initAdminEventListeners() {
    // Admin button click
    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn) {
        adminBtn.addEventListener('click', showAdminModal);
        console.log('Admin button listener attached');
    } else {
        console.error('Admin button not found');
    }
    
    // Admin login form
    const loginForm = document.getElementById('admin-login-form');
    const loginBtn = document.getElementById('admin-login-btn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', handleAdminLogin);
        console.log('Login button listener attached');
    }
    
    // GitHub connect button
    const githubConnectBtn = document.getElementById('github-connect-btn');
    if (githubConnectBtn) {
        githubConnectBtn.addEventListener('click', handleGitHubConnect);
    }
    
    // Upload form
    const uploadForm = document.getElementById('upload-form');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleFileUpload);
    }
    
    // Tab navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = btn.textContent.toLowerCase();
            showTab(tabName);
        });
    });
    
    // Enter key support for login
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const modal = document.getElementById('admin-modal');
            if (modal && modal.classList.contains('active')) {
                if (document.getElementById('admin-login-form').style.display !== 'none') {
                    handleAdminLogin();
                }
            }
        }
    });
}

// Check Admin Session
function checkAdminSession() {
    const stored = localStorage.getItem('admin_session');
    if (stored) {
        try {
            adminSession = JSON.parse(stored);
            const now = Date.now();
            
            // Check if session is valid (24 hours)
            if (adminSession.expires > now) {
                console.log('Valid admin session found');
                return true;
            } else {
                localStorage.removeItem('admin_session');
                adminSession = null;
            }
        } catch (e) {
            localStorage.removeItem('admin_session');
            adminSession = null;
        }
    }
    return false;
}

// Show Admin Modal
function showAdminModal() {
    console.log('Showing admin modal');
    
    const modal = document.getElementById('admin-modal');
    if (!modal) {
        console.error('Admin modal not found in DOM');
        return;
    }
    
    // Check if account is locked
    if (isAccountLocked()) {
        showLockoutMessage();
        return;
    }
    
    modal.classList.add('active');
    
    // Focus on username field
    setTimeout(() => {
        const usernameField = document.getElementById('admin-username');
        if (usernameField) {
            usernameField.focus();
        }
    }, 100);
}

// Hide Admin Modal
function hideAdminModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) {
        modal.classList.remove('active');
        clearLoginErrors();
        clearForm();
    }
}

// Handle Admin Login
function handleAdminLogin() {
    console.log('Handling admin login...');
    
    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value;
    
    clearLoginErrors();
    
    if (!username || !password) {
        showLoginError('Please enter both username and password');
        return;
    }
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Successful login
        console.log('Login successful');
        
        // Clear failed attempts
        clearFailedAttempts();
        
        // Create session
        adminSession = {
            username: username,
            loginTime: Date.now(),
            expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
        localStorage.setItem('admin_session', JSON.stringify(adminSession));
        
        // Hide login modal and show GitHub setup
        hideAdminModal();
        showGitHubTokenModal();
        
    } else {
        // Failed login
        console.log('Login failed');
        handleFailedLogin();
        showLoginError('Invalid username or password');
    }
}

// Handle Failed Login
function handleFailedLogin() {
    let attempts = JSON.parse(localStorage.getItem('admin_attempts') || '{"count": 0, "lastAttempt": 0}');
    
    attempts.count++;
    attempts.lastAttempt = Date.now();
    
    localStorage.setItem('admin_attempts', JSON.stringify(attempts));
    
    if (attempts.count >= 2) {
        // Lock account for 15 minutes
        const lockUntil = Date.now() + (15 * 60 * 1000);
        localStorage.setItem('admin_locked_until', lockUntil.toString());
        showLockoutMessage();
        hideAdminModal();
    }
}

// Check if Account is Locked
function isAccountLocked() {
    const lockUntil = localStorage.getItem('admin_locked_until');
    if (lockUntil) {
        const now = Date.now();
        if (now < parseInt(lockUntil)) {
            return true;
        } else {
            // Lock expired, clear it
            localStorage.removeItem('admin_locked_until');
            clearFailedAttempts();
        }
    }
    return false;
}

// Show Lockout Message
function showLockoutMessage() {
    const lockUntil = localStorage.getItem('admin_locked_until');
    if (lockUntil) {
        const remaining = Math.ceil((parseInt(lockUntil) - Date.now()) / 60000);
        showToast(`Account locked. Try again in ${remaining} minutes.`, 'error');
    }
}

// Clear Failed Attempts
function clearFailedAttempts() {
    localStorage.removeItem('admin_attempts');
    localStorage.removeItem('admin_locked_until');
}

// Show GitHub Token Modal
function showGitHubTokenModal() {
    console.log('Showing GitHub token modal');
    
    const modal = document.getElementById('github-token-modal');
    if (modal) {
        modal.classList.add('active');
        
        // Pre-fill repo name
        const repoField = document.getElementById('github-repo');
        if (repoField && !repoField.value) {
            repoField.value = githubRepo;
        }
        
        // Focus on username field
        setTimeout(() => {
            const usernameField = document.getElementById('github-username');
            if (usernameField) {
                usernameField.focus();
            }
        }, 100);
    }
}

// Hide GitHub Token Modal
function hideGitHubTokenModal() {
    const modal = document.getElementById('github-token-modal');
    if (modal) {
        modal.classList.remove('active');
        clearGitHubErrors();
    }
}

// Handle GitHub Connect
function handleGitHubConnect() {
    console.log('Connecting to GitHub...');
    
    const username = document.getElementById('github-username').value.trim();
    const token = document.getElementById('github-token').value.trim();
    const repo = document.getElementById('github-repo').value.trim();
    
    clearGitHubErrors();
    
    if (!username || !token || !repo) {
        showGitHubError('Please fill in all fields');
        return;
    }
    
    // Store credentials in memory
    githubUsername = username;
    githubToken = token;
    githubRepo = repo;
    
    // Make them globally available
    window.githubUsername = username;
    window.githubRepo = repo;
    
    // Test connection
    testGitHubConnection()
        .then(() => {
            console.log('GitHub connection successful');
            hideGitHubTokenModal();
            showAdminDashboard();
            showToast('Connected to GitHub successfully!');
        })
        .catch((error) => {
            console.error('GitHub connection failed:', error);
            showGitHubError('Failed to connect to GitHub. Please check your credentials.');
        });
}

// Test GitHub Connection
async function testGitHubConnection() {
    const url = `https://api.github.com/repos/${githubUsername}/${githubRepo}`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
}

// Show Admin Dashboard
function showAdminDashboard() {
    console.log('Showing admin dashboard');
    
    const modal = document.getElementById('admin-dashboard');
    if (modal) {
        modal.classList.add('active');
        
        // Load dashboard data
        loadAdminPortfolio();
        loadAdminMessages();
        
        // Show upload tab by default
        showTab('upload');
    }
}

// Hide Admin Dashboard
function hideAdminDashboard() {
    const modal = document.getElementById('admin-dashboard');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Show Tab
function showTab(tabName) {
    console.log(`Switching to ${tabName} tab`);
    
    // Update tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    const activeTab = document.getElementById(`${tabName}-tab`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Refresh data for specific tabs
    if (tabName === 'portfolio') {
        loadAdminPortfolio();
    } else if (tabName === 'messages') {
        loadAdminMessages();
    }
}

// Handle File Upload
async function handleFileUpload(e) {
    e.preventDefault();
    console.log('Handling file upload...');
    
    if (!githubToken || !githubUsername) {
        showToast('GitHub connection required', 'error');
        return;
    }
    
    const fileInput = document.getElementById('file-input');
    const titleInput = document.getElementById('file-title');
    const categoryInput = document.getElementById('file-category');
    
    const file = fileInput.files[0];
    const title = titleInput.value.trim();
    const category = categoryInput.value;
    
    if (!file || !title) {
        showToast('Please select a file and enter a title', 'error');
        return;
    }
    
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
        showToast('File size must be under 100MB', 'error');
        return;
    }
    
    try {
        showUploadProgress(true);
        updateUploadProgress(10, 'Reading file...');
        
        // Convert file to base64
        const base64 = await fileToBase64(file);
        updateUploadProgress(30, 'Uploading to GitHub...');
        
        // Generate filename
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const filename = `${title.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.${extension}`;
        const filePath = `uploads/${filename}`;
        
        // Upload file to GitHub
        await uploadFileToGitHub(filePath, base64, `Upload: ${title}`);
        updateUploadProgress(60, 'Generating thumbnail...');
        
        // Generate thumbnail if applicable
        let thumbnailPath = null;
        if (file.type.startsWith('image/')) {
            const thumbnailBase64 = await generateImageThumbnail(file);
            thumbnailPath = `uploads/thumbs/${filename}.jpg`;
            await uploadFileToGitHub(thumbnailPath, thumbnailBase64, `Thumbnail: ${title}`);
        } else {
            // Create a placeholder thumbnail
            const placeholderSvg = createPlaceholderThumbnail(title, getFileTypeIcon(file.type));
            const placeholderBase64 = btoa(placeholderSvg);
            thumbnailPath = `uploads/thumbs/${filename}.svg`;
            await uploadFileToGitHub(thumbnailPath, placeholderBase64, `Thumbnail: ${title}`);
        }
        
        updateUploadProgress(80, 'Updating portfolio...');
        
        // Update portfolio.json
        const portfolioItem = {
            id: timestamp.toString(),
            title: title,
            category: category,
            file: filePath,
            thumbnail: thumbnailPath,
            uploadDate: new Date().toISOString(),
            fileSize: file.size,
            fileType: file.type
        };
        
        await updatePortfolioJson(portfolioItem);
        updateUploadProgress(100, 'Upload complete!');
        
        showToast('File uploaded successfully!');
        
        // Reset form
        document.getElementById('upload-form').reset();
        
        // Refresh portfolio after delay
        setTimeout(() => {
            loadAdminPortfolio();
            if (typeof window.loadPortfolioData === 'function') {
                window.loadPortfolioData();
            }
        }, 2000);
        
    } catch (error) {
        console.error('Upload error:', error);
        showToast(`Upload failed: ${error.message}`, 'error');
    } finally {
        showUploadProgress(false);
    }
}

// Convert File to Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Upload File to GitHub
async function uploadFileToGitHub(path, content, message) {
    const url = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${path}`;
    
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${githubToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
            message: message,
            content: content,
            committer: {
                name: 'Portfolio Admin',
                email: 'admin@portfolio.com'
            }
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
    }
    
    return response.json();
}

// Generate Image Thumbnail
function generateImageThumbnail(file) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            canvas.width = 300;
            canvas.height = 200;
            
            // Calculate dimensions to maintain aspect ratio
            const aspectRatio = img.width / img.height;
            let drawWidth = canvas.width;
            let drawHeight = canvas.height;
            
            if (aspectRatio > canvas.width / canvas.height) {
                drawHeight = canvas.width / aspectRatio;
            } else {
                drawWidth = canvas.height * aspectRatio;
            }
            
            const x = (canvas.width - drawWidth) / 2;
            const y = (canvas.height - drawHeight) / 2;
            
            ctx.fillStyle = '#374151';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, x, y, drawWidth, drawHeight);
            
            const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
            resolve(base64);
        };
        
        img.src = URL.createObjectURL(file);
    });
}

// Create Placeholder Thumbnail
function createPlaceholderThumbnail(title, icon) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
        <rect width="300" height="200" fill="#374151"/>
        <text x="150" y="80" text-anchor="middle" fill="#00f3ff" font-size="40">${icon}</text>
        <text x="150" y="130" text-anchor="middle" fill="#ffffff" font-size="16">${title.substring(0, 20)}</text>
        <text x="150" y="150" text-anchor="middle" fill="#9ca3af" font-size="12">Click to preview</text>
    </svg>`;
}

// Get File Type Icon
function getFileTypeIcon(type) {
    if (type.includes('pdf')) return '📄';
    if (type.includes('video')) return '🎬';
    if (type.includes('image')) return '🖼️';
    if (type.includes('audio')) return '🎵';
    if (type.includes('zip') || type.includes('archive')) return '📦';
    if (type.includes('text') || type.includes('document')) return '📝';
    return '📁';
}

// Update Portfolio JSON
async function updatePortfolioJson(newItem) {
    const portfolioUrl = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/data/portfolio.json`;
    
    try {
        // Get current portfolio.json
        const getResponse = await fetch(portfolioUrl, {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        let portfolioData = { portfolio: [], lastUpdated: new Date().toISOString() };
        let sha = null;
        
        if (getResponse.ok) {
            const fileData = await getResponse.json();
            const content = atob(fileData.content);
            portfolioData = JSON.parse(content);
            sha = fileData.sha;
        }
        
        // Add new item
        portfolioData.portfolio = portfolioData.portfolio || [];
        portfolioData.portfolio.unshift(newItem);
        portfolioData.lastUpdated = new Date().toISOString();
        
        // Update portfolio.json
        const updateResponse = await fetch(portfolioUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: `Add portfolio item: ${newItem.title}`,
                content: btoa(JSON.stringify(portfolioData, null, 2)),
                sha: sha,
                committer: {
                    name: 'Portfolio Admin',
                    email: 'admin@portfolio.com'
                }
            })
        });
        
        if (!updateResponse.ok) {
            throw new Error('Failed to update portfolio.json');
        }
        
    } catch (error) {
        console.error('Portfolio update error:', error);
        throw error;
    }
}

// Upload Progress
function showUploadProgress(show) {
    const progress = document.getElementById('upload-progress');
    if (progress) {
        if (show) {
            progress.classList.add('active');
        } else {
            progress.classList.remove('active');
        }
    }
}

function updateUploadProgress(percent, text) {
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');
    
    if (progressBar) {
        progressBar.style.setProperty('--progress', `${percent}%`);
        progressBar.style.background = `linear-gradient(90deg, #00f3ff ${percent}%, #374151 ${percent}%)`;
    }
    
    if (progressText) {
        progressText.textContent = text;
    }
}

// Load Admin Portfolio
async function loadAdminPortfolio() {
    const grid = document.getElementById('admin-portfolio-grid');
    if (!grid) return;
    
    try {
        // Load from GitHub if possible
        let portfolioData = [];
        if (githubToken && githubUsername) {
            portfolioData = await loadPortfolioFromGitHub();
        } else {
            // Fallback to localStorage
            const stored = localStorage.getItem('portfolio_v2');
            portfolioData = stored ? JSON.parse(stored) : [];
        }
        
        if (portfolioData.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #9ca3af;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📁</div>
                    <p>No portfolio items uploaded yet.</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = portfolioData.map(item => `
            <div class="admin-portfolio-item">
                <img src="${getFileUrl(item.thumbnail)}" alt="${item.title}" 
                     onerror="this.src='data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="250" height="120"><rect width="250" height="120" fill="#374151"/><text x="125" y="60" text-anchor="middle" fill="#9ca3af" font-size="14">No Preview</text></svg>')}'">
                <h4>${item.title}</h4>
                <div class="category">${getCategoryName(item.category)}</div>
                <div class="date">${new Date(item.uploadDate).toLocaleDateString()}</div>
                <div class="actions">
                    <button onclick="previewFile('${item.id}')" class="btn btn-primary">Preview</button>
                    <button onclick="deletePortfolioItem('${item.id}')" class="btn btn-danger">Delete</button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading admin portfolio:', error);
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #ef4444;">
                <p>Error loading portfolio items. Please check your connection.</p>
            </div>
        `;
    }
}

// Load Portfolio from GitHub
async function loadPortfolioFromGitHub() {
    const portfolioUrl = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/data/portfolio.json`;
    
    const response = await fetch(portfolioUrl, {
        headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    
    if (response.ok) {
        const fileData = await response.json();
        const content = atob(fileData.content);
        const portfolioData = JSON.parse(content);
        return portfolioData.portfolio || [];
    }
    
    return [];
}

// Delete Portfolio Item
async function deletePortfolioItem(id) {
    if (!confirm('Are you sure you want to delete this portfolio item?')) {
        return;
    }
    
    if (!githubToken) {
        showToast('GitHub access required to delete files', 'error');
        return;
    }
    
    try {
        // Find item
        const portfolioData = await loadPortfolioFromGitHub();
        const item = portfolioData.find(p => p.id === id);
        
        if (!item) {
            showToast('Item not found', 'error');
            return;
        }
        
        // Delete files from GitHub
        await deleteFileFromGitHub(item.file);
        if (item.thumbnail) {
            await deleteFileFromGitHub(item.thumbnail);
        }
        
        // Update portfolio.json
        await removeFromPortfolioJson(id);
        
        showToast('Portfolio item deleted successfully');
        
        // Reload data
        setTimeout(() => {
            loadAdminPortfolio();
            if (typeof window.loadPortfolioData === 'function') {
                window.loadPortfolioData();
            }
        }, 1000);
        
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Failed to delete item', 'error');
    }
}

// Delete File from GitHub
async function deleteFileFromGitHub(filePath) {
    try {
        const getUrl = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${filePath}`;
        
        const getResponse = await fetch(getUrl, {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (getResponse.ok) {
            const fileData = await getResponse.json();
            
            const deleteResponse = await fetch(getUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: `Delete: ${filePath}`,
                    sha: fileData.sha,
                    committer: {
                        name: 'Portfolio Admin',
                        email: 'admin@portfolio.com'
                    }
                })
            });
            
            if (!deleteResponse.ok) {
                throw new Error('Failed to delete file');
            }
        }
    } catch (error) {
        console.error('File deletion error:', error);
    }
}

// Remove from Portfolio JSON
async function removeFromPortfolioJson(itemId) {
    const portfolioUrl = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/data/portfolio.json`;
    
    const getResponse = await fetch(portfolioUrl, {
        headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    
    if (getResponse.ok) {
        const fileData = await getResponse.json();
        const content = atob(fileData.content);
        const portfolioData = JSON.parse(content);
        
        // Remove item
        portfolioData.portfolio = portfolioData.portfolio.filter(item => item.id !== itemId);
        portfolioData.lastUpdated = new Date().toISOString();
        
        // Update portfolio.json
        const updateResponse = await fetch(portfolioUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: `Remove portfolio item: ${itemId}`,
                content: btoa(JSON.stringify(portfolioData, null, 2)),
                sha: fileData.sha,
                committer: {
                    name: 'Portfolio Admin',
                    email: 'admin@portfolio.com'
                }
            })
        });
        
        if (!updateResponse.ok) {
            throw new Error('Failed to update portfolio.json');
        }
    }
}

// Load Admin Messages
function loadAdminMessages() {
    const container = document.getElementById('admin-messages');
    if (!container) return;
    
    const messages = JSON.parse(localStorage.getItem('messages_v2') || '[]');
    
    if (messages.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #9ca3af;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📧</div>
                <p>No messages received yet.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = messages.map(message => `
        <div class="message-item ${message.read ? '' : 'unread'}">
            <div class="message-header">
                <div class="message-from">${message.name}</div>
                <div class="message-date">${new Date(message.date).toLocaleDateString()}</div>
            </div>
            <div class="message-email">${message.email}</div>
            <div class="message-content">${message.message}</div>
            <div class="message-actions">
                ${!message.read ? `<button onclick="markMessageRead('${message.id}')" class="btn btn-primary">Mark Read</button>` : ''}
                <button onclick="deleteMessage('${message.id}')" class="btn btn-danger">Delete</button>
            </div>
        </div>
    `).join('');
}

// Mark Message as Read
function markMessageRead(messageId) {
    const messages = JSON.parse(localStorage.getItem('messages_v2') || '[]');
    const message = messages.find(m => m.id === messageId);
    
    if (message) {
        message.read = true;
        localStorage.setItem('messages_v2', JSON.stringify(messages));
        loadAdminMessages();
        showToast('Message marked as read');
    }
}

// Delete Message
function deleteMessage(messageId) {
    if (!confirm('Are you sure you want to delete this message?')) {
        return;
    }
    
    const messages = JSON.parse(localStorage.getItem('messages_v2') || '[]');
    const filteredMessages = messages.filter(m => m.id !== messageId);
    localStorage.setItem('messages_v2', JSON.stringify(filteredMessages));
    
    loadAdminMessages();
    showToast('Message deleted');
}

// Utility Functions
function getFileUrl(filePath) {
    if (!filePath) return '';
    
    if (filePath.startsWith('http')) {
        return filePath;
    }
    
    if (githubUsername && githubRepo) {
        return `https://raw.githubusercontent.com/${githubUsername}/${githubRepo}/main/${filePath}`;
    }
    
    return filePath;
}

function getCategoryName(category) {
    const categoryNames = {
        'ads': 'High-Converting Ads',
        'videos': 'Viral Videos',
        'books': 'Books & Podcasts',
        'email': 'Email Campaigns',
        'pinterest': 'Pinterest',
        'tools': 'Web Tools',
        'ai': 'AI Visuals'
    };
    return categoryNames[category] || category;
}

function clearLoginErrors() {
    const errorEl = document.getElementById('login-error');
    if (errorEl) {
        errorEl.classList.remove('active');
        errorEl.textContent = '';
    }
}

function showLoginError(message) {
    const errorEl = document.getElementById('login-error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('active');
    }
}

function clearGitHubErrors() {
    const errorEl = document.getElementById('github-error');
    if (errorEl) {
        errorEl.classList.remove('active');
        errorEl.textContent = '';
    }
}

function showGitHubError(message) {
    const errorEl = document.getElementById('github-error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('active');
    }
}

function clearForm() {
    const usernameField = document.getElementById('admin-username');
    const passwordField = document.getElementById('admin-password');
    
    if (usernameField) usernameField.value = '';
    if (passwordField) passwordField.value = '';
}

// Make functions globally available
window.showAdminModal = showAdminModal;
window.hideAdminModal = hideAdminModal;
window.hideGitHubTokenModal = hideGitHubTokenModal;
window.hideAdminDashboard = hideAdminDashboard;
window.showTab = showTab;
window.deletePortfolioItem = deletePortfolioItem;
window.markMessageRead = markMessageRead;
window.deleteMessage = deleteMessage;
window.loadPortfolioFromGitHub = loadPortfolioFromGitHub;

console.log('Admin.js loaded successfully');