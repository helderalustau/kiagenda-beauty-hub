
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
  const SUPER_ADMIN_PASSWORD = 'Hd@123@@'; // This should be moved to environment variables in production

  const logSecurityEvent = async (event: string, details: any) => {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: details.user || 'anonymous',
          action: event,
          table_name: 'admin_auth',
          new_values: details,
          ip_address: null, // Could be enhanced to capture real IP
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const checkAccess = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Check localStorage admin auth
      const adminAuth = localStorage.getItem('adminAuth');
      if (!adminAuth) {
        console.log('SuperAdmin Auth: No admin auth found');
        await logSecurityEvent('SUPER_ADMIN_ACCESS_DENIED', { reason: 'No admin auth' });
        setIsAuthorized(false);
        setUser(null);
        return false;
      }

      let adminData;
      try {
        adminData = JSON.parse(adminAuth);
      } catch (parseError) {
        console.error('SuperAdmin Auth: Invalid admin data format');
        await logSecurityEvent('SUPER_ADMIN_ACCESS_DENIED', { reason: 'Invalid admin data format' });
        setIsAuthorized(false);
        setUser(null);
        return false;
      }

      console.log('SuperAdmin Auth: Checking admin data:', adminData.name);

      // Verify name
      if (adminData.name !== AUTHORIZED_SUPER_ADMIN) {
        console.log(`SuperAdmin Auth: Access denied for user: ${adminData.name}`);
        await logSecurityEvent('SUPER_ADMIN_ACCESS_DENIED', { 
          reason: 'Unauthorized user', 
          user: adminData.name 
        });
        setIsAuthorized(false);
        setUser(null);
        return false;
      }

      // Verify role
      if (adminData.role !== 'super_admin') {
        console.log('SuperAdmin Auth: User does not have super_admin role');
        await logSecurityEvent('SUPER_ADMIN_ACCESS_DENIED', { 
          reason: 'Invalid role', 
          user: adminData.name,
          role: adminData.role 
        });
        setIsAuthorized(false);
        setUser(null);
        return false;
      }

      // Database validation with secure password check
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
          await logSecurityEvent('SUPER_ADMIN_ACCESS_DENIED', { 
            reason: 'Database validation failed',
            error: error.message 
          });
          setIsAuthorized(false);
          setUser(null);
          return false;
        }

        if (!adminRecord) {
          console.log('SuperAdmin Auth: No matching admin record found');
          await logSecurityEvent('SUPER_ADMIN_ACCESS_DENIED', { reason: 'No matching admin record' });
          setIsAuthorized(false);
          setUser(null);
          return false;
        }

        // Enhanced password validation - check both hash and plaintext during migration
        let isPasswordValid = false;
        if (adminRecord.password_hash) {
          // Use secure hash verification
          const { data: verifyResult } = await supabase.rpc('verify_password', {
            password: SUPER_ADMIN_PASSWORD,
            hash: adminRecord.password_hash
          });
          isPasswordValid = verifyResult;
        } else if (adminRecord.password === SUPER_ADMIN_PASSWORD) {
          // Fallback for migration period
          isPasswordValid = true;
          // Hash the password for future use
          const { data: hashedPassword } = await supabase.rpc('hash_password', {
            password: SUPER_ADMIN_PASSWORD
          });
          if (hashedPassword) {
            await supabase
              .from('admin_auth')
              .update({ password_hash: hashedPassword })
              .eq('id', adminRecord.id);
          }
        }

        if (!isPasswordValid) {
          console.log('SuperAdmin Auth: Password validation failed');
          await logSecurityEvent('SUPER_ADMIN_ACCESS_DENIED', { 
            reason: 'Password validation failed',
            user: AUTHORIZED_SUPER_ADMIN 
          });
          setIsAuthorized(false);
          setUser(null);
          return false;
        }

        console.log('SuperAdmin Auth: All validations passed for Helder');
        await logSecurityEvent('SUPER_ADMIN_ACCESS_GRANTED', { 
          user: AUTHORIZED_SUPER_ADMIN,
          timestamp: new Date().toISOString()
        });
        setIsAuthorized(true);
        setUser(adminRecord);
        return true;

      } catch (dbError) {
        console.error('SuperAdmin Auth: Database connection error:', dbError);
        await logSecurityEvent('SUPER_ADMIN_ACCESS_ERROR', { 
          reason: 'Database connection error',
          error: dbError instanceof Error ? dbError.message : 'Unknown error'
        });
        setIsAuthorized(false);
        setUser(null);
        return false;
      }

    } catch (error) {
      console.error('SuperAdmin Auth: Unexpected error during validation:', error);
      await logSecurityEvent('SUPER_ADMIN_ACCESS_ERROR', { 
        reason: 'Unexpected error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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

    // Enhanced security: re-validate every 30 seconds
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
