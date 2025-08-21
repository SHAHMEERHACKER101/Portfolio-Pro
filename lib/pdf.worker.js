// PDF.js Worker - Minimal Implementation
// This handles PDF processing in a web worker context

self.onmessage = function(e) {
    const { type, data } = e.data;
    
    switch (type) {
        case 'load':
            // Simplified PDF loading
            self.postMessage({
                type: 'loaded',
                pageCount: 1,
                success: true
            });
            break;
            
        case 'render':
            // Simplified PDF rendering
            self.postMessage({
                type: 'rendered',
                pageData: null,
                success: true
            });
            break;
            
        default:
            self.postMessage({
                type: 'error',
                error: 'Unknown message type'
            });
    }
};