
import { useNavigate } from 'react-router-dom';
import { useInputValidation } from './useInputValidation';

export const useSecureNavigation = () => {
  const navigate = useNavigate();
  const { validateUrl } = useInputValidation();

  // Secure navigation that validates URLs
  const secureNavigate = (path: string, options?: { replace?: boolean }) => {
    // Only allow internal paths
    if (path.startsWith('http') || path.startsWith('//')) {
      console.error('External navigation blocked for security');
      return;
    }

    // Validate internal path format
    if (!path.startsWith('/')) {
      console.error('Invalid path format');
      return;
    }

    navigate(path, options);
  };

  // Safe external redirect with user confirmation
  const safeExternalRedirect = (url: string) => {
    if (!validateUrl(url)) {
      console.error('Invalid URL for external redirect');
      return;
    }

    if (window.confirm(`Você será redirecionado para: ${url}. Continuar?`)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Replace unsafe window.location.href usage
  const safeReload = () => {
    window.location.reload();
  };

  return {
    secureNavigate,
    safeExternalRedirect,
    safeReload
  };
};
