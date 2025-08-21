// Portfolio data loaded from GitHub
let portfolioData = [];
let reviewsData = [
    {
        id: "1",
        name: "Alex R., CEO",
        rating: 5,
        quote: "Shahmeer's ads generated $200K in 14 days. Unreal ROI.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
    },
    {
        id: "2", 
        name: "Sarah M., Startup Founder",
        rating: 5,
        quote: "His content strategy transformed our social media presence completely.",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c265?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
    },
    {
        id: "3",
        name: "Marcus T., Author", 
        rating: 5,
        quote: "The ghostwriting was so authentic, I forgot I didn't write it myself.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
    },
    {
        id: "4",
        name: "Lisa K., E-commerce Owner",
        rating: 5, 
        quote: "Pinterest campaigns drove 300% more traffic than expected.",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
    },
    {
        id: "5",
        name: "David P., Tech Entrepreneur",
        rating: 5,
        quote: "The Chrome extension automated our entire workflow. Brilliant!",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
    }
];

// Skills data
const skillsData = [
    {
        icon: "🚀",
        title: "High-Converting Ads",
        description: "Facebook, Instagram, TikTok — copy that sells in 3 seconds",
        color: "text-cyber-blue"
    },
    {
        icon: "🎥", 
        title: "Viral Short Videos",
        description: "AI-powered visuals + music that stop the scroll",
        color: "text-electric-purple"
    },
    {
        icon: "📚",
        title: "Ghostwriting",
        description: "Books, Podcasts — True crime, fiction, nonfiction — in your voice",
        color: "text-cyber-blue"
    },
    {
        icon: "📧",
        title: "Email That Converts", 
        description: "Newsletters that get opens, clicks, and sales",
        color: "text-electric-purple"
    },
    {
        icon: "📌",
        title: "Pinterest That Sells",
        description: "High-CTR pins that drive traffic and affiliate revenue", 
        color: "text-cyber-blue"
    },
    {
        icon: "🛠️",
        title: "Web Apps & Extensions",
        description: "Custom tools that automate and scale",
        color: "text-electric-purple"
    },
    {
        icon: "🎨",
        title: "AI Content Strategy", 
        description: "From prompt engineering to full content systems",
        color: "text-cyber-blue"
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initNeuralNetwork();
    initCustomCursor();
    initSkillsCarousel();
    initReviewsCarousel();
    loadPortfolioFromGitHub().then(() => {
        initPortfolioGrid();
    });
    initContactForm();
    initScrollEffects();
});

// Load portfolio data from GitHub
async function loadPortfolioFromGitHub() {
    try {
        // Try to load from the current repository's data folder
        const response = await fetch('/data/portfolio.json');
        
        if (response.ok) {
            const data = await response.json();
            portfolioData = data.portfolio || [];
        } else {
            // Fallback: Load from GitHub raw URL if deployed
            const fallbackResponse = await fetch('https://raw.githubusercontent.com/shahmeer606/ShahmeerBaqai-Portfolio-Pro/main/data/portfolio.json');
            if (fallbackResponse.ok) {
                const data = await fallbackResponse.json();
                portfolioData = data.portfolio || [];
            }
        }
    } catch (error) {
        console.error('Failed to load portfolio data:', error);
        portfolioData = [];
    }
}

// Neural Network Background
function initNeuralNetwork() {
    const canvas = document.getElementById('neural-network');
    const ctx = canvas.getContext('2d');
    let nodes = [];
    let animationId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createNodes() {
        nodes = [];
        const nodeCount = 50;
        
        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1
            });
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update nodes
        nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;
            
            if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        });
        
        // Draw connections
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.1)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const nodeA = nodes[i];
                const nodeB = nodes[j];
                const dx = nodeA.x - nodeB.x;
                const dy = nodeA.y - nodeB.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    const opacity = 1 - (distance / 150);
                    ctx.strokeStyle = `rgba(0, 243, 255, ${opacity * 0.1})`;
                    ctx.beginPath();
                    ctx.moveTo(nodeA.x, nodeA.y);
                    ctx.lineTo(nodeB.x, nodeB.y);
                    ctx.stroke();
                }
            }
        }
        
        // Draw nodes
        ctx.fillStyle = 'rgba(0, 243, 255, 0.6)';
        nodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        animationId = requestAnimationFrame(animate);
    }

    resizeCanvas();
    createNodes();
    animate();

    window.addEventListener('resize', () => {
        resizeCanvas();
        createNodes();
    });
}

