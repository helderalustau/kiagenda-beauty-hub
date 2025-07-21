
import { useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { useAuthData } from '@/hooks/useAuthData';
import { useAuth } from '@/hooks/useAuth';

export const useClientLoginLogic = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { authenticateClient, registerClient, loading } = useAuthData();

  // Check if already logged in as client with better validation
  useEffect(() => {
    const clientAuth = localStorage.getItem('clientAuth');
    if (clientAuth) {
      try {
        const userData = JSON.parse(clientAuth);
        // More robust validation
        if (userData.id && userData.name && !userData.role) {
          console.log('Client already authenticated, redirecting to dashboard');
          navigate('/client-dashboard');
        }
      } catch (error) {
        console.error('Error parsing client auth:', error);
        localStorage.removeItem('clientAuth');
      }
    }
  }, [navigate]);

  const handleLogin = async (username: string, password: string) => {
    try {
      console.log('Attempting client login with:', username);
      const result = await authenticateClient(username, password);
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!"
        });
        
        // Clear any admin auth to prevent conflicts
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('selectedSalonId');
        
        // Store client auth with consistent format and update auth context
        const clientData = {
          id: result.client.id,
          name: result.client.name,
          phone: result.client.phone,
          email: result.client.email || null,
          loginTime: new Date().toISOString()
        };
        
        // Update auth context (this will also update localStorage)
        login(clientData);
        
        // Verificar se existe URL de retorno salva
        const returnUrl = localStorage.getItem('returnUrl');
        if (returnUrl) {
          localStorage.removeItem('returnUrl');
          navigate(returnUrl);
        } else {
          navigate('/client-dashboard');
        }
      } else {
        toast({
          title: "Erro de Login",
          description: result.message || "Credenciais inválidas. Verifique seu usuário e senha.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro no login do cliente:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado durante o login",
        variant: "destructive"
      });
    }
  };

  const handleRegister = async (username: string, password: string, phone: string, email: string) => {
    try {
      const result = await registerClient(username, password, phone, email);
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Conta criada com sucesso! Fazendo login automaticamente..."
        });
        
        // Auto login after registration
        setTimeout(async () => {
          const loginResult = await authenticateClient(username, password);
          if (loginResult.success) {
            // Clear any admin auth to prevent conflicts
            localStorage.removeItem('adminAuth');
            localStorage.removeItem('selectedSalonId');
            
            const clientData = {
              id: loginResult.client.id,
              name: loginResult.client.name,
              phone: loginResult.client.phone,
              email: loginResult.client.email || null,
              loginTime: new Date().toISOString()
            };
            
            // Update auth context (this will also update localStorage)
            login(clientData);
            
            // Verificar se existe URL de retorno salva
            const returnUrl = localStorage.getItem('returnUrl');
            if (returnUrl) {
              localStorage.removeItem('returnUrl');
              navigate(returnUrl);
            } else {
              navigate('/client-dashboard');
            }
          }
        }, 1000);
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao criar conta",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado durante o registro",
        variant: "destructive"
      });
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return {
    handleLogin,
    handleRegister,
    handleBackToHome,
    loading
  };
};
