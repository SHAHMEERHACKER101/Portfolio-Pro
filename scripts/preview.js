// File preview system with PDF.js integration
let pdfjs = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Preview system initializing...');
    
    // Initialize PDF.js if available
    if (typeof pdfjsLib !== 'undefined') {
        pdfjs = pdfjsLib;
        pdfjs.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.js';
        console.log('PDF.js initialized');
    }
});

// Show Preview Modal
function showPreviewModal(item) {
    const modal = document.getElementById('preview-modal');
    const title = document.getElementById('preview-title');
    const content = document.getElementById('preview-content');
    const downloadBtn = document.getElementById('download-btn');
    
    if (!modal || !title || !content || !downloadBtn) {
        console.error('Preview modal elements not found');
        return;
    }
    
    title.textContent = item.title;
    content.innerHTML = '<div style="text-align: center; padding: 2rem; color: #9ca3af;">Loading preview...</div>';
    
    // Set up download button
    downloadBtn.onclick = () => downloadFile(item);
    
    modal.classList.add('active');
    
    // Generate preview based on file type
    generatePreview(item, content);
}

// Hide Preview Modal
function hidePreviewModal() {
    const modal = document.getElementById('preview-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Generate Preview
async function generatePreview(item, container) {
    try {
        const fileUrl = getFileUrl(item.file);
        const fileType = item.fileType || getFileTypeFromUrl(fileUrl);
        
        console.log(`Generating preview for ${fileType}:`, fileUrl);
        
        if (fileType.includes('pdf')) {
            await renderPDFPreview(fileUrl, container);
        } else if (fileType.startsWith('image/')) {
            renderImagePreview(fileUrl, container, item.title);
        } else if (fileType.startsWith('video/')) {
            renderVideoPreview(fileUrl, container, item.title);
        } else if (fileType.startsWith('audio/')) {
            renderAudioPreview(fileUrl, container, item.title);
        } else if (fileType.includes('text') || fileType.includes('document')) {
            renderDocumentPreview(fileUrl, container, item.title);
        } else {
            renderGenericPreview(item, container);
        }
        
    } catch (error) {
        console.error('Preview generation error:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #ef4444;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
                <h3>Preview Not Available</h3>
                <p>Unable to generate preview for this file type.</p>
                <p style="font-size: 0.9rem; color: #9ca3af; margin-top: 1rem;">
                    File: ${item.title}<br>
                    Type: ${item.fileType || 'Unknown'}
                </p>
                <button onclick="downloadFile(${JSON.stringify(item).replace(/"/g, '&quot;')})" 
                        class="btn btn-primary" style="margin-top: 1rem;">
                    Download File
                </button>
            </div>
        `;
    }
}

// Render PDF Preview
async function renderPDFPreview(url, container) {
    if (!pdfjs) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #f59e0b;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📄</div>
                <h3>PDF Preview Unavailable</h3>
                <p>PDF.js library not loaded. Download to view the file.</p>
            </div>
        `;
        return;
    }
    
    try {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="margin-bottom: 1rem; color: #9ca3af;">Loading PDF...</div>
                <div style="width: 40px; height: 40px; border: 4px solid #374151; border-top: 4px solid #00f3ff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            </div>
        `;
        
        const pdf = await pdfjs.getDocument(url).promise;
        const page = await pdf.getPage(1);
        
        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        container.innerHTML = `
            <div style="text-align: center;">
                <div style="margin-bottom: 1rem;">
                    <span style="color: #00f3ff; font-weight: 600;">PDF Preview</span>
                    <span style="color: #9ca3af; margin-left: 1rem;">Page 1 of ${pdf.numPages}</span>
                </div>
                <div style="border: 1px solid #374151; border-radius: 8px; overflow: hidden; display: inline-block; max-width: 100%;">
                    ${canvas.outerHTML}
                </div>
                ${pdf.numPages > 1 ? `<div style="margin-top: 1rem; color: #9ca3af; font-size: 0.9rem;">Download to view all ${pdf.numPages} pages</div>` : ''}
            </div>
        `;
        
    } catch (error) {
        console.error('PDF rendering error:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #ef4444;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📄</div>
                <h3>PDF Preview Error</h3>
                <p>Unable to load PDF file. It may be corrupted or too large.</p>
                <small style="color: #9ca3af;">Error: ${error.message}</small>
            </div>
        `;
    }
}

// Render Image Preview
function renderImagePreview(url, container, title) {
    container.innerHTML = `
        <div style="text-align: center;">
            <div style="margin-bottom: 1rem; color: #00f3ff; font-weight: 600;">Image Preview</div>
            <div style="border: 1px solid #374151; border-radius: 8px; overflow: hidden; display: inline-block; max-width: 100%;">
                <img src="${url}" alt="${title}" 
                     style="max-width: 100%; max-height: 500px; display: block;"
                     onload="this.style.opacity='1'" 
                     onerror="this.parentElement.innerHTML='<div style=&quot;padding: 2rem; color: #ef4444;&quot;>Failed to load image</div>'"
                     style="opacity: 0; transition: opacity 0.3s;">
            </div>
        </div>
    `;
}

