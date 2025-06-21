
import { useEffect } from 'react';

export const SecurityHeaders = () => {
  useEffect(() => {
    // Set up Content Security Policy via meta tag (since we can't modify HTTP headers)
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Relaxed for React dev
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://eczfacpnbtwiaauzemvr.supabase.co wss://eczfacpnbtwiaauzemvr.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
    
    // Check if CSP meta tag doesn't already exist
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      document.head.appendChild(cspMeta);
    }

    // Set up other security meta tags
    const securityMetas = [
      { name: 'referrer', content: 'strict-origin-when-cross-origin' },
      { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
      { httpEquiv: 'X-Frame-Options', content: 'DENY' },
      { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' }
    ];

    securityMetas.forEach(meta => {
      const existingMeta = document.querySelector(
        meta.name 
          ? `meta[name="${meta.name}"]` 
          : `meta[http-equiv="${meta.httpEquiv}"]`
      );
      
      if (!existingMeta) {
        const metaElement = document.createElement('meta');
        if (meta.name) {
          metaElement.name = meta.name;
        } else if (meta.httpEquiv) {
          metaElement.httpEquiv = meta.httpEquiv;
        }
        metaElement.content = meta.content;
        document.head.appendChild(metaElement);
      }
    });

    // Disable right-click context menu in production (optional security measure)
    const handleContextMenu = (e: MouseEvent) => {
      if (import.meta.env.PROD) {
        e.preventDefault();
      }
    };

    // Disable F12 and other dev tools shortcuts in production
    const handleKeyDown = (e: KeyboardEvent) => {
      if (import.meta.env.PROD) {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'C') ||
            (e.ctrlKey && e.key === 'u')) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null; // This component doesn't render anything
};
