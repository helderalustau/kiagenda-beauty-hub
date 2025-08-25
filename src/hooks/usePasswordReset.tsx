import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PasswordResetResult {
  success: boolean;
  message: string;
}

export const usePasswordReset = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendAdminPasswordReset = async (email: string): Promise<PasswordResetResult> => {
    setLoading(true);
    
    try {
      console.log('🔄 Solicitando reset de senha para admin:', email);
      
      // Verificar se o email existe na tabela admin_auth
      const { data: adminData, error: searchError } = await supabase
        .from('admin_auth')
        .select('id, name, email')
        .eq('email', email)
        .single();

      if (searchError || !adminData) {
        console.error('❌ Admin não encontrado:', searchError);
        return {
          success: false,
          message: 'E-mail não encontrado no sistema de administradores'
        };
      }

      // Usar o sistema de auth do Supabase para enviar email de reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin-reset-password`
      });

      if (error) {
        console.error('❌ Erro ao enviar email de reset para admin:', error);
        return {
          success: false,
          message: 'Erro ao enviar email de recuperação'
        };
      }

      console.log('✅ Email de reset enviado para admin:', email);
      return {
        success: true,
        message: 'Email de recuperação enviado com sucesso! Verifique sua caixa de entrada.'
      };

    } catch (error) {
      console.error('❌ Erro inesperado no reset de senha do admin:', error);
      return {
        success: false,
        message: 'Erro inesperado. Tente novamente.'
      };
    } finally {
      setLoading(false);
    }
  };

  const sendClientPasswordReset = async (email: string): Promise<PasswordResetResult> => {
    setLoading(true);
    
    try {
      console.log('🔄 Solicitando reset de senha para cliente:', email);
      
      // Verificar se o email existe na tabela client_auth
      const { data: clientData, error: searchError } = await supabase
        .from('client_auth')
        .select('id, name, email')
        .eq('email', email)
        .single();

      if (searchError || !clientData) {
        console.error('❌ Cliente não encontrado:', searchError);
        return {
          success: false,
          message: 'E-mail não encontrado no sistema de clientes'
        };
      }

      // Usar o sistema de auth do Supabase para enviar email de reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/client-reset-password`
      });

      if (error) {
        console.error('❌ Erro ao enviar email de reset para cliente:', error);
        return {
          success: false,
          message: 'Erro ao enviar email de recuperação'
        };
      }

      console.log('✅ Email de reset enviado para cliente:', email);
      return {
        success: true,
        message: 'Email de recuperação enviado com sucesso! Verifique sua caixa de entrada.'
      };

    } catch (error) {
      console.error('❌ Erro inesperado no reset de senha do cliente:', error);
      return {
        success: false,
        message: 'Erro inesperado. Tente novamente.'
      };
    } finally {
      setLoading(false);
    }
  };

  const updateAdminPassword = async (newPassword: string, token?: string): Promise<PasswordResetResult> => {
    setLoading(true);
    
    try {
      console.log('🔄 Atualizando senha do admin');
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('❌ Erro ao atualizar senha do admin:', error);
        return {
          success: false,
          message: 'Erro ao atualizar senha. Verifique se o link ainda é válido.'
        };
      }

      console.log('✅ Senha do admin atualizada com sucesso');
      return {
        success: true,
        message: 'Senha atualizada com sucesso!'
      };

    } catch (error) {
      console.error('❌ Erro inesperado ao atualizar senha do admin:', error);
      return {
        success: false,
        message: 'Erro inesperado. Tente novamente.'
      };
    } finally {
      setLoading(false);
    }
  };

  const updateClientPassword = async (newPassword: string, token?: string): Promise<PasswordResetResult> => {
    setLoading(true);
    
    try {
      console.log('🔄 Atualizando senha do cliente');
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('❌ Erro ao atualizar senha do cliente:', error);
        return {
          success: false,
          message: 'Erro ao atualizar senha. Verifique se o link ainda é válido.'
        };
      }

      console.log('✅ Senha do cliente atualizada com sucesso');
      return {
        success: true,
        message: 'Senha atualizada com sucesso!'
      };

    } catch (error) {
      console.error('❌ Erro inesperado ao atualizar senha do cliente:', error);
      return {
        success: false,
        message: 'Erro inesperado. Tente novamente.'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    sendAdminPasswordReset,
    sendClientPasswordReset,
    updateAdminPassword,
    updateClientPassword
  };
};