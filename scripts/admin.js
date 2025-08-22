// Admin Panel Management
class AdminManager {
    constructor() {
        this.isLoggedIn = false;
        this.failedAttempts = 0;
        this.lockoutTime = null;
        this.maxAttempts = 2;
        this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
        this.githubConfig = {
            username: '',
            token: '',
            repo: 'Portfolio-Pro'
        };
        
        this.init();
    }
    
    init() {
        this.loadLockoutState();
        this.initEventListeners();
        this.checkLockoutStatus();
    }
    
    initEventListeners() {
        // Admin panel toggle
        const adminLoginBtn = document.getElementById('admin-login-btn');
        const adminLogout = document.getElementById('admin-logout');
        const closeAdminBtns = document.querySelectorAll('#close-admin, #close-admin-dashboard');
        
        if (adminLoginBtn) {
            adminLoginBtn.addEventListener('click', (e) => this.handleLogin(e));
        }
        
        if (adminLogout) {
            adminLogout.addEventListener('click', () => this.logout());
        }
        
        closeAdminBtns.forEach(btn => {
            btn.addEventListener('click', () => this.hideAdminPanel());
        });
        
        // Upload form
        const uploadForm = document.getElementById('upload-form');
        const uploadArea = document.querySelector('.upload-area');
        const projectFile = document.getElementById('project-file');
        
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => this.handleUpload(e));
        }
        
        if (uploadArea) {
            uploadArea.addEventListener('click', () => {
                if (projectFile) projectFile.click();
            });
            
            // Drag and drop
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '#ffffff';
                uploadArea.style.background = 'rgba(0, 243, 255, 0.05)';
            });
            
            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '#00f3ff';
                uploadArea.style.background = '';
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '#00f3ff';
                uploadArea.style.background = '';
                
                const files = e.dataTransfer.files;
                if (files.length > 0 && projectFile) {
                    projectFile.files = files;
                    this.handleFileSelection(files[0]);
                }
            });
        }
        
        if (projectFile) {
            projectFile.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileSelection(e.target.files[0]);
                }
            });
        }
        
        // Delete modal
        const cancelDelete = document.getElementById('cancel-delete');
        const confirmDelete = document.getElementById('confirm-delete');
        
        if (cancelDelete) {
            cancelDelete.addEventListener('click', () => this.hideDeleteModal());
        }
        
        if (confirmDelete) {
            confirmDelete.addEventListener('click', () => this.confirmDelete());
        }
    }
    
    // Lockout Management
    loadLockoutState() {
        try {
            const stored = localStorage.getItem('admin_lockout');
            if (stored) {
                const data = JSON.parse(stored);
                this.failedAttempts = data.attempts || 0;
                this.lockoutTime = data.lockoutTime || null;
            }
        } catch (error) {
            console.error('Error loading lockout state:', error);
        }
    }
    
    saveLockoutState() {
        try {
            localStorage.setItem('admin_lockout', JSON.stringify({
                attempts: this.failedAttempts,
                lockoutTime: this.lockoutTime
            }));
        } catch (error) {
            console.error('Error saving lockout state:', error);
        }
    }
    
    checkLockoutStatus() {
        if (this.lockoutTime && Date.now() < this.lockoutTime) {
            this.showLockoutMessage();
            return true;
        } else if (this.lockoutTime && Date.now() >= this.lockoutTime) {
            // Lockout expired
            this.failedAttempts = 0;
            this.lockoutTime = null;
            this.saveLockoutState();
            this.hideLockoutMessage();
        }
        return false;
    }
    
    showLockoutMessage() {
        const lockoutMsg = document.getElementById('lockout-message');
        const loginBtn = document.getElementById('admin-login-btn');
        
        if (lockoutMsg && this.lockoutTime) {
            const remainingTime = Math.ceil((this.lockoutTime - Date.now()) / 1000 / 60);
            lockoutMsg.textContent = `Too many failed attempts. Try again in ${remainingTime} minutes.`;
            lockoutMsg.classList.remove('hidden');
        }
        
        if (loginBtn) {
            loginBtn.disabled = true;
        }
    }
    
    hideLockoutMessage() {
        const lockoutMsg = document.getElementById('lockout-message');
        const loginBtn = document.getElementById('admin-login-btn');
        
        if (lockoutMsg) {
            lockoutMsg.classList.add('hidden');
        }
        
        if (loginBtn) {
            loginBtn.disabled = false;
        }
    }
    
    // Authentication
    async handleLogin(e) {
        e.preventDefault();
        
        if (this.checkLockoutStatus()) {
            return;
        }
        
        const username = document.getElementById('admin-username').value;
        const password = document.getElementById('admin-password').value;
        const errorElement = document.getElementById('login-error');
        
        // Clear previous errors
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
        
        // Validate credentials
        if (username === 'shahmeer606' && password === '9MJMKHmjfP695IW') {
            this.isLoggedIn = true;
            this.failedAttempts = 0;
            this.lockoutTime = null;
            this.saveLockoutState();
            
            // Show dashboard
            this.showDashboard();
            await this.loadAdminPortfolio();
        } else {
            this.failedAttempts++;
            this.saveLockoutState();
            
            if (this.failedAttempts >= this.maxAttempts) {
                this.lockoutTime = Date.now() + this.lockoutDuration;
                this.saveLockoutState();
                this.showLockoutMessage();
            } else {
                if (errorElement) {
                    errorElement.textContent = `Invalid credentials. ${this.maxAttempts - this.failedAttempts} attempts remaining.`;
                    errorElement.classList.remove('hidden');
                }
            }
        }
    }
    
    logout() {
        this.isLoggedIn = false;
        this.showLogin();
        this.clearForms();
    }
    
    showLogin() {
        const loginPanel = document.getElementById('admin-login');
        const dashboard = document.getElementById('admin-dashboard');
        
        if (loginPanel) loginPanel.classList.remove('hidden');
        if (dashboard) dashboard.classList.add('hidden');
    }
    
    showDashboard() {
        const loginPanel = document.getElementById('admin-login');
        const dashboard = document.getElementById('admin-dashboard');
        
        if (loginPanel) loginPanel.classList.add('hidden');
        if (dashboard) dashboard.classList.remove('hidden');
    }
    
    clearForms() {
        const forms = document.querySelectorAll('#admin-panel form');
        forms.forEach(form => form.reset());
        
        // Clear file selection
        this.clearFileSelection();
    }
    
    // Panel Management
    toggleAdminPanel() {
        const panel = document.getElementById('admin-panel');
        if (panel) {
            panel.classList.remove('hidden');
        }
    }
    
    hideAdminPanel() {
        const panel = document.getElementById('admin-panel');
        if (panel) {
            panel.classList.add('hidden');
        }
        
        if (!this.isLoggedIn) {
            this.showLogin();
        }
    }
    
    // File Upload
    handleFileSelection(file) {
        const placeholder = document.getElementById('upload-placeholder');
        const fileInfo = document.getElementById('file-info');
        const fileName = document.getElementById('file-name');
        const fileSize = document.getElementById('file-size');
        
        if (file) {
            // Validate file size (100MB max)
            const maxSize = 100 * 1024 * 1024; // 100MB in bytes
            if (file.size > maxSize) {
                this.showMessage('File size must be less than 100MB.', 'error');
                return;
            }
            
            // Validate file type
            const allowedTypes = ['.pdf', '.docx', '.doc', '.mp4', '.mov', '.zip', '.txt'];
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            
            if (!allowedTypes.includes(fileExtension)) {
                this.showMessage('File type not supported. Please upload PDF, DOCX, MP4, MOV, ZIP, or TXT files.', 'error');
                return;
            }
            
            if (placeholder) placeholder.classList.add('hidden');
            if (fileInfo) fileInfo.classList.remove('hidden');
            if (fileName) fileName.textContent = file.name;
            if (fileSize) fileSize.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
        }
    }
    
    clearFileSelection() {
        const placeholder = document.getElementById('upload-placeholder');
        const fileInfo = document.getElementById('file-info');
        const projectFile = document.getElementById('project-file');
        
        if (placeholder) placeholder.classList.remove('hidden');
        if (fileInfo) fileInfo.classList.add('hidden');
        if (projectFile) projectFile.value = '';
    }
    
    async handleUpload(e) {
        e.preventDefault();
        
        if (!this.isLoggedIn) {
            this.showMessage('Please log in first.', 'error');
            return;
        }
        
        const formData = new FormData(e.target);
        const title = formData.get('title') || document.getElementById('project-title').value;
        const category = formData.get('category') || document.getElementById('project-category').value;
        const file = document.getElementById('project-file').files[0];
        const githubUsername = document.getElementById('github-username').value;
        const githubToken = document.getElementById('github-token').value;
        
        // Validate inputs
        if (!title || !category || !file) {
            this.showMessage('Please fill in all fields and select a file.', 'error');
            return;
        }
        
        if (!githubUsername || !githubToken) {
            this.showMessage('Please configure GitHub credentials.', 'error');
            return;
        }
        
        this.githubConfig.username = githubUsername;
        this.githubConfig.token = githubToken;
        
        try {
            this.showUploadProgress();
            
            // Convert file to base64 using binary-safe method
            const base64Content = await this.fileToBase64(file);
            
            // Upload file to GitHub
            const filePath = `uploads/${Date.now()}-${file.name}`;
            await this.uploadToGitHub(filePath, base64Content);
            
            // Update portfolio.json
            await this.updatePortfolioJson({
                id: Date.now().toString(),
                title: title,
                category: category,
                fileName: file.name,
                filePath: filePath,
                uploadDate: new Date().toISOString(),
                description: `${category} project - ${title}`
            });
            
            this.hideUploadProgress();
            this.showMessage('Project uploaded successfully!', 'success');
            
            // Clear form and refresh
            e.target.reset();
            this.clearFileSelection();
            await this.loadAdminPortfolio();
            
            // Refresh main portfolio
            if (window.portfolioApp) {
                await window.portfolioApp.refreshPortfolio();
            }
            
        } catch (error) {
            this.hideUploadProgress();
            console.error('Upload error:', error);
            this.showMessage('Upload failed: ' + error.message, 'error');
        }
    }
    
    // Binary-safe file to base64 conversion
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const uint8Array = new Uint8Array(reader.result);
                let binaryString = '';
                for (let i = 0; i < uint8Array.length; i++) {
                    binaryString += String.fromCharCode(uint8Array[i]);
                }
                resolve(btoa(binaryString));
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
    
    // GitHub API Integration
    async uploadToGitHub(filePath, base64Content) {
        const url = `https://api.github.com/repos/${this.githubConfig.username}/${this.githubConfig.repo}/contents/${filePath}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${this.githubConfig.token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: `Upload ${filePath}`,
                content: base64Content,
                branch: 'main'
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `GitHub API error: ${response.status}`);
        }
        
        return response.json();
    }
    
    async updatePortfolioJson(newItem) {
        // First, get current portfolio.json
        let currentData = { portfolio: [] };
        
        try {
            const getUrl = `https://api.github.com/repos/${this.githubConfig.username}/${this.githubConfig.repo}/contents/data/portfolio.json`;
            const getResponse = await fetch(getUrl, {
                headers: {
                    'Authorization': `token ${this.githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (getResponse.ok) {
                const fileData = await getResponse.json();
                const content = atob(fileData.content);
                currentData = JSON.parse(content);
            }
        } catch (error) {
            console.warn('Could not fetch existing portfolio.json, creating new:', error);
        }
        
        // Add new item
        currentData.portfolio = currentData.portfolio || [];
        currentData.portfolio.push(newItem);
        
        // Update portfolio.json
        const putUrl = `https://api.github.com/repos/${this.githubConfig.username}/${this.githubConfig.repo}/contents/data/portfolio.json`;
        const content = btoa(JSON.stringify(currentData, null, 2));
        
        const body = {
            message: `Update portfolio with ${newItem.title}`,
            content: content,
            branch: 'main'
        };
        
        // Get SHA if file exists
        try {
            const getResponse = await fetch(putUrl, {
                headers: {
                    'Authorization': `token ${this.githubConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (getResponse.ok) {
                const fileData = await getResponse.json();
                body.sha = fileData.sha;
            }
        } catch (error) {
            // File doesn't exist yet, no SHA needed
        }
        
        const response = await fetch(putUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${this.githubConfig.token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify(body)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Failed to update portfolio.json: ${response.status}`);
        }
        
        return response.json();
    }
    
    // Progress UI
    showUploadProgress() {
        const progress = document.getElementById('upload-progress');
        const submitBtn = document.querySelector('.upload-submit');
        
        if (progress) progress.classList.remove('hidden');
        if (submitBtn) submitBtn.disabled = true;
        
        // Simulate progress
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        let percent = 0;
        const interval = setInterval(() => {
            percent += Math.random() * 15;
            if (percent > 90) percent = 90;
            
            if (progressFill) progressFill.style.width = percent + '%';
            if (progressText) progressText.textContent = `Uploading... ${Math.round(percent)}%`;
        }, 200);
        
        this._progressInterval = interval;
    }
    
    hideUploadProgress() {
        const progress = document.getElementById('upload-progress');
        const submitBtn = document.querySelector('.upload-submit');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (this._progressInterval) {
            clearInterval(this._progressInterval);
        }
        
        if (progressFill) progressFill.style.width = '100%';
        if (progressText) progressText.textContent = 'Upload complete!';
        
        setTimeout(() => {
            if (progress) progress.classList.add('hidden');
            if (submitBtn) submitBtn.disabled = false;
            if (progressFill) progressFill.style.width = '0%';
            if (progressText) progressText.textContent = 'Uploading...';
        }, 1000);
    }
    
    // Portfolio Management
    async loadAdminPortfolio() {
        if (!this.isLoggedIn) return;
        
        try {
            const response = await fetch('/data/portfolio.json');
            const data = response.ok ? await response.json() : { portfolio: [] };
            this.renderAdminPortfolio(data.portfolio || []);
        } catch (error) {
            console.error('Error loading admin portfolio:', error);
            this.renderAdminPortfolio([]);
        }
    }
    
    renderAdminPortfolio(items) {
        const grid = document.getElementById('admin-portfolio-grid');
        if (!grid) return;
        
        if (items.length === 0) {
            grid.innerHTML = '<p class="text-gray-400 text-center py-8">No portfolio items yet.</p>';
            return;
        }
        
        grid.innerHTML = items.map(item => this.createAdminPortfolioItem(item)).join('');
    }
    
    createAdminPortfolioItem(item) {
        const fileExt = item.fileName.split('.').pop().toLowerCase();
        const iconClass = this.getFileIconClass(fileExt);
        
        return `
            <div class="admin-portfolio-item" data-testid="admin-item-${item.id}">
                <div class="admin-item-info">
                    <div class="file-icon ${iconClass}">${fileExt.toUpperCase()}</div>
                    <div class="admin-item-details">
                        <h4 data-testid="text-admin-title-${item.id}">${this.escapeHtml(item.title)}</h4>
                        <p data-testid="text-admin-category-${item.id}">${this.escapeHtml(item.category)}</p>
                    </div>
                </div>
                <button class="delete-button" data-testid="button-delete-${item.id}" onclick="adminManager.showDeleteModal('${item.id}', '${this.escapeHtml(item.fileName)}')">
                    Delete
                </button>
            </div>
        `;
    }
    
    getFileIconClass(extension) {
        const iconMap = {
            'pdf': 'pdf-icon',
            'docx': 'docx-icon',
            'doc': 'docx-icon',
            'mp4': 'mp4-icon',
            'mov': 'mp4-icon',
            'zip': 'zip-icon',
            'txt': 'txt-icon'
        };
        
        return iconMap[extension] || 'default-icon';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Delete Management
    showDeleteModal(itemId, fileName) {
        this._deleteItemId = itemId;
        
        const modal = document.getElementById('delete-modal');
        const itemName = document.getElementById('delete-item-name');
        
        if (itemName) {
            itemName.textContent = fileName;
        }
        
        if (modal) {
            modal.classList.remove('hidden');
        }
    }
    
    hideDeleteModal() {
        const modal = document.getElementById('delete-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this._deleteItemId = null;
    }
    
    async confirmDelete() {
        if (!this._deleteItemId || !this.isLoggedIn) {
            this.hideDeleteModal();
            return;
        }
        
        try {
            // Get current portfolio data
            const response = await fetch('/data/portfolio.json');
            const data = response.ok ? await response.json() : { portfolio: [] };
            const portfolio = data.portfolio || [];
            
            // Find item to delete
            const itemToDelete = portfolio.find(item => item.id === this._deleteItemId);
            if (!itemToDelete) {
                throw new Error('Item not found');
            }
            
            // Delete file from GitHub
            await this.deleteFileFromGitHub(itemToDelete.filePath);
            
            // Update portfolio.json
            const updatedPortfolio = portfolio.filter(item => item.id !== this._deleteItemId);
            await this.updatePortfolioJsonDirect({ portfolio: updatedPortfolio });
            
            this.hideDeleteModal();
            this.showMessage('Item deleted successfully!', 'success');
            
            // Refresh both admin and main portfolio
            await this.loadAdminPortfolio();
            if (window.portfolioApp) {
                await window.portfolioApp.refreshPortfolio();
            }
            
        } catch (error) {
            console.error('Delete error:', error);
            this.showMessage('Delete failed: ' + error.message, 'error');
            this.hideDeleteModal();
        }
    }
    
    async deleteFileFromGitHub(filePath) {
        const url = `https://api.github.com/repos/${this.githubConfig.username}/${this.githubConfig.repo}/contents/${filePath}`;
        
        // Get file SHA first
        const getResponse = await fetch(url, {
            headers: {
                'Authorization': `token ${this.githubConfig.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!getResponse.ok) {
            throw new Error('File not found or access denied');
        }
        
        const fileData = await getResponse.json();
        
        // Delete file
        const deleteResponse = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${this.githubConfig.token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: `Delete ${filePath}`,
                sha: fileData.sha,
                branch: 'main'
            })
        });
        
        if (!deleteResponse.ok) {
            const error = await deleteResponse.json();
            throw new Error(error.message || `GitHub API error: ${deleteResponse.status}`);
        }
        
        return deleteResponse.json();
    }
    
    async updatePortfolioJsonDirect(data) {
        const url = `https://api.github.com/repos/${this.githubConfig.username}/${this.githubConfig.repo}/contents/data/portfolio.json`;
        
        // Get current SHA
        const getResponse = await fetch(url, {
            headers: {
                'Authorization': `token ${this.githubConfig.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        let sha = null;
        if (getResponse.ok) {
            const fileData = await getResponse.json();
            sha = fileData.sha;
        }
        
        const content = btoa(JSON.stringify(data, null, 2));
        const body = {
            message: 'Update portfolio data',
            content: content,
            branch: 'main'
        };
        
        if (sha) {
            body.sha = sha;
        }
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${this.githubConfig.token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify(body)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Failed to update portfolio.json: ${response.status}`);
        }
        
        return response.json();
    }
    
    // Message System
    showMessage(text, type = 'info') {
        if (window.portfolioApp) {
            window.portfolioApp.showMessage(text, type);
        } else {
            console.log(`${type.toUpperCase()}: ${text}`);
        }
    }
}

// Initialize admin manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});
