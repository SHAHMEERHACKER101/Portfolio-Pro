// Main Application Logic
class ShahmeerPortfolio {
    constructor() {
        this.portfolioData = [];
        this.isLoading = false;
        this.cursor = null;
        this.trails = [];
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        this.init();
    }
    
    async init() {
        // Initialize all components
        this.initCursor();
        this.init3DBackground();
        this.initPortfolioCards();
        this.initAnimations();
        this.initEventListeners();
        
        // Load portfolio data
        await this.loadPortfolio();
    }
    
    // Custom Cursor System
    initCursor() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        this.cursor = document.querySelector('.custom-cursor');
        
        // Create cursor trails
        for (let i = 0; i < 10; i++) {
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            document.body.appendChild(trail);
            this.trails.push(trail);
        }
        
        let mouseX = 0, mouseY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            if (this.cursor) {
                this.cursor.style.left = mouseX - 10 + 'px';
                this.cursor.style.top = mouseY - 10 + 'px';
            }
            
            // Update trails with delay
            this.trails.forEach((trail, index) => {
                setTimeout(() => {
                    trail.style.left = mouseX - 2 + 'px';
                    trail.style.top = mouseY - 2 + 'px';
                    trail.style.opacity = (10 - index) / 15;
                }, index * 20);
            });
        });
        
        // Scale cursor on hover
        document.addEventListener('mouseenter', (e) => {
            if (e.target.matches('button, a, .portfolio-card')) {
                if (this.cursor) {
                    this.cursor.style.transform = 'scale(1.5)';
                }
            }
        }, true);
        
        document.addEventListener('mouseleave', (e) => {
            if (e.target.matches('button, a, .portfolio-card')) {
                if (this.cursor) {
                    this.cursor.style.transform = 'scale(1)';
                }
            }
        }, true);
    }
    
    // Three.js 3D Background
    init3DBackground() {
        if (typeof THREE === 'undefined') {
            console.warn('Three.js not loaded');
            return;
        }
        
        const canvas = document.getElementById('three-canvas');
        if (!canvas) return;
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            alpha: true 
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        
        // Create neural network particles
        const geometry = new THREE.BufferGeometry();
        const particles = 500;
        const positions = new Float32Array(particles * 3);
        
        for (let i = 0; i < particles * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 20;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0x00f3ff,
            size: 0.05,
            transparent: true,
            opacity: 0.6
        });
        
        const points = new THREE.Points(geometry, material);
        this.scene.add(points);
        
        // Add connecting lines
        const lineGeometry = new THREE.BufferGeometry();
        const linePositions = [];
        
        for (let i = 0; i < particles; i += 10) {
            const x1 = positions[i * 3];
            const y1 = positions[i * 3 + 1];
            const z1 = positions[i * 3 + 2];
            
            const x2 = positions[(i + 1) * 3] || x1;
            const y2 = positions[(i + 1) * 3 + 1] || y1;
            const z2 = positions[(i + 1) * 3 + 2] || z1;
            
            linePositions.push(x1, y1, z1, x2, y2, z2);
        }
        
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00f3ff,
            transparent: true,
            opacity: 0.1
        });
        
        const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        this.scene.add(lines);
        
        this.camera.position.z = 5;
        
        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            
            points.rotation.x += 0.001;
            points.rotation.y += 0.002;
            lines.rotation.x += 0.001;
            lines.rotation.y += 0.002;
            
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
        
        // Handle resize
        window.addEventListener('resize', () => {
            if (this.camera && this.renderer) {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }
        });
    }
    
    // Portfolio Card 3D Tilt Effects
    initPortfolioCards() {
        const updateCardTilts = () => {
            const cards = document.querySelectorAll('.portfolio-card');
            
            cards.forEach(card => {
                // Remove existing listeners
                card.removeEventListener('mousemove', card._tiltHandler);
                card.removeEventListener('mouseleave', card._resetHandler);
                
                // Add new listeners
                card._tiltHandler = (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const rotateX = (y - centerY) / 10;
                    const rotateY = (centerX - x) / 10;
                    
                    card.style.transform = `translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                };
                
                card._resetHandler = () => {
                    card.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
                };
                
                card.addEventListener('mousemove', card._tiltHandler);
                card.addEventListener('mouseleave', card._resetHandler);
            });
        };
        
        // Initial setup
        updateCardTilts();
        
        // Update when portfolio changes
        this.updateCardTilts = updateCardTilts;
    }
    
    // GSAP Animations
    initAnimations() {
        if (typeof gsap === 'undefined') {
            console.warn('GSAP not loaded');
            return;
        }
        
        gsap.registerPlugin(ScrollTrigger);
        
        // Logo animation
        gsap.from('[data-3d-logo]', {
            duration: 2,
            scale: 0,
            rotation: 360,
            ease: 'back.out(1.7)'
        });
        
        // Portfolio cards animation
        gsap.from('.portfolio-card', {
            duration: 1,
            y: 100,
            opacity: 0,
            stagger: 0.2,
            scrollTrigger: {
                trigger: '#portfolio-grid',
                start: 'top 80%'
            }
        });
    }
    
    // Event Listeners
    initEventListeners() {
        // Contact modal
        const contactBtn = document.getElementById('contact-btn');
        const contactModal = document.getElementById('contact-modal');
        const closeContact = document.getElementById('close-contact');
        const contactForm = document.getElementById('contact-form');
        
        if (contactBtn) {
            contactBtn.addEventListener('click', () => this.toggleModal('contact-modal'));
        }
        
        if (closeContact) {
            closeContact.addEventListener('click', () => this.hideModal('contact-modal'));
        }
        
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }
        
        // Click outside to close modals
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target.id);
            }
        });
        
        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }
    
    // Portfolio Data Management
    async loadPortfolio() {
        this.showLoading();
        
        try {
            const response = await fetch('/data/portfolio.json');
            if (response.ok) {
                const data = await response.json();
                this.portfolioData = data.portfolio || [];
            } else {
                this.portfolioData = [];
            }
        } catch (error) {
            console.error('Error loading portfolio:', error);
            this.portfolioData = [];
        }
        
        this.hideLoading();
        this.renderPortfolio();
    }
    
    renderPortfolio() {
        const grid = document.getElementById('portfolio-grid');
        const noProjects = document.getElementById('no-projects');
        
        if (!grid) return;
        
        if (this.portfolioData.length === 0) {
            grid.innerHTML = '';
            if (noProjects) {
                noProjects.classList.remove('hidden');
            }
            return;
        }
        
        if (noProjects) {
            noProjects.classList.add('hidden');
        }
        
        grid.innerHTML = this.portfolioData.map(item => this.createPortfolioCard(item)).join('');
        
        // Re-initialize card effects
        if (this.updateCardTilts) {
            this.updateCardTilts();
        }
        
        // Re-animate cards if GSAP is available
        if (typeof gsap !== 'undefined') {
            gsap.from('.portfolio-card', {
                duration: 0.6,
                y: 50,
                opacity: 0,
                stagger: 0.1
            });
        }
    }
    
    createPortfolioCard(item) {
        const fileExt = this.getFileExtension(item.fileName);
        const iconClass = this.getFileIconClass(fileExt);
        
        return `
            <div class="portfolio-card" data-testid="card-portfolio-${item.id}">
                <div class="card-header">
                    <div class="file-icon ${iconClass}">${fileExt.toUpperCase()}</div>
                    <div class="card-info">
                        <h3 data-testid="text-card-title-${item.id}">${this.escapeHtml(item.title)}</h3>
                        <p data-testid="text-card-category-${item.id}">${this.escapeHtml(item.category)}</p>
                    </div>
                </div>
                ${item.description ? `<p class="card-description" data-testid="text-card-description-${item.id}">${this.escapeHtml(item.description)}</p>` : ''}
                <button class="download-button" data-testid="button-download-${item.id}" onclick="downloadHandler.downloadFile('${item.filePath}', '${item.fileName}')">
                    Download
                </button>
            </div>
        `;
    }
    
    getFileExtension(fileName) {
        return fileName.split('.').pop().toLowerCase();
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
    
    // Loading States
    showLoading() {
        this.isLoading = true;
        const loadingState = document.getElementById('loading-state');
        const portfolioGrid = document.getElementById('portfolio-grid');
        const noProjects = document.getElementById('no-projects');
        
        if (loadingState) {
            loadingState.classList.remove('hidden');
        }
        if (portfolioGrid) {
            portfolioGrid.innerHTML = '';
        }
        if (noProjects) {
            noProjects.classList.add('hidden');
        }
    }
    
    hideLoading() {
        this.isLoading = false;
        const loadingState = document.getElementById('loading-state');
        if (loadingState) {
            loadingState.classList.add('hidden');
        }
    }
    
    // Modal Management
    toggleModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.toggle('hidden');
        }
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    }
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    hideAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.classList.add('hidden'));
    }
    
    // Contact Form
    async handleContactSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name') || document.getElementById('contact-name').value,
            email: formData.get('email') || document.getElementById('contact-email').value,
            message: formData.get('message') || document.getElementById('contact-message').value
        };
        
        // Validate data
        if (!data.name || !data.email || !data.message) {
            this.showMessage('Please fill in all fields.', 'error');
            return;
        }
        
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.showMessage('Please enter a valid email address.', 'error');
            return;
        }
        
        try {
            // In a real implementation, this would send to a contact API
            // For now, we'll simulate success
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showMessage('Message sent successfully! We\'ll get back to you soon.', 'success');
            this.hideModal('contact-modal');
            e.target.reset();
        } catch (error) {
            console.error('Contact form error:', error);
            this.showMessage('Failed to send message. Please try again.', 'error');
        }
    }
    
    // Message System
    showMessage(text, type = 'info') {
        const container = document.getElementById('message-container');
        if (!container) return;
        
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.innerHTML = `<p class="message-text">${this.escapeHtml(text)}</p>`;
        
        container.appendChild(message);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 5000);
    }
    
    // Refresh portfolio (called after uploads/deletes)
    async refreshPortfolio() {
        await this.loadPortfolio();
    }
}

// Global functions for HTML onclick handlers
function toggleAdminPanel() {
    if (window.adminManager) {
        window.adminManager.toggleAdminPanel();
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main portfolio
    window.portfolioApp = new ShahmeerPortfolio();
    
    console.log('Shahmeer Baqai Portfolio initialized');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is hidden
        if (window.portfolioApp && window.portfolioApp.renderer) {
            window.portfolioApp.renderer.setAnimationLoop(null);
        }
    } else {
        // Resume animations when page is visible
        if (window.portfolioApp && window.portfolioApp.renderer) {
            const animate = () => {
                window.portfolioApp.renderer.setAnimationLoop(animate);
            };
            animate();
        }
    }
});
