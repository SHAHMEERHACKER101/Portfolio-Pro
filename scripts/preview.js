// File preview functionality
let currentPreviewFile = null;

async function previewFile(id) {
    const file = portfolioData.find(item => item.id === id);
    
    if (!file) {
        showToast('File not found', 'error');
        return;
    }
    
    // Load file content from GitHub
    try {
        const fileContent = await loadFileFromGitHub(file.file);
        const fileWithContent = {
            ...file,
            data: fileContent,
            contentType: getContentType(file.type, file.file)
        };
        
        currentPreviewFile = fileWithContent;
        showFilePreview(fileWithContent);
    } catch (error) {
        console.error('Failed to load file:', error);
        showToast('Failed to load file for preview', 'error');
    }
}

async function loadFileFromGitHub(filePath) {
    try {
        // Try to load from the current site first (if deployed)
        const response = await fetch(`/${filePath}`);
        if (response.ok) {
            const blob = await response.blob();
            return await blobToBase64(blob);
        }
        
        // Fallback to GitHub raw URL
        const githubResponse = await fetch(`https://raw.githubusercontent.com/shahmeer606/ShahmeerBaqai-Portfolio-Pro/main/${filePath}`);
        if (githubResponse.ok) {
            const blob = await githubResponse.blob();
            return await blobToBase64(blob);
        }
        
        throw new Error('File not found');
    } catch (error) {
        throw error;
    }
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function getContentType(type, filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    const typeMap = {
        'pdf': 'application/pdf',
        'mp4': 'video/mp4',
        'mov': 'video/quicktime',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'txt': 'text/plain',
        'zip': 'application/zip',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png'
    };
    
    return typeMap[extension] || 'application/octet-stream';
}

function showFilePreview(file) {
    const modal = document.getElementById('file-preview-modal');
    const title = document.getElementById('preview-title');
    const content = document.getElementById('preview-content');
    
    title.textContent = file.title;
    
    const type = file.contentType;
    
    if (type.startsWith('image/')) {
        content.innerHTML = `
            <div class="text-center">
                <img src="${file.data}" alt="${file.title}" class="max-w-full max-h-96 mx-auto rounded-lg object-contain">
                <p class="text-gray-400 text-sm mt-4">Image • ${formatFileSize(file.size)}</p>
            </div>
        `;
    }
    else if (type === 'application/pdf') {
        content.innerHTML = `
            <div class="text-center">
                <div class="bg-gray-800 rounded-lg p-8 mb-4">
                    <div class="text-6xl text-cyber-blue mb-4">📄</div>
                    <h3 class="text-xl font-semibold text-white mb-2">${file.filename}</h3>
                    <p class="text-gray-400 mb-4">PDF Document • ${formatFileSize(file.size)}</p>
                    <p class="text-sm text-gray-500 mb-6">PDF preview is not available in this browser.<br>Click download to view the document.</p>
                </div>
            </div>
        `;
    }
    else if (type.startsWith('video/')) {
        content.innerHTML = `
            <div class="text-center">
                <video controls class="max-w-full max-h-96 mx-auto rounded-lg bg-black">
                    <source src="${file.data}" type="${file.contentType}">
                    Your browser does not support the video tag.
                </video>
                <p class="text-gray-400 text-sm mt-4">Video • ${formatFileSize(file.size)}</p>
            </div>
        `;
    }
    else if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        content.innerHTML = `
            <div class="text-center">
                <div class="bg-gray-800 rounded-lg p-8 mb-4">
                    <div class="text-6xl text-cyber-blue mb-4">📝</div>
                    <h3 class="text-xl font-semibold text-white mb-2">${file.filename}</h3>
                    <p class="text-gray-400 mb-4">Word Document • ${formatFileSize(file.size)}</p>
                    <p class="text-sm text-gray-500 mb-6">Document preview is not available in this browser.<br>Click download to view the document.</p>
                </div>
            </div>
        `;
    }
    else if (type === 'text/plain') {
        // For text files, try to show content
        fetch(file.data)
            .then(response => response.text())
            .then(text => {
                content.innerHTML = `
                    <div class="bg-gray-800 rounded-lg p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold text-white">${file.filename}</h3>
                            <span class="text-gray-400 text-sm">${formatFileSize(file.size)}</span>
                        </div>
                        <pre class="text-gray-300 text-sm whitespace-pre-wrap max-h-96 overflow-y-auto bg-gray-900 p-4 rounded">${text}</pre>
                    </div>
                `;
            })
            .catch(() => {
                content.innerHTML = `
                    <div class="text-center">
                        <div class="bg-gray-800 rounded-lg p-8 mb-4">
                            <div class="text-6xl text-cyber-blue mb-4">📄</div>
                            <h3 class="text-xl font-semibold text-white mb-2">${file.filename}</h3>
                            <p class="text-gray-400 mb-4">Text Document • ${formatFileSize(file.size)}</p>
                            <p class="text-sm text-gray-500 mb-6">Click download to view the document.</p>
                        </div>
                    </div>
                `;
            });
    }
    else if (type === 'application/zip') {
        content.innerHTML = `
            <div class="text-center">
                <div class="bg-gray-800 rounded-lg p-8 mb-4">
                    <div class="text-6xl text-cyber-blue mb-4">🗜️</div>
                    <h3 class="text-xl font-semibold text-white mb-2">${file.filename}</h3>
                    <p class="text-gray-400 mb-4">ZIP Archive • ${formatFileSize(file.size)}</p>
                    <p class="text-sm text-gray-500 mb-6">Archive preview is not available in this browser.<br>Click download to extract the archive.</p>
                </div>
            </div>
        `;
    }
    else {
        content.innerHTML = `
            <div class="text-center">
                <div class="bg-gray-800 rounded-lg p-8 mb-4">
                    <div class="text-6xl text-cyber-blue mb-4">📄</div>
                    <h3 class="text-xl font-semibold text-white mb-2">${file.filename}</h3>
                    <p class="text-gray-400 mb-4">Document • ${formatFileSize(file.size)}</p>
                    <p class="text-sm text-gray-500 mb-6">Preview not available for this file type.<br>Click download to view the file.</p>
                </div>
            </div>
        `;
    }
    
    modal.classList.remove('hidden');
}

function hideFilePreview() {
    const modal = document.getElementById('file-preview-modal');
    modal.classList.add('hidden');
    currentPreviewFile = null;
}

function downloadCurrentFile() {
    if (!currentPreviewFile) {
        showToast('No file selected for download', 'error');
        return;
    }
    
    downloadFile(currentPreviewFile);
}

function downloadFile(file) {
    try {
        // Create a temporary anchor element for download
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Download started');
    } catch (error) {
        console.error('Download error:', error);
        showToast('Download failed. Please try again.', 'error');
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Make functions global for HTML onclick handlers
window.previewFile = previewFile;
window.hideFilePreview = hideFilePreview;
window.downloadCurrentFile = downloadCurrentFile;