// Render Video Preview
function renderVideoPreview(url, container, title) {
    container.innerHTML = `
        <div style="text-align: center;">
            <div style="margin-bottom: 1rem; color: #00f3ff; font-weight: 600;">Video Preview</div>
            <div style="border: 1px solid #374151; border-radius: 8px; overflow: hidden; display: inline-block; max-width: 100%;">
                <video controls style="max-width: 100%; max-height: 500px; display: block; background: #000;">
                    <source src="${url}" type="video/mp4">
                    <source src="${url}" type="video/webm">
                    <source src="${url}" type="video/mov">
                    Your browser does not support the video tag.
                </video>
            </div>
            <div style="margin-top: 1rem; color: #9ca3af; font-size: 0.9rem;">
                Click play to start video • Right-click to download
            </div>
        </div>
    `;
}

// Render Audio Preview
function renderAudioPreview(url, container, title) {
    container.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🎵</div>
            <div style="margin-bottom: 1rem; color: #00f3ff; font-weight: 600;">Audio Preview</div>
            <audio controls style="width: 100%; max-width: 400px; margin-bottom: 1rem;">
                <source src="${url}" type="audio/mpeg">
                <source src="${url}" type="audio/wav">
                <source src="${url}" type="audio/ogg">
                Your browser does not support the audio tag.
            </audio>
            <div style="color: #9ca3af; font-size: 0.9rem;">
                ${title}
            </div>
        </div>
    `;
}

// Render Document Preview
function renderDocumentPreview(url, container, title) {
    container.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">📝</div>
            <div style="margin-bottom: 1rem; color: #00f3ff; font-weight: 600;">Document Preview</div>
            <div style="color: #d1d5db; margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem;">${title}</h3>
                <p style="color: #9ca3af;">
                    This document type cannot be previewed in the browser.<br>
                    Download the file to view its contents.
                </p>
            </div>
            <div style="display: flex; justify-content: center; gap: 1rem;">
                <button onclick="downloadFile(${JSON.stringify({file: url, title}).replace(/"/g, '&quot;')})" 
                        class="btn btn-primary">
                    Download Document
                </button>
            </div>
        </div>
    `;
}

// Render Generic Preview
function renderGenericPreview(item, container) {
    const icon = getFileTypeIcon(item.fileType || '');
    const sizeText = item.fileSize ? formatFileSize(item.fileSize) : '';
    
    container.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">${icon}</div>
            <div style="margin-bottom: 1rem; color: #00f3ff; font-weight: 600;">File Information</div>
            <div style="color: #d1d5db; margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem;">${item.title}</h3>
                <div style="color: #9ca3af; font-size: 0.9rem;">
                    <div>Category: ${getCategoryName(item.category)}</div>
                    ${item.fileType ? `<div>Type: ${item.fileType}</div>` : ''}
                    ${sizeText ? `<div>Size: ${sizeText}</div>` : ''}
                    <div>Uploaded: ${new Date(item.uploadDate).toLocaleDateString()}</div>
                </div>
            </div>
            <div style="display: flex; justify-content: center; gap: 1rem;">
                <button onclick="downloadFile(${JSON.stringify(item).replace(/"/g, '&quot;')})" 
                        class="btn btn-primary">
                    Download File
                </button>
            </div>
        </div>
    `;
}

// Download File
function downloadFile(item) {
    try {
        const url = getFileUrl(item.file);
        const link = document.createElement('a');
        link.href = url;
        link.download = item.title || 'download';
        link.target = '_blank';
        
        // Add to DOM temporarily for Firefox compatibility
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Download started!');
        
    } catch (error) {
        console.error('Download error:', error);
        showToast('Download failed. Please try again.', 'error');
    }
}

// Utility Functions
function getFileUrl(filePath) {
    if (!filePath) return '';
    
    if (filePath.startsWith('http')) {
        return filePath;
    }
    
    if (window.githubUsername && window.githubRepo) {
        return `https://raw.githubusercontent.com/${window.githubUsername}/${window.githubRepo}/main/${filePath}`;
    }
    
    return filePath;
}

function getFileTypeFromUrl(url) {
    const extension = url.split('.').pop().toLowerCase();
    
    const typeMap = {
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'mov': 'video/quicktime',
        'avi': 'video/x-msvideo',
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'ogg': 'audio/ogg',
        'txt': 'text/plain',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed'
    };
    
    return typeMap[extension] || 'application/octet-stream';
}

function getFileTypeIcon(type) {
    if (type.includes('pdf')) return '📄';
    if (type.includes('video')) return '🎬';
    if (type.includes('image')) return '🖼️';
    if (type.includes('audio')) return '🎵';
    if (type.includes('zip') || type.includes('archive')) return '📦';
    if (type.includes('text') || type.includes('document')) return '📝';
    return '📁';
}

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

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Add CSS for spinner animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Make functions globally available
window.showPreviewModal = showPreviewModal;
window.hidePreviewModal = hidePreviewModal;
window.downloadFile = downloadFile;

console.log('Preview.js loaded successfully');