
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface SuperAdminAuthResult {
  isAuthorized: boolean;
  isLoading: boolean;
  user: any | null;
  checkAccess: () => Promise<boolean>;
}

export const useSuperAdminAuth = (): SuperAdminAuthResult => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const { toast } = useToast();

  const AUTHORIZED_SUPER_ADMIN = 'Helder';

  const checkAccess = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // First check: localStorage admin auth
      const adminAuth = localStorage.getItem('adminAuth');
      if (!adminAuth) {
        console.log('SuperAdmin Auth: No admin auth found');
        setIsAuthorized(false);
        setUser(null);
        return false;
      }

      let adminData;
      try {
        adminData = JSON.parse(adminAuth);
      } catch (parseError) {
        console.error('SuperAdmin Auth: Invalid admin data format');
        setIsAuthorized(false);
        setUser(null);
        return false;
      }

      console.log('SuperAdmin Auth: Checking admin data:', adminData);

      // Second check: name must be exactly "Helder"
      if (adminData.name !== AUTHORIZED_SUPER_ADMIN) {
        console.log(`SuperAdmin Auth: Access denied for user: ${adminData.name}`);
        setIsAuthorized(false);
        setUser(null);
        return false;
      }

      // Third check: role must be super_admin
      if (adminData.role !== 'super_admin') {
        console.log('SuperAdmin Auth: User does not have super_admin role');
        setIsAuthorized(false);
        setUser(null);
        return false;
      }

      // Fourth check: database validation
      try {
        const { data: adminRecord, error } = await supabase
          .from('admin_auth')
          .select('*')
          .eq('name', AUTHORIZED_SUPER_ADMIN)
          .eq('role', 'super_admin')
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            console.log('SuperAdmin Auth: No super admin record found in database');
          } else {
            console.error('SuperAdmin Auth: Database query error:', error);
          }
          setIsAuthorized(false);
          setUser(null);
          return false;
        }

        if (!adminRecord) {
          console.log('SuperAdmin Auth: No matching admin record found');
          setIsAuthorized(false);
          setUser(null);
          return false;
        }

        // Fifth check: password validation
        if (adminRecord.password !== 'Hd@123@@') {
          console.log('SuperAdmin Auth: Password validation failed');
          setIsAuthorized(false);
          setUser(null);
          return false;
        }

        console.log('SuperAdmin Auth: All validations passed for Helder');
        setIsAuthorized(true);
        setUser(adminRecord);
        return true;

      } catch (dbError) {
        console.error('SuperAdmin Auth: Database connection error:', dbError);
        setIsAuthorized(false);
        setUser(null);
        return false;
      }

    } catch (error) {
      console.error('SuperAdmin Auth: Unexpected error during validation:', error);
      setIsAuthorized(false);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const showUnauthorizedMessage = () => {
    toast({
      title: "Acesso Negado",
      description: "Você não tem permissão para acessar esta área. Apenas o Super Administrador tem acesso.",
      variant: "destructive",
      duration: 5000
    });
  };

  useEffect(() => {
    const validateAccess = async () => {
      const hasAccess = await checkAccess();
      if (!hasAccess) {
        showUnauthorizedMessage();
      }
    };

    validateAccess();

    // Re-validate every 30 seconds for security
    const interval = setInterval(validateAccess, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    isAuthorized,
    isLoading,
    user,
    checkAccess
  };
};
