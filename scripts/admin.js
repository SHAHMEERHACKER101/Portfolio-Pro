// GitHub-backed CMS Admin functionality
let isLoggedIn = false;
let githubToken = null;
let githubUsername = null;
let githubRepo = 'ShahmeerBaqai-Portfolio-Pro';

// Admin credentials
const ADMIN_USERNAME = 'shahmeer606';
const ADMIN_PASSWORD = '9MJMKHmjfP695IW';

// Check if admin is logged in on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAdminSession();
});

function checkAdminSession() {
    // Session is only valid in memory for security
    // No persistent session storage for GitHub tokens
}

function showAdminModal() {
    const modal = document.getElementById('admin-modal');
    modal.classList.remove('hidden');
}

function hideAdminModal() {
    const modal = document.getElementById('admin-modal');
    modal.classList.add('hidden');
}

function showAdminDashboard() {
    const dashboard = document.getElementById('admin-dashboard');
    dashboard.classList.remove('hidden');
    loadAdminData();
}

function hideAdminDashboard() {
    const dashboard = document.getElementById('admin-dashboard');
    dashboard.classList.add('hidden');
}

// Admin login form handler
document.getElementById('admin-login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        isLoggedIn = true;
        hideAdminModal();
        showGitHubTokenModal();
        showToast('Admin login successful! Please enter your GitHub token.');
    } else {
        showToast('Invalid credentials', 'error');
    }
});

function showGitHubTokenModal() {
    const modal = document.getElementById('github-token-modal');
    modal.classList.remove('hidden');
}

function hideGitHubTokenModal() {
    const modal = document.getElementById('github-token-modal');
    modal.classList.add('hidden');
}

// GitHub token form handler
document.getElementById('github-token-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const token = document.getElementById('github-token').value;
    const username = document.getElementById('github-username').value;
    
    if (!token || !username) {
        showToast('Please enter both GitHub username and token', 'error');
        return;
    }
    
    // Test GitHub API access
    try {
        const response = await fetch(`https://api.github.com/repos/${username}/${githubRepo}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            githubToken = token;
            githubUsername = username;
            hideGitHubTokenModal();
            showAdminDashboard();
            showToast('GitHub access verified! You can now upload files.');
        } else {
            showToast('Invalid GitHub credentials or repository not found', 'error');
        }
    } catch (error) {
        showToast('Failed to connect to GitHub. Check your credentials.', 'error');
    }
});

// Upload form handler with GitHub API
document.getElementById('upload-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!isLoggedIn || !githubToken) {
        showToast('Please login and configure GitHub access first', 'error');
        return;
    }
    
    const formData = new FormData(e.target);
    const file = formData.get('file');
    const title = formData.get('title');
    const category = formData.get('category');
    
    if (!file || !title || !category) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    // Check file size (GitHub has 100MB limit per file)
    if (file.size > 100 * 1024 * 1024) {
        showToast('File size must be less than 100MB for GitHub storage', 'error');
        return;
    }
    
    try {
        showToast('Uploading to GitHub...', 'info');
        
        // Upload file to GitHub
        const uploadResult = await uploadFileToGitHub(title, file, category);
        
        if (uploadResult.success) {
            showToast('File uploaded successfully! Site will update after rebuild.');
            e.target.reset();
            // Reload portfolio data after a delay to allow GitHub to process
            setTimeout(loadPortfolioFromGitHub, 5000);
        } else {
            showToast(`Upload failed: ${uploadResult.error}`, 'error');
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        showToast('Upload failed. Please try again.', 'error');
    }
});

async function uploadFileToGitHub(title, file, category) {
    try {
        const fileName = file.name;
        const filePath = `uploads/${fileName}`;
        const fileBase64 = await fileToBase64(file);
        
        // Remove data URL prefix for GitHub API
        const base64Content = fileBase64.split(',')[1];
        
        // Upload file to GitHub
        const fileUrl = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${filePath}`;
        
        const fileResponse = await fetch(fileUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: `Upload: ${title}`,
                content: base64Content,
                committer: {
                    name: 'Portfolio Admin',
                    email: 'admin@portfolio.com'
                }
            })
        });
        
        if (!fileResponse.ok) {
            const error = await fileResponse.json();
            throw new Error(error.message || 'Failed to upload file');
        }
        
        // Generate and upload thumbnail
        const thumbnail = await generateThumbnail(file, fileBase64);
        const thumbnailPath = `uploads/thumbs/${fileName.split('.')[0]}.jpg`;
        
        if (thumbnail && thumbnail !== fileBase64) {
            const thumbnailBase64 = thumbnail.split(',')[1];
            
            const thumbnailUrl = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${thumbnailPath}`;
            
            await fetch(thumbnailUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    message: `Thumbnail: ${title}`,
                    content: thumbnailBase64,
                    committer: {
                        name: 'Portfolio Admin',
                        email: 'admin@portfolio.com'
                    }
                })
            });
        }
        
        // Update portfolio.json
        const updateResult = await updatePortfolioJson(title, category, filePath, thumbnailPath, file.type);
        
        return updateResult;
        
    } catch (error) {
        console.error('GitHub upload error:', error);
        return { success: false, error: error.message };
    }
}

async function updatePortfolioJson(title, category, filePath, thumbnailPath, fileType) {
    try {
        // Get current portfolio.json
        const portfolioUrl = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/data/portfolio.json`;
        
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
            sha = fileData.sha;
            const content = atob(fileData.content);
            portfolioData = JSON.parse(content);
        }
        
        // Add new item
        const newItem = {
            id: Date.now().toString(),
            title: title,
            category: category,
            file: filePath,
            type: fileType.split('/')[0], // 'application/pdf' -> 'application'
            thumbnail: thumbnailPath,
            uploadDate: new Date().toISOString(),
            description: `${title} - ${category}`
        };
        
        portfolioData.portfolio.push(newItem);
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
                message: `Add portfolio item: ${title}`,
                content: btoa(JSON.stringify(portfolioData, null, 2)),
                sha: sha,
                committer: {
                    name: 'Portfolio Admin',
                    email: 'admin@portfolio.com'
                }
            })
        });
        
        if (updateResponse.ok) {
            return { success: true };
        } else {
            const error = await updateResponse.json();
            throw new Error(error.message || 'Failed to update portfolio.json');
        }
        
    } catch (error) {
        console.error('Portfolio update error:', error);
        return { success: false, error: error.message };
    }
}