// Custom Cursor
function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    function updateCursor() {
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;
        
        cursorX += dx * 0.1;
        cursorY += dy * 0.1;
        
        cursor.style.left = cursorX - 10 + 'px';
        cursor.style.top = cursorY - 10 + 'px';
        
        requestAnimationFrame(updateCursor);
    }

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    updateCursor();

    // Add magnetic effect to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, .skill-card, .portfolio-item');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('cursor-magnetic'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-magnetic'));
    });
}

// Skills Carousel
function initSkillsCarousel() {
    const carousel = document.getElementById('skills-carousel');
    let isPaused = false;
    let rotation = 0;

    // Create skill cards
    skillsData.forEach((skill, index) => {
        const skillCard = document.createElement('div');
        skillCard.className = 'skill-card absolute w-64 h-32';
        skillCard.innerHTML = `
            <div class="glass-effect rounded-xl p-6 h-full hover:transform hover:scale-105 transition-all duration-300">
                <div class="text-3xl mb-2">${skill.icon}</div>
                <h3 class="font-orbitron font-bold ${skill.color} mb-1">${skill.title}</h3>
                <p class="text-sm text-gray-400 leading-tight">${skill.description}</p>
            </div>
        `;
        carousel.appendChild(skillCard);
    });

    const cards = carousel.querySelectorAll('.skill-card');
    const centerX = 200;
    const centerY = 200;
    const radius = 180;

    function updatePositions() {
        cards.forEach((card, index) => {
            const angle = (index / skillsData.length) * 2 * Math.PI + rotation;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            card.style.transform = `translate(${x - 128}px, ${y - 64}px)`;
        });
    }

    function animate() {
        if (!isPaused) {
            rotation += 0.003;
            updatePositions();
        }
        requestAnimationFrame(animate);
    }

    carousel.addEventListener('mouseenter', () => isPaused = true);
    carousel.addEventListener('mouseleave', () => isPaused = false);

    updatePositions();
    animate();
}

// Reviews Carousel
function initReviewsCarousel() {
    const track = document.getElementById('reviews-track');
    const indicators = document.getElementById('review-indicators');
    let currentIndex = 0;
    let isPaused = false;

    // Create review cards
    reviewsData.forEach((review, index) => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'min-w-80 mx-4';
        reviewCard.innerHTML = `
            <div class="glass-effect rounded-xl p-6 h-full review-card">
                <img src="${review.avatar}" alt="${review.name}" class="w-12 h-12 rounded-full mb-4 object-cover">
                <div class="flex mb-4">
                    ${'★'.repeat(review.rating).split('').map(() => '<span class="text-cyber-blue text-xl">★</span>').join('')}
                </div>
                <p class="text-white mb-4 font-medium italic">"${review.quote}"</p>
                <p class="text-gray-400 text-sm font-semibold">— ${review.name}</p>
            </div>
        `;
        track.appendChild(reviewCard);

        // Create indicator
        const indicator = document.createElement('button');
        indicator.className = `w-3 h-3 rounded-full transition-all ${index === 0 ? 'bg-cyber-blue' : 'bg-gray-600'}`;
        indicator.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
        });
        indicators.appendChild(indicator);
    });

    function updateCarousel() {
        const translateX = -(currentIndex * 320); // 320px = card width + margin
        track.style.transform = `translateX(${translateX}px)`;
        
        // Update indicators
        indicators.querySelectorAll('button').forEach((btn, index) => {
            btn.className = `w-3 h-3 rounded-full transition-all ${
                index === currentIndex ? 'bg-cyber-blue' : 'bg-gray-600'
            }`;
        });
    }

    function autoAdvance() {
        if (!isPaused) {
            currentIndex = (currentIndex + 1) % reviewsData.length;
            updateCarousel();
        }
    }

    track.addEventListener('mouseenter', () => isPaused = true);
    track.addEventListener('mouseleave', () => isPaused = false);

    setInterval(autoAdvance, 1500);
}

