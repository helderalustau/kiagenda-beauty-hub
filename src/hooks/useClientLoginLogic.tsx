
import { useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { useAuthData } from '@/hooks/useAuthData';

export const useClientLoginLogic = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { authenticateClient, registerClient, loading } = useAuthData();

  // Check if already logged in as client
  useEffect(() => {
    const clientAuth = localStorage.getItem('clientAuth');
    if (clientAuth) {
      try {
        const userData = JSON.parse(clientAuth);
        if (userData.id && userData.name) {
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
        
        // Store client auth and redirect
        localStorage.setItem('clientAuth', JSON.stringify({
          id: result.client.id,
          name: result.client.name
        }));
        
        navigate('/client-dashboard');
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
            localStorage.setItem('clientAuth', JSON.stringify({
              id: loginResult.client.id,
              name: loginResult.client.name
            }));
            navigate('/client-dashboard');
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
