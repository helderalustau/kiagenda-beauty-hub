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

  const sendAdminPasswordResetEmail = async (email: string): Promise<PasswordResetResult> => {
    setLoading(true);
    
    try {
      console.log('🔄 Enviando reset de senha por email para admin:', email);
      
      const { data, error } = await supabase.functions.invoke('send-password-reset-email', {
        body: { email, userType: 'admin' }
      });

      if (error) {
        console.error('❌ Erro ao enviar email de reset para admin:', error);
        return {
          success: false,
          message: 'Erro ao enviar email de recuperação'
        };
      }

      if (!data.success) {
        return {
          success: false,
          message: data.message
        };
      }

      console.log('✅ Email de reset enviado para admin:', email);
      return {
        success: true,
        message: data.message
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

  const sendAdminPasswordResetSMS = async (phone: string): Promise<PasswordResetResult> => {
    setLoading(true);
    
    try {
      console.log('🔄 Enviando reset de senha por SMS para admin:', phone);
      
      const { data, error } = await supabase.functions.invoke('send-password-reset-sms', {
        body: { phone, userType: 'admin' }
      });

      if (error) {
        console.error('❌ Erro ao enviar SMS de reset para admin:', error);
        return {
          success: false,
          message: 'Erro ao enviar SMS de recuperação'
        };
      }

      if (!data.success) {
        return {
          success: false,
          message: data.message
        };
      }

      console.log('✅ SMS de reset enviado para admin:', phone);
      return {
        success: true,
        message: data.message
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

  const sendClientPasswordResetEmail = async (email: string): Promise<PasswordResetResult> => {
    setLoading(true);
    
    try {
      console.log('🔄 Enviando reset de senha por email para cliente:', email);
      
      const { data, error } = await supabase.functions.invoke('send-password-reset-email', {
        body: { email, userType: 'client' }
      });

      if (error) {
        console.error('❌ Erro ao enviar email de reset para cliente:', error);
        return {
          success: false,
          message: 'Erro ao enviar email de recuperação'
        };
      }

      if (!data.success) {
        return {
          success: false,
          message: data.message
        };
      }

      console.log('✅ Email de reset enviado para cliente:', email);
      return {
        success: true,
        message: data.message
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

  const sendClientPasswordResetSMS = async (phone: string): Promise<PasswordResetResult> => {
    setLoading(true);
    
    try {
      console.log('🔄 Enviando reset de senha por SMS para cliente:', phone);
      
      const { data, error } = await supabase.functions.invoke('send-password-reset-sms', {
        body: { phone, userType: 'client' }
      });

      if (error) {
        console.error('❌ Erro ao enviar SMS de reset para cliente:', error);
        return {
          success: false,
          message: 'Erro ao enviar SMS de recuperação'
        };
      }

      if (!data.success) {
        return {
          success: false,
          message: data.message
        };
      }

      console.log('✅ SMS de reset enviado para cliente:', phone);
      return {
        success: true,
        message: data.message
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

  // Manter funções originais para compatibilidade (deprecadas)
  const sendAdminPasswordReset = sendAdminPasswordResetEmail;
  const sendClientPasswordReset = sendClientPasswordResetEmail;

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
    // Novas funções específicas
    sendAdminPasswordResetEmail,
    sendAdminPasswordResetSMS,
    sendClientPasswordResetEmail,
    sendClientPasswordResetSMS,
    // Funções originais (para compatibilidade)
    sendAdminPasswordReset,
    sendClientPasswordReset,
    updateAdminPassword,
    updateClientPassword
  };
};