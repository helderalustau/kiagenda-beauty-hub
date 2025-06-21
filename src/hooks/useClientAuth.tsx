
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePasswordSecurity } from './usePasswordSecurity';
import { useInputValidation } from './useInputValidation';

export const useClientAuth = () => {
  const [loading, setLoading] = useState(false);
  const { verifyPassword, hashPassword, validatePasswordStrength } = usePasswordSecurity();
  const { sanitizeAndValidate } = useInputValidation();

  // Authenticate client with secure password verification
  const authenticateClient = async (username: string, password: string) => {
    try {
      setLoading(true);
      
      // Validate and sanitize inputs
      const usernameValidation = sanitizeAndValidate(username, 'name');
      if (!usernameValidation.isValid) {
        return { success: false, message: usernameValidation.error || 'Nome de usuário inválido' };
      }

      if (!password || password.length < 6) {
        return { success: false, message: 'Senha deve ter pelo menos 6 caracteres' };
      }

      // Get client record with password hash
      const { data: clientRecord, error: fetchError } = await supabase
        .from('client_auth')
        .select('*')
        .eq('name', usernameValidation.value)
        .single();

      if (fetchError || !clientRecord) {
        console.error('Client authentication error:', fetchError);
        return { success: false, message: 'Credenciais inválidas' };
      }

      // Verify password using hash if available, fallback to plaintext for migration
      let isPasswordValid = false;
      if (clientRecord.password_hash) {
        isPasswordValid = await verifyPassword(password, clientRecord.password_hash);
      } else if (clientRecord.password) {
        // Fallback for migration period
        isPasswordValid = clientRecord.password === password;
        if (isPasswordValid) {
          const hashedPassword = await hashPassword(password);
          await supabase
            .from('client_auth')
            .update({ password_hash: hashedPassword })
            .eq('id', clientRecord.id);
        }
      }

      if (!isPasswordValid) {
        return { success: false, message: 'Credenciais inválidas' };
      }

      localStorage.setItem('clientAuth', JSON.stringify({
        id: clientRecord.id,
        name: clientRecord.name
      }));
      
      return { success: true, client: clientRecord };
    } catch (error) {
      console.error('Error during client authentication:', error);
      return { success: false, message: 'Erro durante a autenticação' };
    } finally {
      setLoading(false);
    }
  };

  // Register client with secure password hashing
  const registerClient = async (name: string, password: string, phone: string, email?: string) => {
    try {
      setLoading(true);
      
      // Validate inputs
      const nameValidation = sanitizeAndValidate(name, 'name');
      if (!nameValidation.isValid) {
        return { success: false, message: nameValidation.error || 'Nome inválido' };
      }

      const phoneValidation = sanitizeAndValidate(phone, 'phone');
      if (!phoneValidation.isValid) {
        return { success: false, message: phoneValidation.error || 'Telefone inválido' };
      }

      // Validate email if provided
      if (email) {
        const emailValidation = sanitizeAndValidate(email, 'email');
        if (!emailValidation.isValid) {
          return { success: false, message: emailValidation.error || 'Email inválido' };
        }
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return { 
          success: false, 
          message: `Senha não atende aos requisitos: ${passwordValidation.errors.join(', ')}`
        };
      }

      // Hash the password
      const hashedPassword = await hashPassword(password);
      
      const { data, error } = await supabase
        .from('client_auth')
        .insert({
          name: nameValidation.value,
          password: 'temp', // Temporary value to satisfy required field
          password_hash: hashedPassword,
          phone: phoneValidation.value,
          email: email ? sanitizeAndValidate(email, 'email').value : null
        })
        .select()
        .single();

      if (error) {
        console.error('Error registering client:', error);
        return { success: false, message: 'Erro ao registrar cliente' };
      }

      return { success: true, client: data };
    } catch (error) {
      console.error('Error registering client:', error);
      return { success: false, message: 'Erro ao registrar cliente' };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    authenticateClient,
    registerClient
  };
};
