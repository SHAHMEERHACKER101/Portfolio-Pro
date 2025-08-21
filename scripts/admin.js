// GitHub-backed CMS Admin functionality
let isLoggedIn = false;
let githubToken = null;
let githubUsername = null;
let githubRepo = 'Portfolio-Pro'; // ✅ Your correct repo name

// Admin credentials
const ADMIN_USERNAME = 'shahmeer606';
const ADMIN_PASSWORD = '9MJMKHmjfP695IW';

// Portfolio data (loaded from GitHub)
let portfolioData = [];

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
        showToast('Admin login successful! Please enter your GitHub token.', 'success');
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
    
    // Update global vars
    githubToken = token;
    githubUsername = username;

    // Test GitHub API access
    try {
        const response = await fetch(`https://api.github.com/repos/${username}/${githubRepo}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            hideGitHubTokenModal();
            showAdminDashboard();
            showToast('GitHub access verified! You can now upload files.', 'success');
            loadAdminPortfolio(); // Load existing items
        } else {
            const error = await response.json();
            showToast(`GitHub error: ${error.message}`, 'error');
        }
    } catch (error) {
        showToast('Failed to connect to GitHub. Check your internet and credentials.', 'error');
        console.error('GitHub connection error:', error);
    }
});

// Upload form handler with GitHub API
document.getElementById('upload-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!isLoggedIn || !githubToken || !githubUsername) {
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
    
    // Check file size (< 100MB for GitHub)
    if (file.size > 100 * 1024 * 1024) {
        showToast('File size must be less than 100MB', 'error');
        return;
    }
    
    try {
        showToast('Uploading to GitHub...', 'info');
        
        // Upload file to GitHub
        const uploadResult = await uploadFileToGitHub(title, file, category);
        
        if (uploadResult.success) {
            showToast('✅ File uploaded successfully! Rebuilding site...', 'success');
            e.target.reset();
            setTimeout(loadAdminPortfolio, 3000); // Reload after upload
        } else {
            showToast(`❌ Upload failed: ${uploadResult.error}`, 'error');
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
        const base64Content = fileBase64.split(',')[1]; // Remove data URL prefix

        // ✅ Clean URL — no extra spaces!
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
                    name: 'Shahmeer Baqai',
                    email: 'shahmeer606@gmail.com'
                }
            })
        });

        if (!fileResponse.ok) {
            const error = await fileResponse.json();
            throw new Error(error.message || 'Failed to upload file');
        }

        // Generate thumbnail
        const thumbnail = await generateThumbnail(file);
        const thumbnailPath = `uploads/thumbs/${fileName.split('.')[0]}.svg`;

        if (thumbnail) {
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
                        name: 'Shahmeer Baqai',
                        email: 'shahmeer606@gmail.com'
                    }
                })
            });
        }

        // Update portfolio.json
        const updateResult = await updatePortfolioJson(
            title, 
            category, 
            filePath, 
            thumbnailPath, 
            file.type
        );

        return updateResult;

    } catch (error) {
        console.error('GitHub upload error:', error);
        return { success: false, error: error.message };
    }
}

async function updatePortfolioJson(title, category, filePath, thumbnailPath, fileType) {
    try {
        const portfolioUrl = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/data/portfolio.json`;

        const getResponse = await fetch(portfolioUrl, {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        let data = { portfolio: [], lastUpdated: new Date().toISOString() };
        let sha = null;

        if (getResponse.ok) {
            const fileData = await getResponse.json();
            sha = fileData.sha;
            const content = atob(fileData.content);
            data = JSON.parse(content);
        }

        // Add new item
        const newItem = {
            id: Date.now().toString(),
            title,
            category,
            file: filePath,
            type: fileType.split('/')[0],
            thumbnail: thumbnailPath,
            uploadDate: new Date().toISOString()
        };

        data.portfolio.unshift(newItem); // Newest first
        data.lastUpdated = new Date().toISOString();

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
                content: btoa(JSON.stringify(data, null, 2)),
                sha,
                committer: {
                    name: 'Shahmeer Baqai',
                    email: 'shahmeer606@gmail.com'
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

async function generateThumbnail(file) {
    const type = file.type;

    if (type.startsWith('image/')) {
        return await fileToBase64(file);
    }

    if (type === 'application/pdf') {
        return 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="120">
                <rect width="200" height="120" fill="#0f111a"/>
                <text x="100" y="60" text-anchor="middle" fill="#00f3ff" font-size="24">📄 PDF</text>
                <text x="100" y="90" text-anchor="middle" fill="#9ca3af" font-size="12">${file.name.slice(0,16)}...</text>
            </svg>
        `);
    }

    if (type.startsWith('video/')) {
        return 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="120">
                <rect width="200" height="120" fill="#0f111a"/>
                <text x="100" y="60" text-anchor="middle" fill="#00f3ff" font-size="24">🎥 Video</text>
                <text x="100" y="90" text-anchor="middle" fill="#9ca3af" font-size="12">${file.name.slice(0,16)}...</text>
            </svg>
        `);
    }

    // Default for DOCX, TXT, etc.
    return 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="120">
            <rect width="200" height="120" fill="#0f111a"/>
            <text x="100" y="60" text-anchor="middle" fill="#00f3ff" font-size="24">📄 Doc</text>
            <text x="100" y="90" text-anchor="middle" fill="#9ca3af" font-size="12">${file.name.slice(0,16)}...</text>
        </svg>
    `);
}

// Tab switching
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'text-cyber-blue', 'border-cyber-blue');
        btn.classList.add('text-gray-400');
    });

    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
    event.target.classList.add('active', 'text-cyber-blue', 'border-cyber-blue');
    event.target.classList.remove('text-gray-400');

    if (tabName === 'portfolio') loadAdminPortfolio();
    if (tabName === 'messages') loadAdminMessages();
}

function loadAdminData() {
    loadAdminPortfolio();
    loadAdminMessages();
}

async function loadAdminPortfolio() {
    const grid = document.getElementById('admin-portfolio-grid');
    await loadPortfolioFromGitHub();

    if (portfolioData.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-8">
                <div class="text-4xl text-gray-600 mb-4">📁</div>
                <p class="text-gray-400">No portfolio items yet.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = '';
    portfolioData.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'glass-effect rounded-lg p-4';
        itemDiv.innerHTML = `
            <img src="https://raw.githubusercontent.com/${githubUsername}/${githubRepo}/main/${item.thumbnail}" 
                 alt="${item.title}" class="w-full h-32 object-cover rounded mb-3"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iIzBmMTExYSIvPjx0ZXh0IHg9IjEwMCIgeT0iNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiIGZvbnQtc2l6ZT0iMTQiPk5vIFByZXZpZXc8L3RleHQ+PC9zdmc+'">
            <h4 class="font-semibold text-white mb-1">${item.title}</h4>
            <p class="text-sm text-gray-400 mb-2">${item.category}</p>
            <p class="text-xs text-gray-500 mb-3">${new Date(item.uploadDate).toLocaleDateString()}</p>
            <div class="flex space-x-2">
                <button onclick="previewFile('${item.id}')" class="text-xs bg-cyber-blue text-dark-bg px-3 py-1 rounded hover:bg-white transition-colors">Preview</button>
                <button onclick="deletePortfolioItem('${item.id}')" class="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors">Delete</button>
            </div>
        `;
        grid.appendChild(itemDiv);
    });
}

// Add this function to fix the missing one
async function loadPortfolioFromGitHub() {
    if (!githubToken || !githubUsername) return;

    try {
        const url = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/data/portfolio.json`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            const content = atob(data.content);
            const parsed = JSON.parse(content);
            portfolioData = parsed.portfolio || [];
        } else {
            portfolioData = [];
        }
    } catch (error) {
        portfolioData = [];
        console.error('Failed to load portfolio.json:', error);
    }
}

function loadAdminMessages() {
    const messagesList = document.getElementById('admin-messages-list');
    const messages = JSON.parse(localStorage.getItem('messages_v2') || '[]');
    
    if (messages.length === 0) {
        messagesList.innerHTML = `
            <div class="text-center py-8">
                <div class="text-4xl text-gray-600 mb-4">📬</div>
                <p class="text-gray-400">No messages yet.</p>
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
    if (!confirm('Delete this item?')) return;
    if (!githubToken) {
        showToast('GitHub access required', 'error');
        return;
    }

    try {
        const item = portfolioData.find(p => p.id === id);
        if (!item) return;

        // Delete file
        await deleteFileFromGitHub(item.file);
        if (item.thumbnail) await deleteFileFromGitHub(item.thumbnail);

        // Update portfolio.json
        await removeFromPortfolioJson(id);

        showToast('✅ Item deleted!');
        setTimeout(loadAdminPortfolio, 2000);
    } catch (error) {
        showToast('❌ Delete failed', 'error');
        console.error('Delete error:', error);
    }
}

async function deleteFileFromGitHub(filePath) {
    try {
        const url = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${filePath}`;
        const getResponse = await fetch(url, {
            headers: { 'Authorization': `token ${githubToken}` }
        });

        if (getResponse.ok) {
            const fileData = await getResponse.json();
            await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Delete: ${filePath}`,
                    sha: fileData.sha,
                    committer: { name: 'Shahmeer Baqai', email: 'shahmeer606@gmail.com' }
                })
            });
        }
    } catch (error) {
        console.error('Delete failed:', error);
    }
}

async function removeFromPortfolioJson(itemId) {
    try {
        const url = `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/data/portfolio.json`;
        const getResponse = await fetch(url, {
            headers: { 'Authorization': `token ${githubToken}` }
        });

        if (getResponse.ok) {
            const fileData = await getResponse.json();
            const content = atob(fileData.content);
            const data = JSON.parse(content);
            data.portfolio = data.portfolio.filter(item => item.id !== itemId);
            data.lastUpdated = new Date().toISOString();

            await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Remove item: ${itemId}`,
                    content: btoa(JSON.stringify(data, null, 2)),
                    sha: fileData.sha,
                    committer: { name: 'Shahmeer Baqai', email: 'shahmeer606@gmail.com' }
                })
            });
        }
    } catch (error) {
        console.error('Update failed:', error);
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
        showToast('Marked as read');
    }
}

// Make functions globally available
window.showAdminModal = showAdminModal;
window.hideAdminModal = hideAdminModal;
window.hideAdminDashboard = hideAdminDashboard;
window.hideGitHubTokenModal = hideGitHubTokenModal;
window.showTab = showTab;
window.deletePortfolioItem = deletePortfolioItem;
window.markMessageRead = markMessageRead;
window.loadPortfolioFromGitHub = loadPortfolioFromGitHub;