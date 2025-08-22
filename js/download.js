// Download and File Handling Functionality
class DownloadHandler {
  constructor() {
    this.init();
  }

  init() {
    this.setupDownloadButtons();
    this.setupFileHandlers();
  }

  setupDownloadButtons() {
    // Portfolio download functionality
    const downloadButtons = document.querySelectorAll('[data-download]');
    downloadButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const downloadType = e.target.getAttribute('data-download');
        this.handleDownload(downloadType);
      });
    });
  }

  setupFileHandlers() {
    // File input handlers for admin
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        this.handleFileUpload(e);
      });
    });
  }

  handleDownload(type) {
    switch (type) {
      case 'resume':
        this.downloadResume();
        break;
      case 'portfolio':
        this.downloadPortfolio();
        break;
      case 'messages':
        this.downloadMessages();
        break;
      default:
        console.warn('Unknown download type:', type);
    }
  }

  downloadResume() {
    // Create a sample resume file
    const resumeContent = this.generateResumeContent();
    this.downloadFile(resumeContent, 'Shahmeer_Baqai_Resume.txt', 'text/plain');
  }

  downloadPortfolio() {
    // Create portfolio summary
    const portfolioContent = this.generatePortfolioContent();
    this.downloadFile(portfolioContent, 'Shahmeer_Baqai_Portfolio.txt', 'text/plain');
  }

  downloadMessages() {
    // Download messages as JSON (admin only)
    if (window.adminPanel && window.adminPanel.isLoggedIn) {
      window.adminPanel.exportMessages();
    } else {
      alert('Admin access required');
    }
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        // Handle different file types
        if (file.type === 'application/json') {
          this.handleJSONUpload(e.target.result);
        } else if (file.type.startsWith('text/')) {
          this.handleTextUpload(e.target.result);
        } else {
          console.warn('Unsupported file type:', file.type);
        }
      } catch (error) {
        console.error('Error processing file:', error);
        alert('Error processing file');
      }
    };

    reader.readAsText(file);
  }

  handleJSONUpload(content) {
    try {
      const data = JSON.parse(content);
      // Handle JSON data import (e.g., messages)
      if (window.adminPanel && Array.isArray(data)) {
        window.adminPanel.importMessages(data);
      }
    } catch (error) {
      alert('Invalid JSON file');
    }
  }

  handleTextUpload(content) {
    // Handle text file uploads
    console.log('Text file uploaded:', content);
  }

  generateResumeContent() {
    return `
SHAHMEER BAQAI
Digital Strategist & Content Creator
Email: contact@shahmeerbaqai.com
Portfolio: https://shahmeerbaqai-portfolio-pro.pages.dev/

PROFESSIONAL SUMMARY
===================
Experienced digital strategist with 10+ years in copywriting, content creation, and AI-powered marketing solutions. Specialized in creating high-converting ads, viral video content, and comprehensive digital marketing strategies that drive measurable results.

CORE COMPETENCIES
================
• High-Converting Copywriting (10+ years)
• Content Writing & Strategy (10+ years)
• Academic Writing (5+ years)
• SEO Writing & Optimization
• Graphic Design & AI Visuals
• Video Services & Production
• Video Editing & Post-Production
• Web Development & Programming
• Social Media Marketing
• App Development

ACHIEVEMENTS
===========
• 1000+ satisfied clients across various industries
• Generated 5M+ video views for client content
• Tripled conversion rates for multiple clients
• Expert in AI-powered content creation tools
• Developed custom web applications and Chrome extensions

SERVICES OFFERED
===============
• Facebook, Instagram, TikTok ad copy
• AI-powered viral video creation
• Ghostwriting for books, podcasts, and scripts
• Email marketing campaigns
• Pinterest marketing strategies
• Web tools and AI system development

CONTACT
=======
Ready to discuss your next project and create content that converts.
Portfolio: https://portfolio-files.pages.dev/
    `.trim();
  }

  generatePortfolioContent() {
    return `
SHAHMEER BAQAI - DIGITAL PORTFOLIO
==================================

OVERVIEW
========
Digital strategist specializing in high-converting copy and AI-powered video content. 
10+ years of experience helping brands achieve breakthrough results through strategic content creation.

KEY SERVICES
===========

🚀 High-Converting Ads
• Facebook, Instagram, TikTok campaigns
• Copy that sells in 3 seconds
• Proven track record of increased conversions

🎥 Viral Short Videos
• AI-powered visuals and music
• Content designed to stop the scroll
• 5M+ views generated for clients

📚 Ghostwriting Services
• True crime content
• Book writing and editing
• YouTube scripts in your voice
• Podcast content creation

📧 Email Marketing
• Newsletter campaigns that convert
• High open and click-through rates
• Sales-focused email sequences

📌 Pinterest Marketing
• High-CTR pin designs
• Traffic and revenue driving strategies
• Pinterest SEO optimization

🛠️ Web Tools & AI Development
• Chrome extensions
• Custom AI systems
• Web application development

PROFESSIONAL EXPERTISE
======================
✍️ Copywriting - 10 Years Experience
📝 Content Writing - 10 Years Experience  
🎓 Academic Writing - 5 Years Experience
🔍 SEO Writing - Latest Expertise
🎨 Graphic Design - Latest Expertise
🎬 Video Services - Latest Expertise
✂️ Video Editing - Latest Expertise
💻 Web Development - Latest Expertise
📱 Social Marketing - Latest Expertise
📱 App Development - Latest Expertise

CLIENT TESTIMONIALS
==================
"Shahmeer tripled our conversion rate in 2 weeks. His ads are pure profit engines." 
- Sarah K., Marketing Director

"His AI videos went viral — 5M views in 3 days. Unreal reach and engagement." 
- James L., Founder

"Shahmeer ghostwrote my podcast — sounds exactly like me, but better. 10/10." 
- Alex R., Podcaster

PORTFOLIO SAMPLES
================
View complete portfolio: https://portfolio-files.pages.dev/

CONTACT INFORMATION
==================
Ready to start your next project? Let's create something amazing together.

Website: https://shahmeerbaqai-portfolio-pro.pages.dev/
Portfolio: https://portfolio-files.pages.dev/
    `.trim();
  }

  // Utility function to format file sizes
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Generate portfolio data as JSON
  generatePortfolioData() {
    return {
      personal: {
        name: "Shahmeer Baqai",
        title: "Digital Strategist",
        subtitle: "High-Converting Copy & AI Videos That Sell",
        experience: "10+ years",
        clients: "1000+",
        videoViews: "5M+"
      },
      services: [
        {
          title: "🚀 High-Converting Ads",
          description: "Facebook, Instagram, TikTok — copy that sells in 3 seconds."
        },
        {
          title: "🎥 Viral Short Videos",
          description: "AI-powered visuals + music that stop the scroll."
        },
        {
          title: "📚 Ghostwriting",
          description: "True crime, books, YouTube scripts — in your voice."
        },
        {
          title: "📧 Email That Converts",
          description: "Newsletters that get opens, clicks, and sales."
        },
        {
          title: "📌 Pinterest That Sells",
          description: "High-CTR pins that drive traffic and revenue."
        },
        {
          title: "🛠️ Web Tools & AI",
          description: "Chrome extensions, AI systems, and custom apps."
        }
      ],
      skills: [
        { name: "Copywriting", experience: "10 Years", level: "Expert" },
        { name: "Content Writing", experience: "10 Years", level: "Expert" },
        { name: "Academic Writing", experience: "5 Years", level: "Expert" },
        { name: "SEO Writing", experience: "Latest Expertise", level: "Expert" },
        { name: "Graphic Design", experience: "Latest Expertise", level: "Expert" },
        { name: "Video Services", experience: "Latest Expertise", level: "Expert" },
        { name: "Video Editing", experience: "Latest Expertise", level: "Expert" },
        { name: "Web Development", experience: "Latest Expertise", level: "Expert" },
        { name: "Social Marketing", experience: "Latest Expertise", level: "Expert" },
        { name: "App Development", experience: "Latest Expertise", level: "Expert" }
      ],
      testimonials: [
        {
          stars: 5,
          text: "Shahmeer tripled our conversion rate in 2 weeks. His ads are pure profit engines.",
          author: "Sarah K., Marketing Director"
        },
        {
          stars: 5,
          text: "His AI videos went viral — 5M views in 3 days. Unreal reach and engagement.",
          author: "James L., Founder"
        },
        {
          stars: 5,
          text: "Shahmeer ghostwrote my podcast — sounds exactly like me, but better. 10/10.",
          author: "Alex R., Podcaster"
        }
      ],
      contact: {
        website: "https://shahmeerbaqai-portfolio-pro.pages.dev/",
        portfolio: "https://portfolio-files.pages.dev/"
      }
    };
  }
}

// Initialize download handler
document.addEventListener('DOMContentLoaded', () => {
  new DownloadHandler();
});

// Export for global use
window.DownloadHandler = DownloadHandler;