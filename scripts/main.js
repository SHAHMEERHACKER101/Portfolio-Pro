// Main JavaScript for Shahmeer Baqai Portfolio
// Handles 3D animations, cursor effects, reviews carousel, and portfolio interactions

class PortfolioApp {
    constructor() {
        this.currentReview = 0;
        this.reviews = [
            {
                name: "Sarah K.",
                rating: 5,
                quote: "Shahmeer tripled our conversion rate in 2 weeks!"
            },
            {
                name: "Mike Chen",
                rating: 5,
                quote: "Best copywriter I've ever worked with. Results speak for themselves."
            },
            {
                name: "Lisa Rodriguez",
                rating: 5,
                quote: "Our social media engagement increased by 400% with his strategies."
            },
            {
                name: "David Park",
                rating: 5,
                quote: "Professional, creative, and delivers on promises. Highly recommended!"
            },
            {
                name: "Emma Watson",
                rating: 5,
                quote: "Transformed our brand voice and doubled our leads in one month."
            }
        ];

        this.portfolioCategories = [
            {
                name: "High-Converting Ads",
                description: "Facebook, Google, and LinkedIn campaigns that drive results",
                image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250",
                count: 0
            },
            {
                name: "Viral Short Videos",
                description: "TikTok, Reels, and YouTube Shorts that captivate audiences",
                image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250",
                count: 0
            },
            {
                name: "Books & Podcasts",
                description: "Long-form content that establishes thought leadership",
                image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250",
                count: 0
            },
            {
                name: "Pinterest That Sells",
                description: "Strategic pins that drive traffic and conversions",
                image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250",
                count: 0
            },
            {
                name: "Web Tools & Extensions",
                description: "Custom tools that automate and optimize workflows",
                image: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250",
                count: 0
            },
            {
                name: "AI-Powered Visuals",
                description: "Cutting-edge AI graphics and interactive experiences",
                image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=250",
                count: 0
            }
        ];

        this.init();
    }

    init() {
        this.setupCustomCursor();
        this.setupSmoothScroll();
        this.setupPortfolioGrid();
        this.setupReviewsCarousel();
        this.setupContactForm();
        this.loadPortfolioData();
        
        // Disable context menu
        document.addEventListener('contextmenu', e => e.preventDefault());
    }

