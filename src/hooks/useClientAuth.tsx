
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePasswordSecurity } from './usePasswordSecurity';
import { useInputValidation } from './useInputValidation';
import { formatPhone, unformatPhone } from '@/utils/phoneFormatter';

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

      // Get client record with password hash using username
      const { data: clientRecord, error: fetchError } = await supabase
        .from('client_auth')
        .select('*')
        .eq('username', usernameValidation.value)
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

      // Store complete client data in localStorage
      localStorage.setItem('clientAuth', JSON.stringify({
        id: clientRecord.id,
        name: clientRecord.name,
        username: clientRecord.username,
        phone: formatPhone(clientRecord.phone || ''),
        email: clientRecord.email,
        fullName: clientRecord.full_name,
        city: clientRecord.city,
        state: clientRecord.state,
        address: clientRecord.address || clientRecord.street_address,
        houseNumber: clientRecord.house_number,
        neighborhood: clientRecord.neighborhood,
        zipCode: clientRecord.zip_code
      }));
      
      return { success: true, client: clientRecord };
    } catch (error) {
      console.error('Error during client authentication:', error);
      return { success: false, message: 'Erro durante a autenticação' };
    } finally {
      setLoading(false);
    }
  };

  // Validate Brazilian phone number (10 or 11 digits)
  const validateBrazilianPhone = (phone: string): boolean => {
    const digits = unformatPhone(phone);
    return digits.length >= 10 && digits.length <= 11;
  };

  // Register client with secure password hashing and phone formatting
  const registerClient = async (username: string, password: string, phone: string, email?: string) => {
    try {
      setLoading(true);
      
      // Validate inputs
      const usernameValidation = sanitizeAndValidate(username, 'name');
      if (!usernameValidation.isValid) {
        return { success: false, message: usernameValidation.error || 'Nome de usuário inválido' };
      }

      // Format phone to only digits for storage
      const formattedPhone = unformatPhone(phone);
      
      // Validate phone
      if (!validateBrazilianPhone(phone)) {
        return { success: false, message: 'Telefone deve ter 10 ou 11 dígitos' };
      }

      // Check if username already exists
      const { data: existingClient, error: checkError } = await supabase
        .from('client_auth')
        .select('id')
        .eq('username', usernameValidation.value)
        .single();

      if (existingClient) {
        return { success: false, message: 'Este nome de usuário já está em uso' };
      }

      // Check if phone already exists
      const { data: existingPhone, error: phoneCheckError } = await supabase
        .from('client_auth')
        .select('id')
        .eq('phone', formattedPhone)
        .single();

      if (existingPhone) {
        return { success: false, message: 'Este telefone já está cadastrado' };
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
          username: usernameValidation.value,
          name: usernameValidation.value, // Manter compatibilidade
          password: 'temp', // Temporary value to satisfy required field
          password_hash: hashedPassword,
          phone: formattedPhone, // Store only digits
          email: email ? sanitizeAndValidate(email, 'email').value : null
        })
        .select()
        .single();

      if (error) {
        console.error('Error registering client:', error);
        if (error.code === '23505') { // Unique constraint violation
          return { success: false, message: 'Este nome de usuário ou telefone já está cadastrado' };
        }
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
