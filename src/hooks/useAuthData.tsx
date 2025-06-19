
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAdminAuth } from './useAdminAuth';
import { useClientAuth } from './useClientAuth';

export const useAuthData = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Use the refactored hooks
  const adminAuth = useAdminAuth();
  const clientAuth = useClientAuth();

  // Combine loading states
  const combinedLoading = loading || adminAuth.loading || clientAuth.loading;

  return {
    loading: combinedLoading,
    // Admin auth methods
    authenticateAdmin: adminAuth.authenticateAdmin,
    registerAdmin: adminAuth.registerAdmin,
    updateAdminUser: adminAuth.updateAdminUser,
    deleteAdminUser: adminAuth.deleteAdminUser,
    // Client auth methods
    authenticateClient: clientAuth.authenticateClient,
    registerClient: clientAuth.registerClient
  };
};
