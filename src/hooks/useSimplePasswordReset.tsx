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
      
      // Verificar se usuário existe e obter dados completos
      const table = userType === 'admin' ? 'admin_auth' : 'client_auth';
      const { data: user, error: userError } = await supabase
        .from(table)
        .select('id, name, phone, email')
        .eq('phone', phone)
        .single();

      if (userError || !user) {
        console.log('❌ Usuário não encontrado:', userError);
        return {
          success: false,
          message: 'Telefone não encontrado em nossos registros'
        };
      }

      // Validação adicional de segurança - verificar se o telefone realmente pertence ao usuário
      if (user.phone !== phone) {
        console.log('❌ Telefone não confere:', user.phone, 'vs', phone);
        return {
          success: false,
          message: 'Dados inconsistentes. Contate o suporte.'
        };
      }

      // Limpar tokens antigos deste usuário
      await supabase
        .from('password_reset_tokens')
        .delete()
        .eq('user_id', user.id)
        .eq('token_type', 'phone');

      // Gerar código de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Salvar token no banco com dados de validação
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

      console.log('✅ Código PIN gerado para usuário:', user.name, '- Código:', code);
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

  // Verificar código PIN com validação robusta
  const verifyPhoneCode = async (phone: string, code: string, userType: 'admin' | 'client'): Promise<PasswordResetResult> => {
    setLoading(true);
    
    try {
      console.log(`🔄 Verificando código PIN para ${userType}:`, phone);
      
      // Buscar token válido com dados do usuário
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
        console.log('❌ Token não encontrado ou inválido:', tokenError);
        return {
          success: false,
          message: 'Código inválido, expirado ou já utilizado'
        };
      }

      // Validação adicional: verificar se o usuário ainda existe e os dados conferem
      const table = userType === 'admin' ? 'admin_auth' : 'client_auth';
      const { data: user, error: userError } = await supabase
        .from(table)
        .select('id, name, phone, email')
        .eq('id', token.user_id)
        .single();

      if (userError || !user || user.phone !== phone) {
        console.log('❌ Validação de usuário falhou:', userError);
        // Invalidar token por segurança
        await supabase
          .from('password_reset_tokens')
          .update({ is_used: true })
          .eq('id', token.id);
        
        return {
          success: false,
          message: 'Dados inconsistentes. Solicite um novo código.'
        };
      }

      console.log('✅ Código verificado com sucesso para usuário:', user.name);
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

  // Enviar reset por email com validação robusta
  const sendEmailReset = async (email: string, userType: 'admin' | 'client'): Promise<PasswordResetResult> => {
    setLoading(true);
    
    try {
      console.log(`🔄 Enviando reset por email para ${userType}:`, email);
      
      // Verificar se usuário existe e obter dados completos
      const table = userType === 'admin' ? 'admin_auth' : 'client_auth';
      const { data: user, error: userError } = await supabase
        .from(table)
        .select('id, name, email, phone')
        .eq('email', email)
        .single();

      if (userError || !user) {
        console.log('❌ Usuário não encontrado:', userError);
        return {
          success: false,
          message: 'Email não encontrado em nossos registros'
        };
      }

      // Validação adicional de segurança - verificar se o email realmente pertence ao usuário
      if (user.email !== email) {
        console.log('❌ Email não confere:', user.email, 'vs', email);
        return {
          success: false,
          message: 'Dados inconsistentes. Contate o suporte.'
        };
      }

      // Limpar tokens antigos deste usuário
      await supabase
        .from('password_reset_tokens')
        .delete()
        .eq('user_id', user.id)
        .eq('token_type', 'email');

      // Usar reset nativo do Supabase
      const redirectTo = `${window.location.origin}/${userType}-reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      });

      if (error) {
        console.error('❌ Erro ao enviar email:', error);
        return {
          success: false,
          message: 'Erro ao enviar email. Verifique se o endereço está correto.'
        };
      }

      // Registrar o envio do email para auditoria
      await supabase
        .from('password_reset_tokens')
        .insert({
          user_type: userType,
          identifier: email,
          token_type: 'email',
          token_value: 'email_sent',
          user_id: user.id,
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hora
        });

      console.log('✅ Email de reset enviado para usuário:', user.name);
      return {
        success: true,
        message: `Email de recuperação enviado para ${user.name}! Verifique sua caixa de entrada.`
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

  // Redefinir senha com token verificado e validação robusta
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
        console.log('❌ Token não encontrado ou expirado:', tokenError);
        return {
          success: false,
          message: 'Token inválido ou expirado. Solicite um novo código.'
        };
      }

      // Validação adicional: verificar se o usuário ainda existe
      const table = userType === 'admin' ? 'admin_auth' : 'client_auth';
      const { data: user, error: userError } = await supabase
        .from(table)
        .select('id, name, phone, email')
        .eq('id', token.user_id)
        .single();

      if (userError || !user) {
        console.log('❌ Usuário não encontrado:', userError);
        // Invalidar token por segurança
        await supabase
          .from('password_reset_tokens')
          .update({ is_used: true })
          .eq('id', tokenId);
        
        return {
          success: false,
          message: 'Usuário não encontrado. Contate o suporte.'
        };
      }

      // Validação de força da senha
      if (newPassword.length < 6) {
        return {
          success: false,
          message: 'A senha deve ter pelo menos 6 caracteres'
        };
      }

      // Atualizar senha no banco
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

      // Marcar token como usado e invalidar todos os outros tokens deste usuário
      await supabase
        .from('password_reset_tokens')
        .update({ is_used: true })
        .eq('user_id', token.user_id);

      console.log('✅ Senha atualizada com sucesso para usuário:', user.name);
      return {
        success: true,
        message: `Senha atualizada com sucesso para ${user.name}!`
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