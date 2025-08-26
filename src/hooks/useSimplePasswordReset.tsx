import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PasswordResetResult {
  success: boolean;
  message: string;
  token?: string;
}

export const useSimplePasswordReset = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Gerar código PIN de 6 dígitos para telefone
  const generatePhoneCode = async (phone: string, userType: 'admin' | 'client'): Promise<PasswordResetResult> => {
    setLoading(true);
    
    try {
      console.log(`🔄 Gerando código PIN para ${userType}:`, phone);
      
      // Verificar se usuário existe
      const table = userType === 'admin' ? 'admin_auth' : 'client_auth';
      const { data: user, error: userError } = await supabase
        .from(table)
        .select('id, name')
        .eq('phone', phone)
        .single();

      if (userError || !user) {
        return {
          success: false,
          message: 'Usuário não encontrado com este telefone'
        };
      }

      // Gerar código de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Salvar token no banco
      const { error: tokenError } = await supabase
        .from('password_reset_tokens')
        .insert({
          user_type: userType,
          identifier: phone,
          token_type: 'phone',
          token_value: code,
          user_id: user.id,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutos
        });

      if (tokenError) {
        console.error('❌ Erro ao salvar token:', tokenError);
        return {
          success: false,
          message: 'Erro interno. Tente novamente.'
        };
      }

      console.log('✅ Código PIN gerado:', code);
      return {
        success: true,
        message: `Código de recuperação gerado para ${user.name}`,
        token: code
      };

    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      return {
        success: false,
        message: 'Erro inesperado. Tente novamente.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Verificar código PIN
  const verifyPhoneCode = async (phone: string, code: string, userType: 'admin' | 'client'): Promise<PasswordResetResult> => {
    setLoading(true);
    
    try {
      console.log(`🔄 Verificando código PIN para ${userType}:`, phone);
      
      // Buscar token válido
      const { data: token, error: tokenError } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('identifier', phone)
        .eq('token_value', code)
        .eq('user_type', userType)
        .eq('token_type', 'phone')
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !token) {
        return {
          success: false,
          message: 'Código inválido ou expirado'
        };
      }

      console.log('✅ Código verificado com sucesso');
      return {
        success: true,
        message: 'Código verificado! Agora defina sua nova senha.',
        token: token.id
      };

    } catch (error) {
      console.error('❌ Erro ao verificar código:', error);
      return {
        success: false,
        message: 'Erro inesperado. Tente novamente.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Enviar reset por email (Supabase nativo)
  const sendEmailReset = async (email: string, userType: 'admin' | 'client'): Promise<PasswordResetResult> => {
    setLoading(true);
    
    try {
      console.log(`🔄 Enviando reset por email para ${userType}:`, email);
      
      // Verificar se usuário existe
      const table = userType === 'admin' ? 'admin_auth' : 'client_auth';
      const { data: user, error: userError } = await supabase
        .from(table)
        .select('id, name')
        .eq('email', email)
        .single();

      if (userError || !user) {
        return {
          success: false,
          message: 'Usuário não encontrado com este email'
        };
      }

      // Usar reset nativo do Supabase
      const redirectTo = `${window.location.origin}/${userType}-reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      });

      if (error) {
        console.error('❌ Erro ao enviar email:', error);
        return {
          success: false,
          message: 'Erro ao enviar email. Tente novamente.'
        };
      }

      console.log('✅ Email de reset enviado');
      return {
        success: true,
        message: 'Email de recuperação enviado! Verifique sua caixa de entrada.'
      };

    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      return {
        success: false,
        message: 'Erro inesperado. Tente novamente.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Redefinir senha com token verificado
  const resetPasswordWithToken = async (tokenId: string, newPassword: string, userType: 'admin' | 'client'): Promise<PasswordResetResult> => {
    setLoading(true);
    
    try {
      console.log(`🔄 Redefinindo senha com token para ${userType}`);
      
      // Buscar token válido
      const { data: token, error: tokenError } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('id', tokenId)
        .eq('user_type', userType)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !token) {
        return {
          success: false,
          message: 'Token inválido ou expirado'
        };
      }

      // Atualizar senha no banco
      const table = userType === 'admin' ? 'admin_auth' : 'client_auth';
      const { error: updateError } = await supabase
        .from(table)
        .update({ 
          password: newPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', token.user_id);

      if (updateError) {
        console.error('❌ Erro ao atualizar senha:', updateError);
        return {
          success: false,
          message: 'Erro ao atualizar senha. Tente novamente.'
        };
      }

      // Marcar token como usado
      await supabase
        .from('password_reset_tokens')
        .update({ is_used: true })
        .eq('id', tokenId);

      console.log('✅ Senha atualizada com sucesso');
      return {
        success: true,
        message: 'Senha atualizada com sucesso!'
      };

    } catch (error) {
      console.error('❌ Erro inesperado:', error);
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
    generatePhoneCode,
    verifyPhoneCode,
    sendEmailReset,
    resetPasswordWithToken
  };
};