
import { useEffect } from 'react';

const SecurityHeaders = () => {
  useEffect(() => {
    // Set security-related meta tags and headers where possible on client-side
    
    // Content Security Policy (basic implementation via meta tag)
    const cspMeta = document.createElement('meta');
    cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
    cspMeta.setAttribute('content', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com data:; " +
      "img-src 'self' data: blob: https:; " +
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self';"
    );
    
    // Only add if not already present
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      document.head.appendChild(cspMeta);
    }

    // X-Frame-Options equivalent
    const frameMeta = document.createElement('meta');
    frameMeta.setAttribute('http-equiv', 'X-Frame-Options');
    frameMeta.setAttribute('content', 'DENY');
    if (!document.querySelector('meta[http-equiv="X-Frame-Options"]')) {
      document.head.appendChild(frameMeta);
    }

    // X-Content-Type-Options
    const contentTypeMeta = document.createElement('meta');
    contentTypeMeta.setAttribute('http-equiv', 'X-Content-Type-Options');
    contentTypeMeta.setAttribute('content', 'nosniff');
    if (!document.querySelector('meta[http-equiv="X-Content-Type-Options"]')) {
      document.head.appendChild(contentTypeMeta);
    }

    // Referrer Policy
    const referrerMeta = document.createElement('meta');
    referrerMeta.setAttribute('name', 'referrer');
    referrerMeta.setAttribute('content', 'strict-origin-when-cross-origin');
    if (!document.querySelector('meta[name="referrer"]')) {
      document.head.appendChild(referrerMeta);
    }

    // Disable right-click context menu on production (optional security measure)
    const handleContextMenu = (e: MouseEvent) => {
      if (import.meta.env.PROD) {
        e.preventDefault();
      }
    };

    // Disable F12, Ctrl+U, Ctrl+Shift+I in production
    const handleKeyDown = (e: KeyboardEvent) => {
      if (import.meta.env.PROD) {
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.key === 'u') ||
          (e.ctrlKey && e.shiftKey && e.key === 'I')
        ) {
          e.preventDefault();
        }
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Security monitoring - detect if DevTools is open
    let devtools = {
      open: false,
      orientation: ''
    };

    const threshold = 160;
    let counter = 0;

    const detectDevTools = () => {
      if (import.meta.env.PROD) {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
          if (!devtools.open) {
            devtools.open = true;
            console.clear();
            console.warn('🔒 Esta aplicação contém informações sensíveis. O uso de ferramentas de desenvolvimento é monitorado.');
            
            // Log potential security event (you might want to send this to your backend)
            console.warn('Security Event: Developer tools potentially opened');
          }
        } else {
          devtools.open = false;
        }
      }
    };

    const devToolsInterval = setInterval(detectDevTools, 500);

    // Clean up function
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(devToolsInterval);
      
      // Remove added meta tags on cleanup
      const metaTags = [
        document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
        document.querySelector('meta[http-equiv="X-Frame-Options"]'),
        document.querySelector('meta[http-equiv="X-Content-Type-Options"]'),
        document.querySelector('meta[name="referrer"]')
      ];
      
      metaTags.forEach(tag => {
        if (tag) {
          tag.remove();
        }
      });
    };
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default SecurityHeaders;
