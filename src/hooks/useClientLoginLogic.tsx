
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
        
        // Store complete client auth with all data from client_auth table
        const clientData = {
          id: result.client.id,
          name: result.client.name,
          username: result.client.username,
          phone: result.client.phone,
          email: result.client.email || null,
          fullName: result.client.full_name || null,
          city: result.client.city || null,
          state: result.client.state || null,
          loginTime: new Date().toISOString()
        };
        
        console.log('Storing complete client data:', clientData);
        
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
            
            // Store complete client auth with all data from client_auth table
            const clientData = {
              id: loginResult.client.id,
              name: loginResult.client.name,
              username: loginResult.client.username,
              phone: loginResult.client.phone,
              email: loginResult.client.email || null,
              fullName: loginResult.client.full_name || null,
              city: loginResult.client.city || null,
              state: loginResult.client.state || null,
              loginTime: new Date().toISOString()
            };
            
            console.log('Storing complete client data after registration:', clientData);
            
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
