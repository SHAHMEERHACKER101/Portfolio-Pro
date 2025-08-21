// Global variables
let scene, camera, renderer, particles, neuralNetwork;
let portfolioData = [];
let reviewsData = [];
let skillsData = [];

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing portfolio...');
    
    // Initialize core features
    initNeuralNetwork();
    initCustomCursor();
    initSkillsCarousel();
    initReviewsCarousel();
    initScrollEffects();
    initEventListeners();
    
    // Load data
    loadPortfolioData();
    loadReviewsData();
    
    console.log('Portfolio initialization complete');
});

// Neural Network 3D Background
function initNeuralNetwork() {
    const canvas = document.getElementById('neural-network');
    if (!canvas) {
        console.error('Neural network canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Neural network particles
    const particles = [];
    const particleCount = 50;
    const connectionDistance = 150;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 3 + 1
        });
    }
    
    // Animation loop
    function animateNeuralNetwork() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        particles.forEach((particle, i) => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = '#00f3ff';
            ctx.fill();
            
            // Draw connections
            particles.slice(i + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < connectionDistance) {
                    const opacity = 1 - distance / connectionDistance;
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(otherParticle.x, otherParticle.y);
                    ctx.strokeStyle = `rgba(0, 243, 255, ${opacity * 0.5})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(animateNeuralNetwork);
    }
    
    animateNeuralNetwork();
}

// Custom Cursor
function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
    
    // Add hover effects
    document.addEventListener('mouseenter', (e) => {
        if (e.target.matches('button, a, .portfolio-item')) {
            cursor.classList.add('hover');
        }
    }, true);
    
    document.addEventListener('mouseleave', (e) => {
        if (e.target.matches('button, a, .portfolio-item')) {
            cursor.classList.remove('hover');
        }
    }, true);
}

// Skills Carousel
function initSkillsCarousel() {
    skillsData = [
        { icon: '🎯', title: 'High-Converting Ads', description: 'Facebook & Google campaigns that convert' },
        { icon: '🎬', title: 'Viral Video Content', description: 'Short-form videos that capture attention' },
        { icon: '📧', title: 'Email Marketing', description: 'Sequences that nurture and convert' },
        { icon: '📌', title: 'Pinterest Strategy', description: 'Visual content that drives traffic' },
        { icon: '🤖', title: 'AI-Powered Visuals', description: 'Cutting-edge AI content creation' },
        { icon: '🛠️', title: 'Web Tools', description: 'Custom tools and extensions' },
        { icon: '📚', title: 'Content Strategy', description: 'Books, podcasts, and thought leadership' },
        { icon: '📊', title: 'Analytics & Optimization', description: 'Data-driven performance improvement' }
    ];
    
    const carousel = document.getElementById('skills-carousel');
    if (!carousel) return;
    
    // Duplicate skills for seamless scrolling
    const allSkills = [...skillsData, ...skillsData];
    
    carousel.innerHTML = allSkills.map(skill => `
        <div class="skill-card">
            <div class="skill-icon">${skill.icon}</div>
            <h3>${skill.title}</h3>
            <p>${skill.description}</p>
        </div>
    `).join('');
}

// Reviews Carousel
function initReviewsCarousel() {
    reviewsData = [
        {
            name: 'Alex Rodriguez',
            company: 'TechStart Inc.',
            rating: 5,
            quote: 'Shahmeer transformed our ad campaigns. We saw a 300% increase in conversions within the first month.',
            avatar: '👨‍💼'
        },
        {
            name: 'Sarah Chen',
            company: 'E-commerce Plus',
            rating: 5,
            quote: 'The viral video strategy he created generated over 2M views and brought us 10,000+ new customers.',
            avatar: '👩‍💻'
        },
        {
            name: 'Marcus Johnson',
            company: 'Digital Growth Co.',
            rating: 5,
            quote: 'His Pinterest strategy alone doubled our website traffic. ROI was incredible.',
            avatar: '🧑‍🚀'
        },
        {
            name: 'Emily Watson',
            company: 'SaaS Solutions',
            rating: 5,
            quote: 'The AI-powered content tools he developed saved us 20 hours per week while improving quality.',
            avatar: '👩‍🎨'
        }
    ];
    
    const carousel = document.getElementById('reviews-carousel');
    if (!carousel) return;
    
    // Duplicate reviews for seamless scrolling
    const allReviews = [...reviewsData, ...reviewsData];
    
    carousel.innerHTML = allReviews.map(review => `
        <div class="review-card">
            <div class="review-stars">${'⭐'.repeat(review.rating)}</div>
            <p class="review-quote">"${review.quote}"</p>
            <div class="review-author">
                <span>${review.avatar}</span>
                <strong>${review.name}</strong><br>
                <small>${review.company}</small>
            </div>
        </div>
    `).join('');
}

// Scroll Effects
function initScrollEffects() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(15, 17, 26, 0.95)';
        } else {
            navbar.style.background = 'rgba(15, 17, 26, 0.9)';
        }
    });
}

// Event Listeners
function initEventListeners() {
    // Portfolio filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter portfolio
            const category = btn.dataset.category;
            filterPortfolio(category);
        });
    });
    
    // Contact buttons
    const contactBtns = document.querySelectorAll('#contact-btn, #floating-contact-btn, .btn-secondary');
    contactBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showContactModal();
        });
    });
    
    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Portfolio item clicks
    document.addEventListener('click', (e) => {
        if (e.target.closest('.portfolio-item')) {
            const item = e.target.closest('.portfolio-item');
            const itemId = item.dataset.id;
            if (itemId) {
                previewFile(itemId);
            }
        }
    });
    
    // Modal close on background click
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
    
    console.log('Event listeners initialized');
}

// Load Portfolio Data
function loadPortfolioData() {
    // Try to load from GitHub first, then fallback to localStorage
    fetch('data/portfolio.json')
        .then(response => response.json())
        .then(data => {
            portfolioData = data.portfolio || [];
            renderPortfolioGrid();
        })
        .catch(() => {
            // Fallback to localStorage
            const stored = localStorage.getItem('portfolio_v2');
            portfolioData = stored ? JSON.parse(stored) : [];
            renderPortfolioGrid();
        });
}

// Load Reviews Data (static for now)
function loadReviewsData() {
    // Reviews are static and already loaded in initReviewsCarousel
    console.log('Reviews data loaded');
}

// Render Portfolio Grid
function renderPortfolioGrid() {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;
    
    if (portfolioData.length === 0) {
        grid.innerHTML = `
            <div class="portfolio-item" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;">📁</div>
                <h3 style="color: #9ca3af; margin-bottom: 1rem;">No Portfolio Items Yet</h3>
                <p style="color: #6b7280;">Upload your first project through the admin panel to get started.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = portfolioData.map(item => `
        <div class="portfolio-item" data-id="${item.id}" data-category="${item.category}">
            <img src="${getFileUrl(item.thumbnail)}" alt="${item.title}" 
                 onerror="this.src='data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="300" height="200" fill="#374151"/><text x="150" y="100" text-anchor="middle" fill="#9ca3af" font-size="16">Preview</text></svg>')}'">
            <div class="portfolio-item-content">
                <h3>${item.title}</h3>
                <p>${getCategoryName(item.category)}</p>
                <small style="color: #6b7280;">${new Date(item.uploadDate).toLocaleDateString()}</small>
            </div>
        </div>
    `).join('');
}

// Filter Portfolio
function filterPortfolio(category) {
    const items = document.querySelectorAll('.portfolio-item');
    
    items.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Get File URL
function getFileUrl(filePath) {
    if (!filePath) return '';
    
    // If it's already a full URL, return as-is
    if (filePath.startsWith('http')) {
        return filePath;
    }
    
    // If it's a GitHub path, construct the raw URL
    if (window.githubUsername && window.githubRepo) {
        return `https://raw.githubusercontent.com/${window.githubUsername}/${window.githubRepo}/main/${filePath}`;
    }
    
    // Fallback to relative path
    return filePath;
}

// Get Category Name
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

// Contact Modal Functions
function showContactModal() {
    const modal = document.getElementById('contact-modal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('contact-name').focus();
    }
}

function hideContactModal() {
    const modal = document.getElementById('contact-modal');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('contact-form').reset();
    }
}

// Handle Contact Form Submit
function handleContactSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: Date.now().toString(),
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        message: document.getElementById('contact-message').value,
        date: new Date().toISOString(),
        read: false
    };
    
    // Save to localStorage
    const messages = JSON.parse(localStorage.getItem('messages_v2') || '[]');
    messages.unshift(formData);
    localStorage.setItem('messages_v2', JSON.stringify(messages));
    
    // Show success message
    showToast('Message sent successfully! I\'ll get back to you soon.');
    
    // Close modal
    hideContactModal();
}

// Preview File Function
function previewFile(itemId) {
    const item = portfolioData.find(p => p.id === itemId);
    if (!item) return;
    
    // This will be handled by preview.js
    if (typeof window.showPreviewModal === 'function') {
        window.showPreviewModal(item);
    }
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const messageEl = document.getElementById('toast-message');
    
    if (toast && messageEl) {
        messageEl.textContent = message;
        toast.classList.add('active');
        
        // Auto-hide after 4 seconds
        setTimeout(() => {
            hideToast();
        }, 4000);
    }
}

function hideToast() {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.classList.remove('active');
    }
}

// Make functions globally available
window.showContactModal = showContactModal;
window.hideContactModal = hideContactModal;
window.previewFile = previewFile;
window.showToast = showToast;
window.hideToast = hideToast;

console.log('Main.js loaded successfully');