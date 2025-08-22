// Admin Panel JavaScript for Shahmeer Baqai Portfolio
// Handles authentication, GitHub integration, and portfolio management

class AdminManager {
    constructor() {
        this.isAuthenticated = false;
        this.isLocked = false;
        this.failedAttempts = 0;
        this.lockoutEndTime = null;
        this.githubConfig = null;
        this.currentView = 'login'; // login, github, dashboard
        
        // Admin credentials (in production, these should be environment variables)
        this.ADMIN_USERNAME = 'shahmeer606';
        this.ADMIN_PASSWORD = '9MJMKHmjfP695IW';
        
        this.init();
    }

    init() {
        this.checkAuthState();
        this.checkLockoutState();
        this.loadGitHubConfig();
        this.setupEventListeners();
    }

    checkAuthState() {
        const authState = localStorage.getItem('adminAuthenticated');
        if (authState === 'true') {
            this.isAuthenticated = true;
            this.updateAdminButton();
        }
    }

    checkLockoutState() {
        const lockoutTime = localStorage.getItem('adminLockout');
        if (lockoutTime) {
            const lockoutEnd = parseInt(lockoutTime);
            if (Date.now() < lockoutEnd) {
                this.isLocked = true;
                this.lockoutEndTime = lockoutEnd;
                
                const timeLeft = lockoutEnd - Date.now();
                setTimeout(() => {
                    this.isLocked = false;
                    this.lockoutEndTime = null;
                    localStorage.removeItem('adminLockout');
                }, timeLeft);
            } else {
                localStorage.removeItem('adminLockout');
            }
        }
    }

    loadGitHubConfig() {
        const stored = localStorage.getItem('githubConfig');
        if (stored) {
            try {
                this.githubConfig = JSON.parse(stored);
            } catch (e) {
                console.error('Error loading GitHub config:', e);
            }
        }
    }

    setupEventListeners() {
        const adminBtn = document.getElementById('admin-btn');
        if (adminBtn) {
            adminBtn.addEventListener('click', () => {
                if (this.isAuthenticated) {
                    this.showDashboard();
                } else {
                    this.showLoginModal();
                }
            });
        }
    }

    updateAdminButton() {
        const adminBtn = document.getElementById('admin-btn');
        if (adminBtn && this.isAuthenticated) {
            const unreadCount = this.getUnreadMessagesCount();
            if (unreadCount > 0) {
                adminBtn.innerHTML = `Dashboard <span class="bg-red-500 text-xs px-2 py-1 rounded-full ml-2">${unreadCount}</span>`;
            } else {
                adminBtn.textContent = 'Dashboard';
            }
        }
    }

    getUnreadMessagesCount() {
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        return messages.filter(msg => !msg.read).length;
    }

    showLoginModal() {
        const adminModal = document.getElementById('admin-modal');
        const adminContent = document.getElementById('admin-content');
        
        if (this.isLocked) {
            const remainingMinutes = Math.ceil(this.getRemainingLockoutTime() / 1000 / 60);
            adminContent.innerHTML = `
                <div class="text-center">
                    <h2 class="text-3xl font-bold mb-8 text-white">Admin Access</h2>
                    <p class="text-red-400 mb-4">
                        Account locked. Try again in ${remainingMinutes} minutes.
                    </p>
                    <button onclick="adminManager.closeModal()" class="w-full bg-gray-600 text-white hover:bg-gray-700 px-6 py-3 rounded-lg">
                        Close
                    </button>
                </div>
            `;
        } else {
            adminContent.innerHTML = `
                <div>
                    <h2 class="text-3xl font-bold mb-8 text-center text-white">Admin Access</h2>
                    <form id="login-form" class="space-y-4">
                        <input
                            type="text"
                            id="login-username"
                            placeholder="Username"
                            class="w-full px-4 py-3 bg-dark-bg border border-cyber-blue/30 rounded-lg text-white focus:outline-none focus:border-cyber-blue"
                            required
                        />
                        <div class="relative">
                            <input
                                type="password"
                                id="login-password"
                                placeholder="Password"
                                class="w-full px-4 py-3 bg-dark-bg border border-cyber-blue/30 rounded-lg text-white focus:outline-none focus:border-cyber-blue pr-12"
                                required
                            />
                            <button
                                type="button"
                                id="toggle-password"
                                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                </svg>
                            </button>
                        </div>
                        <div class="flex space-x-4">
                            <button
                                type="submit"
                                class="flex-1 bg-cyber-blue text-dark-bg hover:bg-white font-bold py-3 rounded-lg transition-colors"
                            >
                                Login
                            </button>
                            <button
                                type="button"
                                onclick="adminManager.closeModal()"
                                class="flex-1 bg-gray-600 text-white hover:bg-gray-700 py-3 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            `;

            // Setup form handler
            const loginForm = document.getElementById('login-form');
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            }

            // Setup password toggle
            const togglePassword = document.getElementById('toggle-password');
            const passwordInput = document.getElementById('login-password');
            if (togglePassword && passwordInput) {
                togglePassword.addEventListener('click', () => {
                    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                    passwordInput.setAttribute('type', type);
                });
            }
        }
        
