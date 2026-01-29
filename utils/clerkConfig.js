// Clerk configuration with error suppression
import { setupMessageFilter, suppressInvalidMessages } from './messageFilter';

export function initializeClerk() {
  // Set up message filtering before Clerk initializes
  if (typeof window !== 'undefined') {
    setupMessageFilter();
    // Or use the alternative approach:
    // suppressInvalidMessages();
    
    // Suppress console warnings in development
    if (process.env.NODE_ENV === 'development') {
      const originalWarn = console.warn;
      console.warn = function(...args) {
        // Filter out Clerk development key warnings if needed
        if (args[0]?.includes && args[0].includes('Clerk has been loaded with development keys')) {
          // You can still see this warning once
          if (!window.__clerkDevWarningShown) {
            window.__clerkDevWarningShown = true;
            originalWarn.apply(console, args);
          }
          return;
        }
        // Filter out invalid message warnings
        if (args[0]?.includes && args[0].includes('Invalid message')) {
          return;
        }
        originalWarn.apply(console, args);
      };
      
      // Also suppress console errors for invalid messages
      const originalError = console.error;
      console.error = function(...args) {
        if (args[0]?.includes && args[0].includes('Invalid message origin or structure')) {
          return;
        }
        originalError.apply(console, args);
      };
    }
  }
}

// Call this function as early as possible in your app
// For example, in your main app file or _app.js/tsx
initializeClerk();