// File conversion utilities
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function generateThumbnail(file, base64) {
    const type = file.type;
    
    if (type.startsWith('image/')) {
        return base64; // Use original image as thumbnail
    }
    
    if (type === 'application/pdf') {
        return 'data:image/svg+xml;base64,' + btoa(`
            <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" fill="#374151"/>
                <text x="100" y="80" text-anchor="middle" fill="#00f3ff" font-size="40">📄</text>
                <text x="100" y="130" text-anchor="middle" fill="#ffffff" font-size="16">PDF</text>
                <text x="100" y="150" text-anchor="middle" fill="#9ca3af" font-size="12">${file.name}</text>
            </svg>
        `);
    }
    
    if (type.startsWith('video/')) {
        return 'data:image/svg+xml;base64,' + btoa(`
            <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" fill="#374151"/>
                <text x="100" y="80" text-anchor="middle" fill="#00f3ff" font-size="40">🎥</text>
                <text x="100" y="130" text-anchor="middle" fill="#ffffff" font-size="16">VIDEO</text>
                <text x="100" y="150" text-anchor="middle" fill="#9ca3af" font-size="12">${file.name}</text>
            </svg>
        `);
    }
    
    // Default document thumbnail
    return 'data:image/svg+xml;base64,' + btoa(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="#374151"/>
            <text x="100" y="80" text-anchor="middle" fill="#00f3ff" font-size="40">📄</text>
            <text x="100" y="130" text-anchor="middle" fill="#ffffff" font-size="16">DOC</text>
            <text x="100" y="150" text-anchor="middle" fill="#9ca3af" font-size="12">${file.name}</text>
        </svg>
    `);
}

// Tab switching
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'text-cyber-blue', 'border-cyber-blue');
        btn.classList.add('text-gray-400');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.remove('hidden');
    
    // Activate button
    event.target.classList.add('active', 'text-cyber-blue', 'border-cyber-blue');
    event.target.classList.remove('text-gray-400');
    
    // Load data for specific tabs
    if (tabName === 'portfolio') {
        loadAdminPortfolio();
    } else if (tabName === 'messages') {
        loadAdminMessages();
    }
}

function loadAdminData() {
    loadAdminPortfolio();
    loadAdminMessages();
}

async function loadAdminPortfolio() {
    const grid = document.getElementById('admin-portfolio-grid');
    
    // Load current portfolio data from GitHub
    await loadPortfolioFromGitHub();
    
    if (portfolioData.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-8">
                <div class="text-4xl text-gray-600 mb-4">📁</div>
                <p class="text-gray-400">No portfolio items uploaded yet.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = '';
    portfolioData.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'glass-effect rounded-lg p-4';
        itemDiv.innerHTML = `
            <img src="https://raw.githubusercontent.com/${githubUsername}/${githubRepo}/main/${item.thumbnail}" alt="${item.title}" class="w-full h-32 object-cover rounded mb-3" onerror="this.src='data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120"><rect width="200" height="120" fill="#374151"/><text x="100" y="60" text-anchor="middle" fill="#9ca3af" font-size="14">No Preview</text></svg>')}'">
            <h4 class="font-semibold text-white mb-1">${item.title}</h4>
            <p class="text-sm text-gray-400 mb-2">${item.category}</p>
            <p class="text-xs text-gray-500 mb-3">${new Date(item.uploadDate).toLocaleDateString()}</p>
            <div class="flex space-x-2">
                <button onclick="previewFile('${item.id}')" class="text-xs bg-cyber-blue text-dark-bg px-3 py-1 rounded hover:bg-white transition-colors">
                    Preview
                </button>
                <button onclick="deletePortfolioItem('${item.id}')" class="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors">
                    Delete
                </button>
            </div>
        `;
        grid.appendChild(itemDiv);
    });
}

function loadAdminMessages() {
    const messagesList = document.getElementById('admin-messages-list');
    const messages = JSON.parse(localStorage.getItem('messages_v2') || '[]');
    
    if (messages.length === 0) {
        messagesList.innerHTML = `
            <div class="text-center py-8">
                <div class="text-4xl text-gray-600 mb-4">📬</div>
                <p class="text-gray-400">No messages received yet.</p>
            </div>
        `;
        return;
    }
    
    messagesList.innerHTML = '';
    messages.reverse().forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `glass-effect rounded-lg p-4 mb-4 ${message.status === 'unread' ? 'border-l-4 border-cyber-blue' : ''}`;
        messageDiv.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h4 class="font-semibold text-white">${message.name}</h4>
                    <p class="text-sm text-cyber-blue">${message.email}</p>
                </div>
                <div class="text-right">
                    <p class="text-xs text-gray-400">${new Date(message.timestamp).toLocaleDateString()}</p>
                    <span class="text-xs px-2 py-1 rounded ${message.status === 'unread' ? 'bg-cyber-blue text-dark-bg' : 'bg-gray-600 text-white'}">
                        ${message.status}
                    </span>
                </div>
            </div>
            <p class="text-gray-300 whitespace-pre-wrap">${message.message}</p>
            ${message.status === 'unread' ? `
                <button onclick="markMessageRead('${message.id}')" class="mt-3 text-sm bg-cyber-blue text-dark-bg px-3 py-1 rounded hover:bg-white transition-colors">
                    Mark as Read
                </button>
            ` : ''}
        `;
        messagesList.appendChild(messageDiv);
    });
}

