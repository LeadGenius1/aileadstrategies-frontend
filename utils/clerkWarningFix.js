// This specifically targets only the Clerk development warning
// Add this before Clerk initializes

(function() {
  if (typeof window === 'undefined') return;
  
  const originalWarn = console.warn;
  
  // Override console.warn to filter Clerk dev message
  console.warn = function(...args) {
    const message = args[0]?.toString() || '';
    
    // Completely suppress Clerk development warning
    if (message.includes('Clerk has been loaded with development keys')) {
      // Optionally, you can show it just once in a less intrusive way:
      if (!window.__clerkDevNotified) {
        window.__clerkDevNotified = true;
        console.info('📝 Using Clerk development keys');
      }
      return; // Don't show the full warning
    }
    
    return originalWarn.apply(console, args);
  };
})();

// Export for ES6 modules
export default null;