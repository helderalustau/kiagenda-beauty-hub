
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export const useAdminLoginLogic = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const password = formData.get('password') as string;

    try {
      console.log('Tentativa de login:', { name });

      // Buscar administrador no banco de dados
      const { data: adminData, error } = await supabase
        .from('admin_auth')
        .select(`
          id,
          name,
          email,
          role,
          salon_id,
          password,
          password_hash,
          salons!inner(
            id,
            name,
            setup_completed,
            admin_setup_completed
          )
        `)
        .eq('name', name)
        .single();

      if (error || !adminData) {
        console.error('Erro ao buscar administrador:', error);
        toast({
          title: "Erro de Login",
          description: "Usuário não encontrado",
          variant: "destructive"
        });
        return;
      }

      console.log('Administrador encontrado:', adminData);

      // Verificar senha - aceitar tanto hash quanto texto plano
      let isPasswordValid = false;
      
      // Se tem hash, verificar com hash
      if (adminData.password_hash) {
        try {
          const { data: hashResult } = await supabase.rpc('verify_password', {
            password: password,
            hash: adminData.password_hash
          });
          isPasswordValid = hashResult;
        } catch (hashError) {
          console.log('Erro na verificação de hash, tentando senha plana:', hashError);
          // Fallback para senha plana se a verificação de hash falhar
          isPasswordValid = adminData.password === password;
        }
      } else {
        // Verificar senha plana
        isPasswordValid = adminData.password === password;
      }

      if (!isPasswordValid) {
        console.log('Senha incorreta');
        toast({
          title: "Erro de Login",
          description: "Senha incorreta",
          variant: "destructive"
        });
        return;
      }

      // Criar dados do usuário para login
      const userData = {
        id: adminData.id,
        name: adminData.name,
        email: adminData.email,
        role: adminData.role,
        salon_id: adminData.salon_id,
        isFirstAccess: false,
        loginTime: new Date().toISOString()
      };

      // Fazer login
      login(userData);
      localStorage.setItem('adminAuth', JSON.stringify(userData));
      
      if (adminData.salon_id) {
        localStorage.setItem('selectedSalonId', adminData.salon_id);
      }

      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${adminData.name}!`
      });

      // Determinar redirecionamento baseado na configuração do estabelecimento
      const salon = adminData.salons;
      
      // Se o estabelecimento não está configurado, ir para setup
      if (!salon || salon.setup_completed !== true || salon.admin_setup_completed !== true) {
        console.log('Redirecionando para configuração do estabelecimento');
        navigate('/salon-setup');
      } else {
        console.log('Redirecionando para admin dashboard - estabelecimento configurado');
        navigate('/admin-dashboard');
      }

    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro interno",
        description: "Erro ao fazer login. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
