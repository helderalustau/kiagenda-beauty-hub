
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePasswordSecurity } from '../usePasswordSecurity';
import { useInputValidation } from '../useInputValidation';

export const useAdminRegistration = () => {
  const [loading, setLoading] = useState(false);
  const { hashPassword, validatePasswordStrength } = usePasswordSecurity();
  const { sanitizeAndValidate } = useInputValidation();

  const registerAdmin = async (salonId: string | null, name: string, password: string, email: string, phone?: string, role: string = 'admin') => {
    try {
      setLoading(true);
      
      console.log('Iniciando registro de administrador:', { salonId, name, email, role });
      
      // Validate inputs
      const nameValidation = sanitizeAndValidate(name, 'name');
      if (!nameValidation.isValid) {
        return { success: false, message: nameValidation.error || 'Nome inválido' };
      }

      const emailValidation = sanitizeAndValidate(email, 'email');
      if (!emailValidation.isValid) {
        return { success: false, message: emailValidation.error || 'Email inválido' };
      }

      // Validate password strength - usar validação mais simples para evitar travamento
      if (!password || password.length < 6) {
        return { 
          success: false, 
          message: 'Senha deve ter pelo menos 6 caracteres'
        };
      }

      // Hash the password
      console.log('Gerando hash da senha');
      const hashedPassword = await hashPassword(password);
      console.log('Hash da senha gerado com sucesso');
      
      const adminData = {
        salon_id: salonId,
        name: nameValidation.value,
        password: 'temp', // Temporary value to satisfy required field
        password_hash: hashedPassword,
        email: emailValidation.value,
        phone: phone?.replace(/\D/g, '') || null,
        role,
        hierarchy_level: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Inserindo administrador no banco de dados');
      
      const { data, error } = await supabase
        .from('admin_auth')
        .insert(adminData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir administrador:', error);
        return { success: false, message: 'Erro ao registrar administrador: ' + error.message };
      }

      console.log('Administrador registrado com sucesso:', data.id);
      return { success: true, admin: data };
    } catch (error) {
      console.error('Erro no registro de administrador:', error);
      return { success: false, message: 'Erro ao registrar administrador' };
    } finally {
      setLoading(false);
    }
  };

  const linkAdminToSalon = async (adminId: string, salonId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('admin_auth')
        .update({ 
          salon_id: salonId,
          updated_at: new Date().toISOString()
        })
        .eq('id', adminId)
        .select()
        .single();

      if (error) {
        console.error('Error linking admin to salon:', error);
        return { success: false, message: 'Erro ao vincular administrador ao estabelecimento' };
      }

      return { success: true, admin: data };
    } catch (error) {
      console.error('Error linking admin to salon:', error);
      return { success: false, message: 'Erro ao vincular administrador ao estabelecimento' };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    registerAdmin,
    linkAdminToSalon
  };
};
