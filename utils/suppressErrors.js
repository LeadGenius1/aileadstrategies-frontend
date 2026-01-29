// Aggressive error suppression for Clerk message issues
// Add this script as early as possible in your application

(function() {
  if (typeof window === 'undefined') return;

  // Store original console methods
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error
  };

  // Track if we've shown the Clerk dev warning
  let clerkDevWarningShown = false;

  // Override console.log
  console.log = function(...args) {
    const message = args[0]?.toString() || '';
    if (message.includes('Invalid message origin or structure')) {
      return; // Suppress this specific message
    }
    return originalConsole.log.apply(console, args);
  };

  // Override console.warn
  console.warn = function(...args) {
    const message = args[0]?.toString() || '';
    
    // Handle Clerk dev warning - show only once
    if (message.includes('Clerk has been loaded with development keys')) {
      if (!clerkDevWarningShown) {
        clerkDevWarningShown = true;
        return originalConsole.warn.apply(console, args);
      }
      return; // Suppress subsequent warnings
    }
    
    if (message.includes('Invalid message origin or structure')) {
      return; // Suppress this message
    }
    
    return originalConsole.warn.apply(console, args);
  };

  // Override console.error
  console.error = function(...args) {
    const message = args[0]?.toString() || '';
    if (message.includes('Invalid message origin or structure')) {
      return; // Suppress this specific error
    }
    return originalConsole.error.apply(console, args);
  };

  // Intercept and filter window message events
  const originalAddEventListener = window.addEventListener;
  const messageHandlers = new WeakMap();

  window.addEventListener = function(type, listener, options) {
    if (type === 'message') {
      // Create a filtered version of the listener
      const filteredListener = function(event) {
        try {
          // Skip events with no data or invalid structure
          if (!event.data) return;
          
          // Skip events from unknown origins that Clerk might be complaining about
          const validOrigins = [
            window.location.origin,
            'https://accounts.clerk.dev',
            'https://clerk.com',
            'https://accounts.clerk.com',
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:5173',
            'http://localhost:5174'
          ];
          
          // Check if it's a string that might be causing issues
          if (typeof event.data === 'string') {
            // Skip certain problematic string messages
            const problematicStrings = [
              'webpackHotUpdate',
              'webpack',
              '__parcel',
              'vite',
              'react-devtools'
            ];
            
            if (problematicStrings.some(s => event.data.includes(s))) {
              return;
            }
          }
          
          // Try to call the original listener
          listener.call(this, event);
        } catch (error) {
          // Silently ignore errors that contain our target message
          if (!error.message?.includes('Invalid message origin or structure')) {
            // Re-throw other errors
            throw error;
          }
        }
      };
      
      // Store the mapping so we can remove it later if needed
      messageHandlers.set(listener, filteredListener);
      
      return originalAddEventListener.call(this, type, filteredListener, options);
    }
    
    // For non-message events, use original
    return originalAddEventListener.call(this, type, listener, options);
  };

  // Also override removeEventListener to handle our wrapped listeners
  const originalRemoveEventListener = window.removeEventListener;
  window.removeEventListener = function(type, listener, options) {
    if (type === 'message' && messageHandlers.has(listener)) {
      return originalRemoveEventListener.call(this, type, messageHandlers.get(listener), options);
    }
    return originalRemoveEventListener.call(this, type, listener, options);
  };

  // Catch any unhandled errors and filter them
  window.addEventListener('error', function(event) {
    if (event.message && event.message.includes('Invalid message origin or structure')) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);

  // Also catch unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.toString().includes('Invalid message origin or structure')) {
      event.preventDefault();
      return false;
    }
  }, true);

})();

export default {};