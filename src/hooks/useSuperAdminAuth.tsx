
import { useState, useEffect, useCallback } from 'react';
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
  const [lastCheck, setLastCheck] = useState<number>(0);
  const { toast } = useToast();

  const AUTHORIZED_SUPER_ADMIN = 'Helder';
  const SUPER_ADMIN_PASSWORD = 'Hd@123@@';
  const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos em vez de 30 segundos

  const logSecurityEvent = async (event: string, details: any) => {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: details.user || 'anonymous',
          action: event,
          table_name: 'admin_auth',
          new_values: details,
          ip_address: null,
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const checkAccess = useCallback(async (): Promise<boolean> => {
    const now = Date.now();
    
    // Evitar verificações muito frequentes (cache por 5 minutos)
    if (now - lastCheck < CHECK_INTERVAL && isAuthorized) {
      return isAuthorized;
    }

    try {
      setIsLoading(true);
      
      // Check localStorage admin auth
      const adminAuth = localStorage.getItem('adminAuth');
      if (!adminAuth) {
        console.log('SuperAdmin Auth: No admin auth found');
        await logSecurityEvent('SUPER_ADMIN_ACCESS_DENIED', { reason: 'No admin auth' });
        setIsAuthorized(false);
        setUser(null);
        setLastCheck(now);
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
        setLastCheck(now);
        return false;
      }

      // Verify name and role
      if (adminData.name !== AUTHORIZED_SUPER_ADMIN || adminData.role !== 'super_admin') {
        console.log(`SuperAdmin Auth: Access denied for user: ${adminData.name}`);
        await logSecurityEvent('SUPER_ADMIN_ACCESS_DENIED', { 
          reason: 'Unauthorized user or invalid role', 
          user: adminData.name,
          role: adminData.role 
        });
        setIsAuthorized(false);
        setUser(null);
        setLastCheck(now);
        return false;
      }

      // Database validation apenas se necessário
      try {
        const { data: adminRecord, error } = await supabase
          .from('admin_auth')
          .select('*')
          .eq('name', AUTHORIZED_SUPER_ADMIN)
          .eq('role', 'super_admin')
          .single();

        if (error || !adminRecord) {
          console.log('SuperAdmin Auth: Database validation failed');
          await logSecurityEvent('SUPER_ADMIN_ACCESS_DENIED', { 
            reason: 'Database validation failed',
            error: error?.message 
          });
          setIsAuthorized(false);
          setUser(null);
          setLastCheck(now);
          return false;
        }

        // Password validation simplificada
        let isPasswordValid = false;
        if (adminRecord.password_hash) {
          const { data: verifyResult } = await supabase.rpc('verify_password', {
            password: SUPER_ADMIN_PASSWORD,
            hash: adminRecord.password_hash
          });
          isPasswordValid = verifyResult;
        } else if (adminRecord.password === SUPER_ADMIN_PASSWORD) {
          isPasswordValid = true;
        }

        if (!isPasswordValid) {
          console.log('SuperAdmin Auth: Password validation failed');
          await logSecurityEvent('SUPER_ADMIN_ACCESS_DENIED', { 
            reason: 'Password validation failed',
            user: AUTHORIZED_SUPER_ADMIN 
          });
          setIsAuthorized(false);
          setUser(null);
          setLastCheck(now);
          return false;
        }

        console.log('SuperAdmin Auth: Access granted');
        await logSecurityEvent('SUPER_ADMIN_ACCESS_GRANTED', { 
          user: AUTHORIZED_SUPER_ADMIN,
          timestamp: new Date().toISOString()
        });
        setIsAuthorized(true);
        setUser(adminRecord);
        setLastCheck(now);
        return true;

      } catch (dbError) {
        console.error('SuperAdmin Auth: Database connection error:', dbError);
        setIsAuthorized(false);
        setUser(null);
        setLastCheck(now);
        return false;
      }

    } catch (error) {
      console.error('SuperAdmin Auth: Unexpected error:', error);
      setIsAuthorized(false);
      setUser(null);
      setLastCheck(now);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorized, lastCheck]);

  const showUnauthorizedMessage = useCallback(() => {
    toast({
      title: "Acesso Negado",
      description: "Você não tem permissão para acessar esta área.",
      variant: "destructive",
      duration: 5000
    });
  }, [toast]);

  useEffect(() => {
    const validateAccess = async () => {
      const hasAccess = await checkAccess();
      if (!hasAccess) {
        showUnauthorizedMessage();
      }
    };

    validateAccess();

    // Verificação menos frequente
    const interval = setInterval(validateAccess, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [checkAccess, showUnauthorizedMessage]);

  return {
    isAuthorized,
    isLoading,
    user,
    checkAccess
  };
};
