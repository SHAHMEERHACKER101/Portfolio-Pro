// PDF.js Worker - Minimal implementation
// This handles PDF processing in a separate thread (simulated)

(function() {
  'use strict';
  
  // Simulate web worker functionality
  if (typeof window !== 'undefined') {
    // Running in main thread, create mock worker
    window.PDFWorker = {
      process: function(data) {
        return new Promise((resolve) => {
          // Simulate processing delay
          setTimeout(() => {
            resolve({
              success: true,
              data: 'PDF processed successfully'
            });
          }, 100);
        });
      }
    };
  }
  
  console.log('PDF.js worker loaded');
})();