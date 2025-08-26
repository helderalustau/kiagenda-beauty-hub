import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ValidationResult {
  success: boolean;
  message: string;
  userData?: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
}

export const usePasswordResetValidation = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Validar credenciais cruzadas (telefone + email do mesmo usuário)
  const validateUserCredentials = async (
    phone: string, 
    email: string, 
    userType: 'admin' | 'client'
  ): Promise<ValidationResult> => {
    setLoading(true);
    
    try {
      console.log(`🔍 Validando credenciais cruzadas para ${userType}:`, { phone, email });
      
      const table = userType === 'admin' ? 'admin_auth' : 'client_auth';
      
      // Buscar usuário que tenha AMBOS telefone e email corretos
      const { data: user, error: userError } = await supabase
        .from(table)
        .select('id, name, phone, email')
        .eq('phone', phone)
        .eq('email', email)
        .single();

      if (userError || !user) {
        console.log('❌ Credenciais não encontradas ou não coincidem:', userError);
        return {
          success: false,
          message: 'Telefone e email não correspondem ao mesmo usuário cadastrado'
        };
      }

      // Validação adicional de integridade
      if (user.phone !== phone || user.email !== email) {
        console.log('❌ Dados inconsistentes após busca');
        return {
          success: false,
          message: 'Dados inconsistentes. Verifique as informações.'
        };
      }

      console.log('✅ Credenciais validadas para usuário:', user.name);
      return {
        success: true,
        message: `Credenciais validadas para ${user.name}`,
        userData: user
      };

    } catch (error) {
      console.error('❌ Erro na validação:', error);
      return {
        success: false,
        message: 'Erro na validação. Tente novamente.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Validar se telefone pertence ao email informado
  const validatePhoneEmailMatch = async (
    phone: string,
    email: string,
    userType: 'admin' | 'client'
  ): Promise<ValidationResult> => {
    setLoading(true);
    
    try {
      console.log(`🔍 Verificando correspondência telefone-email para ${userType}`);
      
      const table = userType === 'admin' ? 'admin_auth' : 'client_auth';
      
      // Buscar por telefone
      const { data: userByPhone, error: phoneError } = await supabase
        .from(table)
        .select('id, name, phone, email')
        .eq('phone', phone)
        .single();

      if (phoneError || !userByPhone) {
        return {
          success: false,
          message: 'Telefone não encontrado nos registros'
        };
      }

      // Verificar se o email deste usuário confere
      if (userByPhone.email !== email) {
        console.log('❌ Email não confere com o telefone:', userByPhone.email, 'vs', email);
        return {
          success: false,
          message: 'Este telefone não está associado ao email informado'
        };
      }

      console.log('✅ Telefone e email pertencem ao mesmo usuário:', userByPhone.name);
      return {
        success: true,
        message: 'Credenciais confirmadas',
        userData: userByPhone
      };

    } catch (error) {
      console.error('❌ Erro na verificação:', error);
      return {
        success: false,
        message: 'Erro na verificação. Tente novamente.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Validar dados antes de permitir reset
  const validateBeforeReset = async (
    identifier: string,
    identifierType: 'phone' | 'email',
    userType: 'admin' | 'client',
    additionalData?: { phone?: string; email?: string }
  ): Promise<ValidationResult> => {
    setLoading(true);
    
    try {
      console.log(`🔍 Validação completa antes do reset:`, { identifier, identifierType, userType });
      
      const table = userType === 'admin' ? 'admin_auth' : 'client_auth';
      const searchField = identifierType === 'phone' ? 'phone' : 'email';
      
      // Buscar usuário pelo identificador principal
      const { data: user, error: userError } = await supabase
        .from(table)
        .select('id, name, phone, email')
        .eq(searchField, identifier)
        .single();

      if (userError || !user) {
        const fieldName = identifierType === 'phone' ? 'Telefone' : 'Email';
        return {
          success: false,
          message: `${fieldName} não encontrado nos registros`
        };
      }

      // Se dados adicionais foram fornecidos, validar correspondência
      if (additionalData) {
        if (additionalData.phone && user.phone !== additionalData.phone) {
          return {
            success: false,
            message: 'Telefone não corresponde aos dados do usuário'
          };
        }
        
        if (additionalData.email && user.email !== additionalData.email) {
          return {
            success: false,
            message: 'Email não corresponde aos dados do usuário'
          };
        }
      }

      console.log('✅ Validação completa aprovada para:', user.name);
      return {
        success: true,
        message: `Usuário validado: ${user.name}`,
        userData: user
      };

    } catch (error) {
      console.error('❌ Erro na validação completa:', error);
      return {
        success: false,
        message: 'Erro na validação. Tente novamente.'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    validateUserCredentials,
    validatePhoneEmailMatch,
    validateBeforeReset
  };
};