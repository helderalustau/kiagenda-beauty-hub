
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
      
      // Verificar se existe dados de admin no localStorage
      const adminAuth = localStorage.getItem('adminAuth');
      if (!adminAuth) {
        console.log('SuperAdmin Auth: No admin auth found in localStorage');
        setIsAuthorized(false);
        setUser(null);
        return false;
      }

      const adminData = JSON.parse(adminAuth);
      console.log('SuperAdmin Auth: Checking admin data:', adminData);

      // Primeira verificação: nome deve ser exatamente "Helder"
      if (adminData.name !== AUTHORIZED_SUPER_ADMIN) {
        console.log(`SuperAdmin Auth: Access denied for user: ${adminData.name}`);
        setIsAuthorized(false);
        setUser(null);
        return false;
      }

      // Segunda verificação: consultar banco de dados para validar
      const { data: adminRecord, error } = await supabase
        .from('admin_auth')
        .select('*')
        .eq('name', AUTHORIZED_SUPER_ADMIN)
        .eq('id', adminData.id)
        .single();

      if (error || !adminRecord) {
        console.error('SuperAdmin Auth: Database validation failed:', error);
        setIsAuthorized(false);
        setUser(null);
        return false;
      }

      // Terceira verificação: validar role no banco
      if (adminRecord.role !== 'super_admin') {
        console.log('SuperAdmin Auth: User does not have super_admin role');
        setIsAuthorized(false);
        setUser(null);
        return false;
      }

      // Quarta verificação: validar senha (dupla verificação de segurança)
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

    // Verificar novamente a cada 30 segundos para manter a segurança
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