// Portfolio Grid
function initPortfolioGrid() {
    loadPortfolioGrid();
}

function loadPortfolioGrid() {
    const grid = document.getElementById('portfolio-grid');
    
    if (portfolioData.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-16">
                <div class="text-6xl text-gray-600 mb-4">📁</div>
                <h3 class="text-xl font-semibold text-gray-400 mb-2">No Portfolio Items</h3>
                <p class="text-gray-500">Upload your first project via the admin panel to get started.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = '';
    portfolioData.forEach(item => {
        const portfolioItem = document.createElement('div');
        portfolioItem.className = 'portfolio-item';
        portfolioItem.setAttribute('data-category', item.category);
        portfolioItem.innerHTML = `
            <div class="glass-effect rounded-xl p-6 overflow-hidden cursor-pointer hover:transform hover:scale-105 transition-all duration-300">
                <img src="${item.thumbnail}" alt="${item.title}" class="w-full h-48 object-cover rounded mb-4">
                <div>
                    <h3 class="font-orbitron font-bold text-cyber-blue mb-2">${item.title}</h3>
                    <p class="text-gray-400 text-sm mb-4">${new Date(item.uploadDate).toLocaleDateString()}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-xs bg-cyber-blue text-dark-bg px-3 py-1 rounded-full">
                            ${item.category.toUpperCase()}
                        </span>
                        <button onclick="previewFile('${item.id}')" class="text-cyber-blue hover:text-white transition-colors">
                            Preview →
                        </button>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(portfolioItem);
    });
}

function filterPortfolio(category) {
    const items = document.querySelectorAll('.portfolio-item');
    const buttons = document.querySelectorAll('.category-btn');
    
    // Update button states
    buttons.forEach(btn => {
        btn.classList.remove('active', 'bg-cyber-blue', 'text-dark-bg');
        btn.classList.add('bg-gray-700');
    });
    
    event.target.classList.add('active', 'bg-cyber-blue', 'text-dark-bg');
    event.target.classList.remove('bg-gray-700');
    
    // Filter items
    items.forEach(item => {
        if (category === 'all' || item.getAttribute('data-category') === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Contact Form
function initContactForm() {
    const form = document.getElementById('contact-form');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const messageData = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message'),
            timestamp: new Date().toISOString(),
            status: 'unread'
        };
        
        // Store message in localStorage
        const messages = JSON.parse(localStorage.getItem('messages_v2') || '[]');
        messageData.id = Date.now().toString();
        messages.push(messageData);
        localStorage.setItem('messages_v2', JSON.stringify(messages));
        
        showToast('Message sent! Thank you for reaching out.');
        form.reset();
    });
}

// Scroll Effects
function initScrollEffects() {
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
}

// Utility Functions
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    
    if (type === 'error') {
        toast.querySelector('.glass-effect').classList.add('border-red-500');
        toast.querySelector('.glass-effect').classList.remove('border-green-500');
    } else {
        toast.querySelector('.glass-effect').classList.add('border-green-500');
        toast.querySelector('.glass-effect').classList.remove('border-red-500');
    }
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Global functions for HTML onclick handlers
window.scrollToSection = scrollToSection;
window.filterPortfolio = filterPortfolio;