    setupCustomCursor() {
        const cursor = document.querySelector('.magnetic-cursor');
        if (!cursor) return;

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;

            // Create trail effect
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.style.left = `${e.clientX - 3}px`;
            trail.style.top = `${e.clientY - 3}px`;
            document.body.appendChild(trail);

            setTimeout(() => {
                trail.remove();
            }, 500);
        });

        // Handle hover effects
        const handleMouseEnter = (e) => {
            const target = e.target;
            if (target instanceof Element && target.matches('button, a, .portfolio-card, [data-cursor-hover]')) {
                cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            }
        };

        const handleMouseLeave = (e) => {
            const target = e.target;
            if (target instanceof Element && target.matches('button, a, .portfolio-card, [data-cursor-hover]')) {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            }
        };

        document.addEventListener('mouseenter', handleMouseEnter, true);
        document.addEventListener('mouseleave', handleMouseLeave, true);
    }

    setupSmoothScroll() {
        // Smooth scroll for navigation links
        document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Scroll indicator
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                const aboutSection = document.querySelector('#about');
                if (aboutSection) {
                    aboutSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }
    }

    setupPortfolioGrid() {
        const portfolioGrid = document.getElementById('portfolio-grid');
        if (!portfolioGrid) return;

        this.portfolioCategories.forEach((category, index) => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'portfolio-card bg-card-bg rounded-2xl p-8 glowing-border no-context-menu cursor-pointer';
            categoryCard.innerHTML = `
                <img 
                    src="${category.image}" 
                    alt="${category.name} portfolio examples"
                    class="w-full h-48 object-cover rounded-xl mb-6"
                />
                <h3 class="text-2xl font-bold mb-4">${category.name}</h3>
                <p class="text-gray-300 mb-6">${category.description}</p>
                <div class="flex justify-between items-center">
                    <span class="text-cyber-blue font-semibold">
                        ${category.count} Project${category.count !== 1 ? 's' : ''}
                    </span>
                    <button class="text-cyber-blue hover:text-white transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </button>
                </div>
            `;

            categoryCard.addEventListener('click', () => {
                this.openCategoryModal(category);
            });

            portfolioGrid.appendChild(categoryCard);
        });
    }

    setupReviewsCarousel() {
        const reviewContainer = document.getElementById('review-container');
        const reviewDots = document.getElementById('review-dots');
        
        if (!reviewContainer || !reviewDots) return;

        // Create dots
        this.reviews.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = `w-3 h-3 rounded-full transition-colors ${
                index === this.currentReview ? 'bg-cyber-blue' : 'bg-gray-600'
            }`;
            dot.addEventListener('click', () => {
                this.currentReview = index;
                this.updateReview();
            });
            reviewDots.appendChild(dot);
        });

        this.updateReview();

        // Auto-rotate reviews
        setInterval(() => {
            this.currentReview = (this.currentReview + 1) % this.reviews.length;
            this.updateReview();
        }, 3000);
    }

    updateReview() {
        const reviewContainer = document.getElementById('review-container');
        const reviewDots = document.getElementById('review-dots');
        
        if (!reviewContainer || !reviewDots) return;

        const review = this.reviews[this.currentReview];
        
        reviewContainer.innerHTML = `
            <div>
                <div class="flex justify-center mb-4">
                    ${Array(review.rating).fill(0).map(() => 
                        '<svg class="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
                    ).join('')}
                </div>
                <p class="text-xl mb-4 max-w-2xl">"${review.quote}"</p>
                <p class="text-cyber-blue font-semibold">— ${review.name}</p>
            </div>
        `;

        // Update dots
        Array.from(reviewDots.children).forEach((dot, index) => {
            dot.className = `w-3 h-3 rounded-full transition-colors ${
                index === this.currentReview ? 'bg-cyber-blue' : 'bg-gray-600'
            }`;
        });
    }

    setupContactForm() {
        const contactBtn = document.getElementById('contact-btn');
        const contactModal = document.getElementById('contact-modal');
        const closeContact = document.getElementById('close-contact');
        const contactForm = document.getElementById('contact-form');

        if (contactBtn) {
            contactBtn.addEventListener('click', () => {
                contactModal.classList.remove('hidden');
            });
        }

        if (closeContact) {
            closeContact.addEventListener('click', () => {
                contactModal.classList.add('hidden');
            });
        }

        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const name = document.getElementById('contact-name').value;
                const email = document.getElementById('contact-email').value;
                const message = document.getElementById('contact-message').value;

                // Save message to localStorage
                const messages = JSON.parse(localStorage.getItem('messages') || '[]');
                const newMessage = {
                    id: `msg_${Date.now()}`,
                    name,
                    email,
                    message,
                    timestamp: new Date().toISOString(),
                    read: false
                };
                
                messages.unshift(newMessage);
                localStorage.setItem('messages', JSON.stringify(messages));

                // Show success message
                alert('Message sent successfully! Thank you for your message.');
                
                // Reset form and close modal
                contactForm.reset();
                contactModal.classList.add('hidden');
            });
        }

        // Close modal when clicking outside
        if (contactModal) {
            contactModal.addEventListener('click', (e) => {
                if (e.target === contactModal) {
                    contactModal.classList.add('hidden');
                }
            });
        }
    }

    openCategoryModal(category) {
        // This would open a portfolio modal with items from this category
        console.log('Opening category:', category.name);
        alert(`Coming soon: ${category.name} portfolio items will be displayed here.`);
    }

    loadPortfolioData() {
        // Try to load portfolio data from GitHub API or localStorage
        const portfolioData = localStorage.getItem('portfolioData');
        if (portfolioData) {
            try {
                const data = JSON.parse(portfolioData);
                this.updatePortfolioCounts(data.portfolio || []);
            } catch (e) {
                console.log('No portfolio data found');
            }
        }
    }

    updatePortfolioCounts(portfolioItems) {
        // Update portfolio category counts
        this.portfolioCategories.forEach(category => {
            category.count = portfolioItems.filter(item => item.category === category.name).length;
        });

        // Re-render portfolio grid with updated counts
        this.setupPortfolioGrid();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
});