        adminModal.classList.remove('hidden');
    }

    handleLogin(e) {
        e.preventDefault();
        
        if (this.isLocked) {
            const remainingTime = Math.ceil(this.getRemainingLockoutTime() / 1000 / 60);
            alert(`Account locked. Try again in ${remainingTime} minutes.`);
            return;
        }

        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        if (username === this.ADMIN_USERNAME && password === this.ADMIN_PASSWORD) {
            this.isAuthenticated = true;
            this.failedAttempts = 0;
            localStorage.setItem('adminAuthenticated', 'true');
            localStorage.removeItem('adminLockout');
            
            if (this.githubConfig) {
                this.showDashboard();
            } else {
                this.showGitHubSetup();
            }
            
            this.updateAdminButton();
            alert('Login successful!');
        } else {
            this.failedAttempts++;
            
            if (this.failedAttempts >= 2) {
                // Lock for 15 minutes
                const lockoutEnd = Date.now() + (15 * 60 * 1000);
                this.isLocked = true;
                this.lockoutEndTime = lockoutEnd;
                localStorage.setItem('adminLockout', lockoutEnd.toString());
                
                setTimeout(() => {
                    this.isLocked = false;
                    this.lockoutEndTime = null;
                    this.failedAttempts = 0;
                    localStorage.removeItem('adminLockout');
                }, 15 * 60 * 1000);
                
                this.showLoginModal(); // Refresh to show locked state
            }
            
            alert('Invalid credentials. Please try again.');
        }
    }

    getRemainingLockoutTime() {
        if (!this.lockoutEndTime) return 0;
        return Math.max(0, this.lockoutEndTime - Date.now());
    }

    showGitHubSetup() {
        const adminContent = document.getElementById('admin-content');
        adminContent.innerHTML = `
            <div>
                <h2 class="text-3xl font-bold mb-8 text-center text-white">GitHub Configuration</h2>
                <form id="github-form" class="space-y-4">
                    <input
                        type="text"
                        id="github-username"
                        placeholder="GitHub Username"
                        class="w-full px-4 py-3 bg-dark-bg border border-cyber-blue/30 rounded-lg text-white focus:outline-none focus:border-cyber-blue"
                        required
                    />
                    <div class="relative">
                        <input
                            type="password"
                            id="github-token"
                            placeholder="Personal Access Token"
                            class="w-full px-4 py-3 bg-dark-bg border border-cyber-blue/30 rounded-lg text-white focus:outline-none focus:border-cyber-blue pr-12"
                            required
                        />
                        <button
                            type="button"
                            id="toggle-token"
                            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                        </button>
                    </div>
                    <input
                        type="text"
                        value="Portfolio-Pro"
                        readonly
                        class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300"
                    />
                    <div id="connection-error" class="text-red-400 text-sm hidden"></div>
                    <button
                        type="submit"
                        id="connect-btn"
                        class="w-full bg-cyber-blue text-dark-bg hover:bg-white font-bold py-3 rounded-lg transition-colors"
                    >
                        Connect GitHub
                    </button>
                </form>
            </div>
        `;

        // Setup form handler
        const githubForm = document.getElementById('github-form');
        if (githubForm) {
            githubForm.addEventListener('submit', (e) => this.handleGitHubSetup(e));
        }

        // Setup token toggle
        const toggleToken = document.getElementById('toggle-token');
        const tokenInput = document.getElementById('github-token');
        if (toggleToken && tokenInput) {
            toggleToken.addEventListener('click', () => {
                const type = tokenInput.getAttribute('type') === 'password' ? 'text' : 'password';
                tokenInput.setAttribute('type', type);
            });
        }
    }

    async handleGitHubSetup(e) {
        e.preventDefault();
        
        const connectBtn = document.getElementById('connect-btn');
        const errorDiv = document.getElementById('connection-error');
        
        connectBtn.textContent = 'Connecting...';
        connectBtn.disabled = true;
        errorDiv.classList.add('hidden');

        const username = document.getElementById('github-username').value;
        const token = document.getElementById('github-token').value;
        const repo = 'Portfolio-Pro';

        try {
            // Test GitHub connection
            const response = await fetch(`https://api.github.com/repos/${username}/${repo}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });

            if (response.ok) {
                this.githubConfig = { username, token, repo };
                localStorage.setItem('githubConfig', JSON.stringify(this.githubConfig));
                this.showDashboard();
                alert('GitHub connected successfully!');
            } else {
                throw new Error('Failed to connect to GitHub repository');
            }
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        } finally {
            connectBtn.textContent = 'Connect GitHub';
            connectBtn.disabled = false;
        }
    }

    showDashboard() {
        this.currentView = 'dashboard';
        const adminContent = document.getElementById('admin-content');
        
        adminContent.innerHTML = `
            <div>
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-3xl font-bold text-white">Portfolio Dashboard</h2>
                    <div class="flex space-x-4">
                        <button onclick="adminManager.showMessages()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            Messages (${this.getUnreadMessagesCount()})
                        </button>
                        <button onclick="adminManager.logout()" class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                            Logout
                        </button>
                        <button onclick="adminManager.closeModal()" class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                            Close
                        </button>
                    </div>
                </div>

                <!-- Upload Form -->
                <div class="bg-dark-bg rounded-2xl p-6 mb-8">
                    <h3 class="text-xl font-bold mb-4 text-white">Upload New Item</h3>
                    <form id="upload-form" class="space-y-4">
                        <input
                            type="text"
                            id="upload-title"
                            placeholder="Project Title"
                            class="w-full px-4 py-3 bg-card-bg border border-cyber-blue/30 rounded-lg text-white focus:outline-none focus:border-cyber-blue"
                            required
                        />
                        <select
                            id="upload-category"
                            class="w-full px-4 py-3 bg-card-bg border border-cyber-blue/30 rounded-lg text-white focus:outline-none focus:border-cyber-blue"
                            required
                        >
                            <option value="">Select Category</option>
                            <option value="High-Converting Ads">High-Converting Ads</option>
                            <option value="Viral Short Videos">Viral Short Videos</option>
                            <option value="Books & Podcasts">Books & Podcasts</option>
                            <option value="Pinterest That Sells">Pinterest That Sells</option>
                            <option value="Web Tools & Extensions">Web Tools & Extensions</option>
                            <option value="AI-Powered Visuals">AI-Powered Visuals</option>
                        </select>
                        <input
                            type="file"
                            id="upload-file"
                            accept=".pdf,.mp4,.docx"
                            class="w-full px-4 py-3 bg-card-bg border border-cyber-blue/30 rounded-lg text-white focus:outline-none focus:border-cyber-blue"
                            required
                        />
                        <button
                            type="submit"
                            id="upload-btn"
                            class="w-full bg-cyber-blue text-dark-bg hover:bg-white font-bold py-3 rounded-lg transition-colors"
                        >
                            Upload (Max 200MB)
                        </button>
                    </form>
                    <div id="upload-progress" class="mt-4 hidden">
                        <div class="bg-gray-700 rounded-full h-2">
                            <div id="progress-bar" class="bg-cyber-blue h-2 rounded-full" style="width: 0%"></div>
                        </div>
                        <p id="progress-text" class="text-sm text-gray-400 mt-2">Uploading...</p>
                    </div>
                </div>

                <!-- Portfolio Grid -->
                <div class="bg-dark-bg rounded-2xl p-6">
                    <h3 class="text-xl font-bold mb-4 text-white">Manage Portfolio</h3>
                    <div id="portfolio-items" class="space-y-4 max-h-96 overflow-y-auto">
                        <!-- Portfolio items will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        // Setup upload form
        const uploadForm = document.getElementById('upload-form');
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => this.handleUpload(e));
        }

        this.loadPortfolioItems();
    }

    showMessages() {
        const adminContent = document.getElementById('admin-content');
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        
        adminContent.innerHTML = `
            <div>
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-3xl font-bold text-white">Messages</h2>
                    <button onclick="adminManager.showDashboard()" class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                        Back to Dashboard
                    </button>
                </div>
                <div class="space-y-4 max-h-96 overflow-y-auto">
                    ${messages.length === 0 ? 
                        '<p class="text-gray-400 text-center py-8">No messages yet.</p>' :
                        messages.map(msg => `
                            <div class="bg-card-bg rounded-lg p-4 ${msg.read ? '' : 'border-l-4 border-cyber-blue'}">
                                <div class="flex justify-between items-start mb-2">
                                    <div>
                                        <strong class="text-white">${msg.name}</strong>
                                        <span class="text-gray-400 text-sm ml-2">${msg.email}</span>
                                    </div>
                                    <div class="text-xs text-gray-500">
                                        ${new Date(msg.timestamp).toLocaleDateString()}
                                    </div>
                                </div>
                                <p class="text-gray-300">${msg.message}</p>
                                <div class="mt-2">
                                    ${!msg.read ? `<button onclick="adminManager.markAsRead('${msg.id}')" class="text-cyber-blue text-sm hover:underline">Mark as Read</button>` : ''}
                                    <button onclick="adminManager.deleteMessage('${msg.id}')" class="text-red-400 text-sm hover:underline ml-4">Delete</button>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;
    }

    markAsRead(messageId) {
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        const updatedMessages = messages.map(msg =>
            msg.id === messageId ? { ...msg, read: true } : msg
        );
        localStorage.setItem('messages', JSON.stringify(updatedMessages));
        this.showMessages();
        this.updateAdminButton();
    }

    deleteMessage(messageId) {
        if (confirm('Are you sure you want to delete this message?')) {
            const messages = JSON.parse(localStorage.getItem('messages') || '[]');
            const updatedMessages = messages.filter(msg => msg.id !== messageId);
            localStorage.setItem('messages', JSON.stringify(updatedMessages));
            this.showMessages();
            this.updateAdminButton();
        }
    }

    async handleUpload(e) {
        e.preventDefault();
        
        if (!this.githubConfig) {
            alert('GitHub not configured');
            return;
        }

        const title = document.getElementById('upload-title').value;
        const category = document.getElementById('upload-category').value;
        const fileInput = document.getElementById('upload-file');
        const file = fileInput.files[0];

        if (!file) {
            alert('Please select a file');
            return;
        }

        // Validate file
        const maxSize = 200 * 1024 * 1024; // 200MB
        const allowedTypes = ['application/pdf', 'video/mp4', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        
        if (file.size > maxSize) {
            alert('File size exceeds 200MB limit');
            return;
        }

        if (!allowedTypes.includes(file.type)) {
            alert('Only PDF, MP4, and DOCX files are allowed');
            return;
        }

        const uploadBtn = document.getElementById('upload-btn');
        const progressDiv = document.getElementById('upload-progress');
        
        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Uploading...';
        progressDiv.classList.remove('hidden');

        try {
            // Convert file to base64
            const base64Content = await this.convertFileToBase64(file);
            
            // Generate filename
            const timestamp = Date.now();
            const fileExtension = file.name.split('.').pop();
            const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.${fileExtension}`;

            // Upload to GitHub
            await this.uploadToGitHub(fileName, base64Content, `Upload ${title}`);

            // Generate thumbnail
            const thumbnail = await this.generateThumbnail(file);

            // Create portfolio item
            const newItem = {
                id: `item_${timestamp}`,
                title,
                category,
                fileName,
                fileType: file.type === 'video/mp4' ? 'mp4' : 
                         file.type === 'application/pdf' ? 'pdf' : 'docx',
                fileSize: file.size,
                thumbnail,
                uploadDate: new Date().toISOString(),
                githubPath: `uploads/${fileName}`
            };

            // Update portfolio data
            await this.updatePortfolioData(newItem);
            
            alert('Upload successful!');
            document.getElementById('upload-form').reset();
            this.loadPortfolioItems();
        } catch (error) {
            alert('Upload failed: ' + error.message);
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload (Max 200MB)';
            progressDiv.classList.add('hidden');
        }
    }

    async convertFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const arrayBuffer = reader.result;
                    const uint8Array = new Uint8Array(arrayBuffer);
                    const base64String = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
                    resolve(base64String);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }

    async generateThumbnail(file) {
        if (file.type === 'video/mp4') {
            return this.generateVideoThumbnail(file);
        } else if (file.type === 'application/pdf') {
            return this.generatePDFThumbnail(file);
        } else {
            return this.generatePlaceholderThumbnail('DOCX');
        }
    }

    async generateVideoThumbnail(file) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                video.currentTime = 1;
            };
            
            video.onseeked = () => {
                if (ctx) {
                    ctx.drawImage(video, 0, 0);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                } else {
                    resolve(this.generatePlaceholderThumbnail('MP4'));
                }
            };
            
            video.onerror = () => resolve(this.generatePlaceholderThumbnail('MP4'));
            video.src = URL.createObjectURL(file);
        });
    }

    async generatePDFThumbnail(file) {
        try {
            if (typeof pdfjsLib !== 'undefined') {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const page = await pdf.getPage(1);
                
                const scale = 0.5;
                const viewport = page.getViewport({ scale });
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                if (context) {
                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise;
                    
                    return canvas.toDataURL('image/jpeg', 0.8);
                }
            }
        } catch (error) {
            console.error('Error generating PDF thumbnail:', error);
        }
        
        return this.generatePlaceholderThumbnail('PDF');
    }

    generatePlaceholderThumbnail(fileType) {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
            ctx.fillStyle = '#1a1d29';
            ctx.fillRect(0, 0, 300, 200);
            
            ctx.strokeStyle = '#00f3ff';
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, 300, 200);
            
            ctx.fillStyle = '#00f3ff';
            ctx.font = 'bold 24px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(fileType, 150, 100);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '48px Arial';
            ctx.fillText('📄', 150, 60);
        }
        
        return canvas.toDataURL('image/jpeg', 0.8);
    }

    async uploadToGitHub(fileName, content, message) {
        const path = `uploads/${fileName}`;
        const url = `https://api.github.com/repos/${this.githubConfig.username}/${this.githubConfig.repo}/contents/${path}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.githubConfig.token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify({
                message,
                content,
                branch: 'main'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to upload file: ${error.message}`);
        }

        return await response.json();
    }

    async updatePortfolioData(newItem) {
        // Load existing portfolio data
        const portfolioData = JSON.parse(localStorage.getItem('portfolioData') || '{"portfolio": [], "lastUpdated": ""}');
        
        // Add new item
        portfolioData.portfolio.push(newItem);
        portfolioData.lastUpdated = new Date().toISOString();
        
        // Save locally
        localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
        
        // Update GitHub
        const path = 'data/portfolio.json';
        const url = `https://api.github.com/repos/${this.githubConfig.username}/${this.githubConfig.repo}/contents/${path}`;
        
        // Get current file SHA
        let sha;
        try {
            const currentFile = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.githubConfig.token}`,
                    'Accept': 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });
            
            if (currentFile.ok) {
                const currentData = await currentFile.json();
                sha = currentData.sha;
            }
        } catch (error) {
            // File doesn't exist yet
        }

        const content = btoa(JSON.stringify(portfolioData, null, 2));
        
        const body = {
            message: 'Update portfolio data',
            content,
            branch: 'main'
        };
        
        if (sha) {
            body.sha = sha;
        }

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.githubConfig.token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to update portfolio data: ${error.message}`);
        }
    }

    loadPortfolioItems() {
        const portfolioItems = document.getElementById('portfolio-items');
        const portfolioData = JSON.parse(localStorage.getItem('portfolioData') || '{"portfolio": []}');
        
        if (portfolioData.portfolio.length === 0) {
            portfolioItems.innerHTML = '<p class="text-gray-400 text-center py-8">No portfolio items yet.</p>';
            return;
        }

        portfolioItems.innerHTML = portfolioData.portfolio.map(item => `
            <div class="flex items-center justify-between bg-card-bg rounded-lg p-4">
                <div class="flex items-center space-x-4">
                    ${item.thumbnail ? 
                        `<img src="${item.thumbnail}" alt="${item.title}" class="w-12 h-12 object-cover rounded">` :
                        '<div class="w-12 h-12 bg-gray-600 rounded flex items-center justify-center">📄</div>'
                    }
                    <div>
                        <div class="font-semibold text-white">${item.title}</div>
                        <div class="text-sm text-gray-400">${item.category}</div>
                        <div class="text-xs text-gray-500">
                            ${this.formatFileSize(item.fileSize)} • ${item.fileType.toUpperCase()}
                        </div>
                    </div>
                </div>
                <button onclick="adminManager.deleteItem('${item.id}')" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                    Delete
                </button>
            </div>
        `).join('');
    }

    async deleteItem(itemId) {
        if (!confirm('Are you sure you want to delete this item?')) return;

        const portfolioData = JSON.parse(localStorage.getItem('portfolioData') || '{"portfolio": []}');
        const item = portfolioData.portfolio.find(p => p.id === itemId);
        
        if (!item) {
            alert('Item not found');
            return;
        }

        try {
            // Delete file from GitHub
            await this.deleteFromGitHub(item.githubPath);
            
            // Update portfolio data
            portfolioData.portfolio = portfolioData.portfolio.filter(p => p.id !== itemId);
            portfolioData.lastUpdated = new Date().toISOString();
            
            localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
            await this.updatePortfolioData();
            
            alert('Item deleted successfully');
            this.loadPortfolioItems();
        } catch (error) {
            alert('Delete failed: ' + error.message);
        }
    }

    async deleteFromGitHub(githubPath) {
        const url = `https://api.github.com/repos/${this.githubConfig.username}/${this.githubConfig.repo}/contents/${githubPath}`;
        
        // Get the file's SHA first
        const fileResponse = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${this.githubConfig.token}`,
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        if (!fileResponse.ok) {
            throw new Error('File not found');
        }

        const fileData = await fileResponse.json();
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.githubConfig.token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify({
                message: `Delete ${githubPath}`,
                sha: fileData.sha,
                branch: 'main'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    logout() {
        this.isAuthenticated = false;
        localStorage.removeItem('adminAuthenticated');
        const adminBtn = document.getElementById('admin-btn');
        if (adminBtn) {
            adminBtn.textContent = 'Admin';
        }
        this.closeModal();
    }

    closeModal() {
        const adminModal = document.getElementById('admin-modal');
        adminModal.classList.add('hidden');
    }
}

// Initialize admin manager
let adminManager;
document.addEventListener('DOMContentLoaded', () => {
    adminManager = new AdminManager();
});