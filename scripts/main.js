// Main Application Logic
class ShahmeerPortfolio {
    constructor() {
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
        this.initSkillCards();
        this.initAnimations();
        this.initEventListeners();
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
        document.addEventListener('mouseover', (e) => {
            if (e.target && (e.target.matches('button') || e.target.matches('a') || e.target.classList.contains('skill-expertise-card'))) {
                if (this.cursor) {
                    this.cursor.style.transform = 'scale(1.5)';
                }
            }
        }, true);
        
        document.addEventListener('mouseout', (e) => {
            if (e.target && (e.target.matches('button') || e.target.matches('a') || e.target.classList.contains('skill-expertise-card'))) {
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
    
    // Skill Card 3D Tilt Effects
    initSkillCards() {
        const cards = document.querySelectorAll('.skill-expertise-card');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 15;
                const rotateY = (centerX - x) / 15;
                
                card.style.transform = `translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
            });
        });
    }
    
    // GSAP Animations
    initAnimations() {
        if (typeof gsap === 'undefined') {
            console.warn('GSAP not loaded');
            return;
        }
        
        gsap.registerPlugin(ScrollTrigger);
        
        // Logo animation
        gsap.fromTo('[data-3d-logo]', 
            { rotationY: -180, opacity: 0 },
            { 
                rotationY: 0, 
                opacity: 1, 
                duration: 2, 
                ease: 'power2.out',
                delay: 0.5
            }
        );
        
        // Hero text animations
        gsap.fromTo('.hero-name', 
            { y: 50, opacity: 0 },
            { 
                y: 0, 
                opacity: 1, 
                duration: 1, 
                ease: 'power2.out',
                delay: 1
            }
        );
        
        gsap.fromTo('.hero-tagline', 
            { y: 30, opacity: 0 },
            { 
                y: 0, 
                opacity: 1, 
                duration: 1, 
                ease: 'power2.out',
                delay: 1.2
            }
        );
        
        // Skills cards animation
        gsap.fromTo('.skill-card', 
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.skills-section',
                    start: 'top 80%'
                }
            }
        );
        
        // Professional skills cards animation
        gsap.fromTo('.skill-expertise-card', 
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.professional-skills-section',
                    start: 'top 80%'
                }
            }
        );
        
        // View Portfolio Button Animation
        gsap.fromTo('.view-portfolio-button', 
            { y: 30, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.portfolio-cta-section',
                    start: 'top 80%'
                }
            }
        );
        
        // Reviews animation
        gsap.fromTo('.review-card', 
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.reviews-section',
                    start: 'top 80%'
                }
            }
        );
        
        // About section animation
        gsap.fromTo('.about-quote', 
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.about-section',
                    start: 'top 80%'
                }
            }
        );
        
        // Scroll indicator animation
        gsap.to('.scroll-dot', {
            y: 10,
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: 'power2.inOut'
        });
    }
    
    // Event Listeners
    initEventListeners() {
        // Contact modal
        const contactBtn = document.getElementById('contact-btn');
        const contactModal = document.getElementById('contact-modal');
        const closeContact = document.getElementById('close-contact');
        const contactForm = document.getElementById('contact-form');
        
        if (contactBtn && contactModal) {
            contactBtn.addEventListener('click', () => {
                contactModal.classList.remove('hidden');
            });
        }
        
        if (closeContact && contactModal) {
            closeContact.addEventListener('click', () => {
                contactModal.classList.add('hidden');
            });
        }
        
        // View Portfolio Button
        const viewPortfolioBtn = document.getElementById('view-portfolio-btn');
        if (viewPortfolioBtn) {
            viewPortfolioBtn.addEventListener('click', () => {
                window.open('https://portfolio-files.pages.dev/', '_blank');
            });
        }
        
        // Contact form submission
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Get form data
                const name = document.getElementById('contact-name').value;
                const email = document.getElementById('contact-email').value;
                const message = document.getElementById('contact-message').value;
                
                // Create mailto link
                const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
                const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
                const mailtoLink = `mailto:shahmeerbaqai@gmail.com?subject=${subject}&body=${body}`;
                
                // Open email client
                window.location.href = mailtoLink;
                
                // Close modal
                contactModal.classList.add('hidden');
                
                // Reset form
                contactForm.reset();
            });
        }
        
        // Close modals on background click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.add('hidden');
            }
        });
        
        // Smooth scrolling for navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('[href^="#"]')) {
                e.preventDefault();
                const target = document.querySelector(e.target.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }
}

// Initialize the application
window.addEventListener('DOMContentLoaded', () => {
    window.portfolioApp = new ShahmeerPortfolio();
    console.log('Shahmeer Baqai Portfolio initialized');
});