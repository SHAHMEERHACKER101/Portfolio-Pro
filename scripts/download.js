// Download Handler for Portfolio Files
class DownloadHandler {
    constructor() {
        this.downloadQueue = new Map();
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
    }
    
    async downloadFile(filePath, fileName) {
        try {
            // Show loading state
            this.showDownloadState(fileName, 'downloading');
            
            // Attempt download with retry logic
            const blob = await this.fetchFileWithRetry(filePath);
            
            // Create download
            this.triggerDownload(blob, fileName);
            
            // Show success state
            this.showDownloadState(fileName, 'success');
            
        } catch (error) {
            console.error('Download error:', error);
            this.showDownloadState(fileName, 'error');
            this.showMessage(`Failed to download ${fileName}: ${error.message}`, 'error');
        }
    }
    
    async fetchFileWithRetry(filePath, retryCount = 0) {
        try {
            // Construct the full URL for the file
            const fileUrl = this.constructFileUrl(filePath);
            
            const response = await fetch(fileUrl, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache',
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const blob = await response.blob();
            
            // Validate blob
            if (blob.size === 0) {
                throw new Error('Downloaded file is empty');
            }
            
            return blob;
            
        } catch (error) {
            if (retryCount < this.maxRetries) {
                console.warn(`Download attempt ${retryCount + 1} failed, retrying...`, error);
                await this.delay(this.retryDelay * (retryCount + 1));
                return this.fetchFileWithRetry(filePath, retryCount + 1);
            }
            
            throw error;
        }
    }
    
    constructFileUrl(filePath) {
        // Handle different URL patterns
        if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
            return filePath;
        }
        
        // For GitHub raw files
        if (filePath.startsWith('uploads/')) {
            // Try GitHub raw URL first
            const githubRawUrl = `https://raw.githubusercontent.com/SHAHMEERHACKER101/Portfolio-Pro/main/${filePath}`;
            return githubRawUrl;
        }
        
        // Fallback to relative URL
        return window.location.origin + '/' + filePath;
    }
    
    triggerDownload(blob, fileName) {
        try {
            // Create object URL
            const url = URL.createObjectURL(blob);
            
            // Create temporary download link
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.style.display = 'none';
            
            // Append to body, click, and remove
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Clean up object URL after a delay
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 100);
            
        } catch (error) {
            console.error('Error triggering download:', error);
            throw new Error('Failed to trigger download');
        }
    }
    
    showDownloadState(fileName, state) {
        const buttons = document.querySelectorAll('.download-button');
        
        buttons.forEach(button => {
            const buttonText = button.textContent;
            const isCurrentButton = button.onclick && button.onclick.toString().includes(fileName);
            
            if (isCurrentButton) {
                switch (state) {
                    case 'downloading':
                        button.disabled = true;
                        button.textContent = 'Downloading...';
                        button.style.opacity = '0.7';
                        break;
                    case 'success':
                        button.disabled = false;
                        button.textContent = 'Downloaded ✓';
                        button.style.backgroundColor = '#10b981';
                        setTimeout(() => {
                            button.textContent = 'Download';
                            button.style.backgroundColor = '';
                            button.style.opacity = '';
                        }, 2000);
                        break;
                    case 'error':
                        button.disabled = false;
                        button.textContent = 'Error - Retry';
                        button.style.backgroundColor = '#ef4444';
                        button.style.opacity = '';
                        setTimeout(() => {
                            button.textContent = 'Download';
                            button.style.backgroundColor = '';
                        }, 3000);
                        break;
                }
            }
        });
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showMessage(text, type = 'info') {
        if (window.portfolioApp) {
            window.portfolioApp.showMessage(text, type);
        } else {
            console.log(`${type.toUpperCase()}: ${text}`);
        }
    }
    
    // Bulk download functionality (for future use)
    async downloadMultiple(files) {
        const results = [];
        
        for (const file of files) {
            try {
                await this.downloadFile(file.filePath, file.fileName);
                results.push({ file, success: true });
            } catch (error) {
                results.push({ file, success: false, error });
            }
            
            // Small delay between downloads to prevent overwhelming
            await this.delay(500);
        }
        
        return results;
    }
    
    // File type detection for better handling
    getFileType(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        
        const typeMap = {
            'pdf': 'application/pdf',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'doc': 'application/msword',
            'mp4': 'video/mp4',
            'mov': 'video/quicktime',
            'zip': 'application/zip',
            'txt': 'text/plain'
        };
        
        return typeMap[extension] || 'application/octet-stream';
    }
    
    // Download progress tracking (for large files)
    async downloadWithProgress(filePath, fileName, onProgress) {
        try {
            const fileUrl = this.constructFileUrl(filePath);
            const response = await fetch(fileUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const contentLength = response.headers.get('content-length');
            const total = parseInt(contentLength, 10);
            let loaded = 0;
            
            const reader = response.body.getReader();
            const chunks = [];
            
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                chunks.push(value);
                loaded += value.length;
                
                if (onProgress && total) {
                    onProgress(loaded, total);
                }
            }
            
            const blob = new Blob(chunks, { type: this.getFileType(fileName) });
            this.triggerDownload(blob, fileName);
            
        } catch (error) {
            console.error('Download with progress error:', error);
            throw error;
        }
    }
}

// Initialize download handler
window.downloadHandler = new DownloadHandler();

// Global function for HTML onclick handlers
function downloadFile(filePath, fileName) {
    if (window.downloadHandler) {
        window.downloadHandler.downloadFile(filePath, fileName);
    } else {
        console.error('Download handler not initialized');
    }
}
