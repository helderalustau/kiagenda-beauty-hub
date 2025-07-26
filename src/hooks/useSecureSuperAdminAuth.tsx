
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface SecureSuperAdminAuthResult {
  isAuthorized: boolean;
  isLoading: boolean;
  user: any | null;
  authenticate: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

export const useSecureSuperAdminAuth = (): SecureSuperAdminAuthResult => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const { toast } = useToast();

  const logAuthAttempt = async (username: string, success: boolean, userType: string = 'super_admin') => {
    try {
      await supabase
        .from('auth_attempts')
        .insert({
          username,
          user_type: userType,
          success,
          ip_address: null, // Client-side can't get real IP
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log auth attempt:', error);
    }
  };

  const logSecurityEvent = async (event: string, details: any) => {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: details.user || 'anonymous',
          action: event,
          table_name: 'super_admin_auth',
          new_values: details,
          ip_address: null,
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const authenticate = useCallback(async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      
      // Input validation
      if (!username?.trim() || !password?.trim()) {
        await logAuthAttempt(username, false);
        return { success: false, message: 'Usuário e senha são obrigatórios' };
      }

      // Rate limiting check - simple client-side implementation
      const lastAttemptKey = `lastSuperAdminAttempt_${username}`;
      const lastAttempt = localStorage.getItem(lastAttemptKey);
      if (lastAttempt && Date.now() - parseInt(lastAttempt) < 5000) {
        return { success: false, message: 'Aguarde 5 segundos antes de tentar novamente' };
      }

      localStorage.setItem(lastAttemptKey, Date.now().toString());

      // Check against secure credentials table
      const { data: configData, error: configError } = await supabase
        .from('super_admin_config')
        .select('*')
        .eq('authorized_username', username)
        .single();

      if (configError || !configData) {
        console.error('Super admin config not found:', configError);
        await logAuthAttempt(username, false);
        await logSecurityEvent('SUPER_ADMIN_ACCESS_DENIED', { 
          reason: 'User not found in config',
          username 
        });
        return { success: false, message: 'Credenciais inválidas' };
      }

      // Verify password using database function
      const { data: passwordValid, error: passwordError } = await supabase
        .rpc('verify_password', {
          password: password,
          hash: configData.password_hash
        });

      if (passwordError || !passwordValid) {
        await logAuthAttempt(username, false);
        await logSecurityEvent('SUPER_ADMIN_ACCESS_DENIED', { 
          reason: 'Invalid password',
          username 
        });
        return { success: false, message: 'Credenciais inválidas' };
      }

      // Get admin record for additional data
      const { data: adminRecord, error: adminError } = await supabase
        .from('admin_auth')
        .select('*')
        .eq('name', username)
        .eq('role', 'super_admin')
        .single();

      if (adminError || !adminRecord) {
        await logAuthAttempt(username, false);
        await logSecurityEvent('SUPER_ADMIN_ACCESS_DENIED', { 
          reason: 'Admin record not found',
          username 
        });
        return { success: false, message: 'Acesso não autorizado' };
      }

      // Success - create secure session
      const sessionData = {
        id: adminRecord.id,
        name: adminRecord.name,
        role: adminRecord.role,
        sessionStart: new Date().toISOString(),
        isSecure: true
      };

      // Store session with expiration (2 hours)
      const sessionExpiry = Date.now() + (2 * 60 * 60 * 1000);
      localStorage.setItem('secSuperAdminAuth', JSON.stringify({
        ...sessionData,
        expires: sessionExpiry
      }));

      setIsAuthorized(true);
      setUser(sessionData);

      await logAuthAttempt(username, true);
      await logSecurityEvent('SUPER_ADMIN_ACCESS_GRANTED', { 
        username,
        sessionId: adminRecord.id,
        timestamp: new Date().toISOString()
      });

      return { success: true };

    } catch (error) {
      console.error('Authentication error:', error);
      await logAuthAttempt(username, false);
      return { success: false, message: 'Erro interno do sistema' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('secSuperAdminAuth');
    setIsAuthorized(false);
    setUser(null);
    
    toast({
      title: "Sessão Encerrada",
      description: "Você foi desconectado com segurança."
    });
  }, [toast]);

  const validateSession = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const storedAuth = localStorage.getItem('secSuperAdminAuth');
      if (!storedAuth) {
        setIsAuthorized(false);
        setUser(null);
        return;
      }

      const sessionData = JSON.parse(storedAuth);
      
      // Check session expiration
      if (Date.now() > sessionData.expires) {
        localStorage.removeItem('secSuperAdminAuth');
        setIsAuthorized(false);
        setUser(null);
        toast({
          title: "Sessão Expirada",
          description: "Sua sessão expirou por segurança. Faça login novamente.",
          variant: "destructive"
        });
        return;
      }

      // Validate against database
      const { data: adminRecord, error } = await supabase
        .from('admin_auth')
        .select('*')
        .eq('id', sessionData.id)
        .eq('name', sessionData.name)
        .eq('role', 'super_admin')
        .single();

      if (error || !adminRecord) {
        localStorage.removeItem('secSuperAdminAuth');
        setIsAuthorized(false);
        setUser(null);
        await logSecurityEvent('SUPER_ADMIN_SESSION_INVALID', { 
          reason: 'Database validation failed',
          sessionId: sessionData.id 
        });
        return;
      }

      setIsAuthorized(true);
      setUser(sessionData);

    } catch (error) {
      console.error('Session validation error:', error);
      localStorage.removeItem('secSuperAdminAuth');
      setIsAuthorized(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    validateSession();
    
    // Validate session every 5 minutes
    const interval = setInterval(validateSession, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [validateSession]);

  return {
    isAuthorized,
    isLoading,
    user,
    authenticate,
    logout
  };
};
