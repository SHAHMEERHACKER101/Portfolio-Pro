// Main JavaScript functionality
class PortfolioApp {
  constructor() {
    this.init();
  }

  init() {
    this.setupCursor();
    this.setupNeuralBackground();
    this.setupModals();
    this.setupAnimations();
    this.setupFormHandlers();
  }

  // Custom Cursor
  setupCursor() {
    const cursor = document.getElementById('cursor');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const updateCursor = () => {
      cursorX += (mouseX - cursorX) * 0.1;
      cursorY += (mouseY - cursorY) * 0.1;
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      requestAnimationFrame(updateCursor);
    };
    updateCursor();

    // Hide cursor on buttons/links
    document.querySelectorAll('button, a, input, textarea').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(2)';
        cursor.style.opacity = '0.5';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
        cursor.style.opacity = '1';
      });
    });
  }

  // Neural Network Background
  setupNeuralBackground() {
    const canvas = document.getElementById('neural-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const nodes = [];
    const nodeCount = Math.floor((canvas.width * canvas.height) / 15000);
    
    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 243, 255, 0.6)';
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0, 243, 255, ${0.2 * (1 - distance / 150)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  // Modal Setup
  setupModals() {
    // Contact Modal
    const contactModal = document.getElementById('contactModal');
    const contactBtn = document.getElementById('contactBtn');
    const contactBtnBottom = document.getElementById('contactBtnBottom');
    const closeContact = document.getElementById('closeContact');

    [contactBtn, contactBtnBottom].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          contactModal.style.display = 'block';
        });
      }
    });

    closeContact.addEventListener('click', () => {
      contactModal.style.display = 'none';
    });

    // Admin Modal
    const adminModal = document.getElementById('adminModal');
    const adminBtn = document.getElementById('adminBtn');
    const closeAdmin = document.getElementById('closeAdmin');

    adminBtn.addEventListener('click', () => {
      adminModal.style.display = 'block';
    });

    closeAdmin.addEventListener('click', () => {
      adminModal.style.display = 'none';
    });

    // Close modals on outside click
    window.addEventListener('click', (e) => {
      if (e.target === contactModal) {
        contactModal.style.display = 'none';
      }
      if (e.target === adminModal) {
        adminModal.style.display = 'none';
      }
    });
  }

  // GSAP Animations
  setupAnimations() {
    // Check if GSAP is loaded
    if (typeof gsap === 'undefined') {
      console.warn('GSAP not loaded, skipping animations');
      return;
    }

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Hero animations
    gsap.timeline()
      .from('.hero-title', { 
        y: 50, 
        opacity: 0, 
        duration: 1, 
        ease: 'power2.out' 
      })
      .from('.hero-subtitle', { 
        y: 30, 
        opacity: 0, 
        duration: 0.8, 
        ease: 'power2.out' 
      }, '-=0.5')
      .from('.hero-quote', { 
        y: 30, 
        opacity: 0, 
        duration: 0.8, 
        ease: 'power2.out' 
      }, '-=0.3')
      .from('.stat-item', { 
        y: 30, 
        opacity: 0, 
        duration: 0.6, 
        stagger: 0.1, 
        ease: 'power2.out' 
      }, '-=0.3');

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
  }

  // Form Handlers
  setupFormHandlers() {
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(contactForm);
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('project'),
        date: new Date().toISOString()
      };

      try {
        // Store message in localStorage for demo purposes
        const messages = JSON.parse(localStorage.getItem('portfolioMessages') || '[]');
        messages.push({ ...data, id: Date.now() });
        localStorage.setItem('portfolioMessages', JSON.stringify(messages));

        // Show success message
        successMessage.style.display = 'block';
        setTimeout(() => {
          successMessage.style.display = 'none';
        }, 3000);

        // Close modal and reset form
        document.getElementById('contactModal').style.display = 'none';
        contactForm.reset();

      } catch (error) {
        console.error('Error sending message:', error);
        alert('Error sending message. Please try again.');
      }
    });
  }

  // Show success message
  showSuccessMessage(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.querySelector('p').textContent = message;
    successDiv.style.display = 'block';
    setTimeout(() => {
      successDiv.style.display = 'none';
    }, 3000);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PortfolioApp();
});

// Export for use in other files
window.PortfolioApp = PortfolioApp;