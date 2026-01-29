// Message filter utility to handle postMessage issues with Clerk and other services

export function setupMessageFilter() {
  // Store the original addEventListener
  const originalAddEventListener = window.addEventListener;
  
  // Override addEventListener to filter out invalid messages
  window.addEventListener = function(type, listener, options) {
    if (type === 'message') {
      // Wrap the listener to filter messages
      const filteredListener = (event) => {
        // Check if the message is from a trusted origin
        const trustedOrigins = [
          window.location.origin,
          'https://clerk.com',
          'https://accounts.clerk.com',
          'https://clerk.shared.lcl.dev',
          'https://accounts.dev.lclclerk.com',
          // Add any other Clerk domains you're using
        ];
        
        // Check if the origin is trusted or if it's from the same window
        const isTrustedOrigin = trustedOrigins.some(origin => 
          event.origin === origin || event.origin.includes('clerk')
        );
        
        // Check if the message has valid structure
        const hasValidStructure = event.data && (
          typeof event.data === 'string' || 
          (typeof event.data === 'object' && event.data !== null)
        );
        
        // Only process messages from trusted origins with valid structure
        if (isTrustedOrigin && hasValidStructure) {
          try {
            listener(event);
          } catch (error) {
            // Silently ignore errors from message processing
            if (!error.message?.includes('Invalid message')) {
              console.error('Message processing error:', error);
            }
          }
        } else {
          // Silently ignore invalid messages instead of logging them
          // This prevents the console spam
        }
      };
      
      // Call the original addEventListener with the filtered listener
      return originalAddEventListener.call(this, type, filteredListener, options);
    }
    
    // For non-message events, use the original listener
    return originalAddEventListener.call(this, type, listener, options);
  };
}

// Alternative approach: Add a global message handler to suppress the errors
export function suppressInvalidMessages() {
  window.addEventListener('message', (event) => {
    // This handler runs first and can prevent propagation of invalid messages
    if (!event.data || typeof event.data !== 'object') {
      event.stopImmediatePropagation();
    }
  }, true); // Use capture phase to run before other handlers
}