async function deletePortfolioItem(id) {
    if (!confirm('Are you sure you want to delete this portfolio item?')) {
        return;
    }
    
    if (!githubToken) {
        showToast('GitHub access required to delete files', 'error');
        return;
    }
    
    try {
        const item = portfolioData.find(p => p.id === id);
        if (!item) {
            showToast('Item not found', 'error');
            return;
        }
        
        // Delete file from GitHub
        await deleteFileFromGitHub(item.file);
        
        // Delete thumbnail if exists
        if (item.thumbnail) {
            await deleteFileFromGitHub(item.thumbnail);
        }
        
        // Update portfolio.json
        await removeFromPortfolioJson(id);
        
        showToast('Portfolio item deleted successfully');
        
        // Reload data
        setTimeout(async () => {
            await loadPortfolioFromGitHub();
            loadPortfolioGrid();
            loadAdminPortfolio();
        }, 2000);
        
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Failed to delete item', 'error');
    }
}

async function deleteFileFromGitHub(filePath) {
    try {
        // Get file SHA first
        const getUrl = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${filePath}`;
        const getResponse = await fetch(getUrl, {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (getResponse.ok) {
            const fileData = await getResponse.json();
            
            // Delete the file
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
        // Don't throw - file might not exist
    }
}

async function removeFromPortfolioJson(itemId) {
    try {
        // Get current portfolio.json
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
    } catch (error) {
        console.error('Portfolio update error:', error);
        throw error;
    }
}

function markMessageRead(id) {
    let messages = JSON.parse(localStorage.getItem('messages_v2') || '[]');
    const message = messages.find(m => m.id === id);
    if (message) {
        message.status = 'read';
        localStorage.setItem('messages_v2', JSON.stringify(messages));
        loadAdminMessages();
        showToast('Message marked as read');
    }
}

// Add missing functions for GitHub admin system
window.loadPortfolioFromGitHub = loadPortfolioFromGitHub;

// Make functions global for HTML onclick handlers
window.showAdminModal = showAdminModal;
window.hideAdminModal = hideAdminModal;
window.hideAdminDashboard = hideAdminDashboard;
window.hideGitHubTokenModal = hideGitHubTokenModal;
window.showTab = showTab;
window.deletePortfolioItem = deletePortfolioItem;
window.markMessageRead = markMessageRead;