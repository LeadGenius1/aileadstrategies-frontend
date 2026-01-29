// Quick fix - add this single line at the VERY TOP of your app's entry file
// (Before any other imports or code)

// Option 1: Complete suppression (most aggressive)
['log', 'warn', 'error'].forEach(m => { const o = console[m]; console[m] = (...a) => { const s = a[0]?.toString() || ''; if (!s.includes('Invalid message origin') && !(m === 'warn' && s.includes('Clerk has been loaded') && window.__clerkWarnShown)) { if (m === 'warn' && s.includes('Clerk has been loaded')) window.__clerkWarnShown = true; o(...a); } }; });

// Option 2: As a function you can call
export function suppressClerkErrors() {
  ['log', 'warn', 'error'].forEach(method => {
    const original = console[method];
    console[method] = function(...args) {
      const message = args[0]?.toString() || '';
      
      // Skip "Invalid message origin or structure" 
      if (message.includes('Invalid message origin or structure')) {
        return;
      }
      
      // Show Clerk warning only once
      if (method === 'warn' && message.includes('Clerk has been loaded with development keys')) {
        if (window.__clerkDevWarningShown) return;
        window.__clerkDevWarningShown = true;
      }
      
      return original.apply(console, args);
    };
  });
}

// Option 3: For React/Next.js - use as a hook
export function useSupressClerkErrors() {
  if (typeof window !== 'undefined' && !window.__clerkErrorsSuppressed) {
    window.__clerkErrorsSuppressed = true;
    suppressClerkErrors();
  }
}