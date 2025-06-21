
import { useToast } from "@/components/ui/use-toast";
import { useAuthData } from '@/hooks/useAuthData';
import { useSalonData } from '@/hooks/useSalonData';
import { useSecureNavigation } from '@/hooks/useSecureNavigation';
import { useInputValidation } from '@/hooks/useInputValidation';

export const useAdminLoginLogic = () => {
  const { toast } = useToast();
  const { secureNavigate } = useSecureNavigation();
  const { authenticateAdmin, loading } = useAuthData();
  const { fetchSalonData, salon } = useSalonData();
  const { sanitizeAndValidate, validateUrl } = useInputValidation();

  const checkSalonConfiguration = async (salonId: string) => {
    try {
      await fetchSalonData(salonId);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (salon && salon.admin_setup_completed === true) {
        return '/admin-dashboard';
      } else {
        return '/salon-setup';
      }
    } catch (error) {
      console.error('Erro ao verificar configuração do estabelecimento:', error);
      return '/salon-setup';
    }
  };

  const handleSuperAdminAccess = async (username: string, password: string) => {
    const AUTHORIZED_SUPER_ADMIN = 'Helder';
    const AUTHORIZED_PASSWORD = 'Hd@123@@';
    
    // Validate inputs
    const usernameValidation = sanitizeAndValidate(username, 'name');
    if (!usernameValidation.isValid) {
      return false;
    }
    
    if (usernameValidation.value === AUTHORIZED_SUPER_ADMIN && password === AUTHORIZED_PASSWORD) {
      console.log(`Super Admin access granted to: ${username} at ${new Date().toISOString()}`);
      
      // Log security event
      try {
        // In a real implementation, this would log to the audit system
        console.log('SUPER_ADMIN_LOGIN', {
          user: username,
          timestamp: new Date().toISOString(),
          ip: 'N/A', // Could be enhanced
          userAgent: navigator.userAgent
        });
      } catch (error) {
        console.error('Failed to log super admin access:', error);
      }
      
      localStorage.setItem('adminAuth', JSON.stringify({
        id: 'super-admin-helder',
        name: username,
        role: 'super_admin',
        isFirstAccess: false,
        accessLevel: 'MAXIMUM',
        loginTime: new Date().toISOString()
      }));
      
      toast({
        title: "Sucesso",
        description: "Login de Super Admin realizado com sucesso!"
      });
      
      setTimeout(() => {
        secureNavigate('/super-admin-dashboard');
      }, 1500);
      
      return true;
    }
    
    return false;
  };

  const handleLogin = async (formData: { username: string; password: string }) => {
    // Validate inputs
    const usernameValidation = sanitizeAndValidate(formData.username, 'name');
    if (!usernameValidation.isValid) {
      toast({
        title: "Erro",
        description: usernameValidation.error || "Nome de usuário inválido",
        variant: "destructive"
      });
      return;
    }

    if (!formData.password.trim() || formData.password.length < 6) {
      toast({
        title: "Erro",
        description: "Senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    // Check for super admin access first
    if (await handleSuperAdminAccess(usernameValidation.value, formData.password)) {
      return;
    }

    // Block unauthorized super admin attempts
    if (usernameValidation.value === 'Helder' && formData.password !== 'Hd@123@@') {
      toast({
        title: "Acesso Negado",
        description: "Credenciais de Super Admin inválidas. Tentativa registrada.",
        variant: "destructive"
      });
      console.warn(`Unauthorized super admin access attempt from: ${usernameValidation.value} at ${new Date().toISOString()}`);
      return;
    }

    // Regular admin authentication
    try {
      const result = await authenticateAdmin(usernameValidation.value, formData.password);
      
      if (result.success) {
        // Security check for inconsistent accounts
        if (result.admin.role === 'super_admin' && result.admin.name !== 'Helder') {
          toast({
            title: "Erro de Segurança",
            description: "Conta inconsistente detectada. Contate o administrador.",
            variant: "destructive"
          });
          console.error(`Security violation: Non-Helder user with super_admin role: ${result.admin.name}`);
          return;
        }

        localStorage.setItem('adminAuth', JSON.stringify({
          ...result.admin,
          isFirstAccess: false
        }));
        localStorage.setItem('selectedSalonId', result.admin.salon_id);
        
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!"
        });
        
        const redirectPath = await checkSalonConfiguration(result.admin.salon_id);
        
        setTimeout(() => {
          secureNavigate(redirectPath);
        }, 1500);
      } else {
        toast({
          title: "Erro",
          description: result.message || "Credenciais inválidas. Verifique seu usuário e senha.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado durante o login",
        variant: "destructive"
      });
    }
  };

  const handleCreateAccount = () => {
    secureNavigate('/admin-registration');
  };

  return {
    handleLogin,
    handleCreateAccount,
    loading
  };
};
