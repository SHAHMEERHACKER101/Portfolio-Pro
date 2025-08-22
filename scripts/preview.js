// Portfolio Preview System for Shahmeer Baqai Portfolio
// Handles file previews for PDF, MP4, and DOCX files

class PortfolioPreview {
    constructor() {
        this.currentItem = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close modal when clicking outside
        const portfolioModal = document.getElementById('portfolio-modal');
        if (portfolioModal) {
            portfolioModal.addEventListener('click', (e) => {
                if (e.target === portfolioModal) {
                    this.closeModal();
                }
            });
        }
    }

    openPreview(item) {
        this.currentItem = item;
        const modal = document.getElementById('portfolio-modal');
        const modalContent = document.getElementById('portfolio-modal-content');
        
        modalContent.innerHTML = this.generateModalContent(item);
        modal.classList.remove('hidden');
        
        // Setup close button
        const closeBtn = modalContent.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Setup download button
        const downloadBtn = modalContent.querySelector('.download-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadFile(item));
        }

        // Load content based on file type
        this.loadFileContent(item);
    }

    generateModalContent(item) {
        return `
            <div class="h-full">
                <div class="flex justify-between items-center p-6 border-b border-gray-700">
                    <div>
                        <h3 class="text-2xl font-bold text-white">${item.title}</h3>
                        <p class="text-gray-400">${item.category} • ${item.fileType.toUpperCase()}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        ${item.fileType === 'docx' ? `
                            <button class="download-btn bg-cyber-blue text-dark-bg hover:bg-white px-4 py-2 rounded-lg transition-colors">
                                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                                Download
                            </button>
                        ` : ''}
                        <button class="close-btn text-gray-400 hover:text-white p-2">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div id="file-content" class="h-full p-6 overflow-auto">
                    <div class="flex items-center justify-center h-full">
                        <div class="text-center">
                            <div class="animate-spin w-8 h-8 border-2 border-cyber-blue border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p class="text-gray-400">Loading ${item.fileType.toUpperCase()}...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadFileContent(item) {
        const fileContent = document.getElementById('file-content');
        if (!fileContent) return;

        try {
            switch (item.fileType) {
                case 'pdf':
                    await this.loadPDF(item, fileContent);
                    break;
                case 'mp4':
                    this.loadVideo(item, fileContent);
                    break;
                case 'docx':
                    this.loadDocx(item, fileContent);
                    break;
                default:
                    this.showError(fileContent, 'Unsupported file type');
            }
        } catch (error) {
            console.error('Error loading file content:', error);
            this.showError(fileContent, 'Failed to load file content');
        }
    }

    async loadPDF(item, container) {
        try {
            if (typeof pdfjsLib === 'undefined') {
                this.showError(container, 'PDF.js library not loaded');
                return;
            }

            // In a real implementation, you would fetch the file from GitHub
            // For now, we'll show a PDF placeholder with download option
            container.innerHTML = `
                <div class="flex items-center justify-center h-full">
                    <div class="text-center">
                        <div class="text-6xl mb-4">📄</div>
                        <p class="text-white text-xl mb-2">PDF Document</p>
                        <p class="text-gray-400 mb-4">PDF preview will be rendered here using PDF.js</p>
                        <button onclick="portfolioPreview.downloadFile(portfolioPreview.currentItem)" class="bg-cyber-blue text-dark-bg hover:bg-white px-6 py-3 rounded-lg font-bold">
                            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            Download PDF
                        </button>
                        <div class="mt-4 text-sm text-gray-500">
                            File size: ${this.formatFileSize(item.fileSize)}
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            this.showError(container, 'Error loading PDF: ' + error.message);
        }
    }

    loadVideo(item, container) {
        // In a real implementation, you would get the video URL from GitHub
        const videoUrl = `https://github.com/username/Portfolio-Pro/raw/main/${item.githubPath}`;
        
        container.innerHTML = `
            <div class="flex items-center justify-center h-full">
                <div class="w-full max-w-4xl">
                    <video
                        controls
                        class="w-full rounded-lg shadow-lg"
                        poster="${item.thumbnail || ''}"
                        preload="metadata"
                    >
                        <source src="${videoUrl}" type="video/mp4" />
                        <p class="text-red-400">Your browser does not support the video tag.</p>
                    </video>
                    <div class="mt-4 text-center">
                        <div class="text-sm text-gray-400">
                            File size: ${this.formatFileSize(item.fileSize)} • Duration: Loading...
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add video event listeners
        const video = container.querySelector('video');
        if (video) {
            video.addEventListener('loadedmetadata', () => {
                const duration = this.formatDuration(video.duration);
                const durationSpan = container.querySelector('.text-gray-400');
                if (durationSpan) {
                    durationSpan.textContent = `File size: ${this.formatFileSize(item.fileSize)} • Duration: ${duration}`;
                }
            });

            video.addEventListener('error', () => {
                this.showError(container, 'Error loading video. The file might not be available or corrupted.');
            });
        }
    }

    loadDocx(item, container) {
        container.innerHTML = `
            <div class="flex items-center justify-center h-full">
                <div class="text-center">
                    <div class="text-6xl mb-4">📄</div>
                    <p class="text-white text-xl mb-2">Word Document</p>
                    <p class="text-gray-400 mb-4">Click download to view the document</p>
                    <button onclick="portfolioPreview.downloadFile(portfolioPreview.currentItem)" class="bg-cyber-blue text-dark-bg hover:bg-white px-6 py-3 rounded-lg font-bold">
                        <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        Download DOCX
                    </button>
                    <div class="mt-4 text-sm text-gray-500">
                        File size: ${this.formatFileSize(item.fileSize)}
                    </div>
                </div>
            </div>
        `;
    }

    showError(container, message) {
        container.innerHTML = `
            <div class="flex items-center justify-center h-full">
                <div class="text-center">
                    <div class="text-6xl mb-4 text-red-400">⚠️</div>
                    <p class="text-red-400 text-xl mb-2">Error</p>
                    <p class="text-gray-400">${message}</p>
                </div>
            </div>
        `;
    }

    downloadFile(item) {
        if (!item) return;
        
        // In a real implementation, you would download from GitHub
        const downloadUrl = `https://github.com/username/Portfolio-Pro/raw/main/${item.githubPath}`;
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = item.fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDuration(seconds) {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    closeModal() {
        const modal = document.getElementById('portfolio-modal');
        modal.classList.add('hidden');
        this.currentItem = null;
    }
}

// Initialize portfolio preview
let portfolioPreview;
document.addEventListener('DOMContentLoaded', () => {
    portfolioPreview = new PortfolioPreview();
});