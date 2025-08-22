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
            
            console.log(`Starting download: ${fileName} from ${filePath}`);
            
            // Try multiple URL strategies
            const urls = this.constructAllPossibleUrls(filePath, fileName);
            console.log('Trying URLs:', urls);
            
            let blob = null;
            let lastError = null;
            
            for (const url of urls) {
                try {
                    console.log(`Attempting download from: ${url}`);
                    blob = await this.fetchFileFromUrl(url);
                    console.log(`Successfully downloaded from: ${url}`);
                    break;
                } catch (error) {
                    console.warn(`Failed to download from ${url}:`, error.message);
                    lastError = error;
                }
            }
            
            if (!blob) {
                throw lastError || new Error('All download attempts failed');
            }
            
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
    
    async fetchFileFromUrl(url) {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache',
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Handle GitHub API response (content endpoint)
        if (url.includes('api.github.com')) {
            const data = await response.json();
            if (data.content) {
                // Decode base64 content
                const binaryString = atob(data.content.replace(/\s/g, ''));
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                return new Blob([bytes]);
            }
            throw new Error('No content found in API response');
        }
        
        // Handle direct file response
        const blob = await response.blob();
        
        // Validate blob
        if (blob.size === 0) {
            throw new Error('Downloaded file is empty');
        }
        
        return blob;
    }
    
    constructAllPossibleUrls(filePath, fileName) {
        const urls = [];
        
        // If it's already a full URL, use it
        if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
            urls.push(filePath);
            return urls;
        }
        
        // Method 1: Direct GitHub raw URL using the file path as stored
        if (filePath.startsWith('uploads/')) {
            const encodedPath = encodeURIComponent(filePath).replace(/%2F/g, '/');
            urls.push(`https://raw.githubusercontent.com/SHAHMEERHACKER101/Portfolio-Pro/main/${encodedPath}`);
        }
        
        // Method 2: GitHub raw URL with manual space encoding
        if (filePath.startsWith('uploads/')) {
            const spacesEncodedPath = filePath.replace(/ /g, '%20');
            urls.push(`https://raw.githubusercontent.com/SHAHMEERHACKER101/Portfolio-Pro/main/${spacesEncodedPath}`);
        }
        
        // Method 3: Construct URL from filename (if filePath seems wrong)
        if (fileName && filePath.startsWith('uploads/')) {
            const fileNameEncoded = encodeURIComponent(fileName);
            urls.push(`https://raw.githubusercontent.com/SHAHMEERHACKER101/Portfolio-Pro/main/uploads/${fileNameEncoded}`);
        }
        
        // Method 4: Try with simple space replacement
        if (filePath.startsWith('uploads/') && fileName) {
            const simpleEncoded = fileName.replace(/ /g, '%20');
            urls.push(`https://raw.githubusercontent.com/SHAHMEERHACKER101/Portfolio-Pro/main/uploads/${simpleEncoded}`);
        }
        
        // Method 5: GitHub API content URL (alternative)
        if (filePath.startsWith('uploads/')) {
            const encodedPath = encodeURIComponent(filePath).replace(/%2F/g, '/');
            urls.push(`https://api.github.com/repos/SHAHMEERHACKER101/Portfolio-Pro/contents/${encodedPath}`);
        }
        
        // Method 6: Fallback to relative URL (for local testing)
        const encodedPath = filePath.replace(/ /g, '%20');
        urls.push(window.location.origin + '/' + encodedPath);
        
        return urls;
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
