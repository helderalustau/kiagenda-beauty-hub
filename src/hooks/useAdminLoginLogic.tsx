
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { useAuthData } from '@/hooks/useAuthData';
import { useSalonData } from '@/hooks/useSalonData';

export const useAdminLoginLogic = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { authenticateAdmin, loading } = useAuthData();
  const { fetchSalonData, salon } = useSalonData();

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

  const handleSuperAdminAccess = (username: string, password: string) => {
    const AUTHORIZED_SUPER_ADMIN = 'Helder';
    const AUTHORIZED_PASSWORD = 'Hd@123@@';
    
    if (username === AUTHORIZED_SUPER_ADMIN && password === AUTHORIZED_PASSWORD) {
      console.log(`Super Admin access granted to: ${username} at ${new Date().toISOString()}`);
      
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
        navigate('/super-admin-dashboard');
      }, 1500);
      
      return true;
    }
    
    return false;
  };

  const handleLogin = async (formData: { username: string; password: string }) => {
    if (!formData.username.trim()) {
      toast({
        title: "Erro",
        description: "Nome de usuário é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!formData.password.trim()) {
      toast({
        title: "Erro",
        description: "Senha é obrigatória",
        variant: "destructive"
      });
      return;
    }

    // Primeira verificação: Super Admin
    if (handleSuperAdminAccess(formData.username, formData.password)) {
      return;
    }

    // Segunda verificação: Bloquear tentativas não autorizadas de super admin
    if (formData.username === 'Helder' && formData.password !== 'Hd@123@@') {
      toast({
        title: "Acesso Negado",
        description: "Credenciais de Super Admin inválidas. Tentativa registrada.",
        variant: "destructive"
      });
      console.warn(`Unauthorized super admin access attempt from: ${formData.username} at ${new Date().toISOString()}`);
      return;
    }

    // Terceira verificação: Admin regular
    try {
      const result = await authenticateAdmin(formData.username, formData.password);
      
      if (result.success) {
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
          navigate(redirectPath);
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
    navigate('/admin-registration');
  };

  return {
    handleLogin,
    handleCreateAccount,
    loading
  };
};
