
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface Salon {
  id: string;
  name: string;
  owner_name: string;
  phone: string;
  address: string;
  plan: 'bronze' | 'prata' | 'gold';
  notification_sound: string;
  max_attendants: number;
}

export interface Service {
  id: string;
  salon_id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  active: boolean;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface AdminUser {
  id: string;
  salon_id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'collaborator';
  avatar_url: string;
}

export interface ClientAuth {
  id: string;
  name: string;
  password: string;
  phone: string;
  email: string;
}

export interface AdminAuth {
  id: string;
  salon_id: string;
  name: string;
  password: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'collaborator';
  avatar_url: string;
}

export interface Appointment {
  id: string;
  salon_id: string;
  client_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  clients?: Client;
  services?: Service;
}

export const useSupabaseData = () => {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar dados do salão
      const { data: salonData } = await supabase
        .from('salons')
        .select('*')
        .limit(1)
        .single();
      
      if (salonData) {
        setSalon({
          ...salonData,
          plan: salonData.plan as 'bronze' | 'prata' | 'gold'
        });
      }

      // Buscar agendamentos com dados dos clientes e serviços
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`
          *,
          clients(*),
          services(*)
        `)
        .eq('salon_id', salonData?.id || '');
      
      if (appointmentsData) {
        const typedAppointments = appointmentsData.map(apt => ({
          ...apt,
          status: apt.status as 'pending' | 'confirmed' | 'completed' | 'cancelled'
        }));
        setAppointments(typedAppointments);
      }

      // Buscar serviços
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonData?.id || '')
        .eq('active', true);
      
      if (servicesData) setServices(servicesData);

      // Buscar usuários admin
      const { data: usersData } = await supabase
        .from('admin_auth')
        .select('*')
        .eq('salon_id', salonData?.id || '');
      
      if (usersData) {
        const typedUsers = usersData.map(user => ({
          ...user,
          role: user.role as 'admin' | 'manager' | 'collaborator'
        }));
        setAdminUsers(typedUsers);
      }

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const authenticateClient = async (name: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('client_auth')
        .select('*')
        .eq('name', name)
        .eq('password', password)
        .single();
      
      if (error || !data) {
        return { success: false, message: 'Credenciais inválidas' };
      }
      
      return { success: true, user: data };
    } catch (error) {
      return { success: false, message: 'Erro no login' };
    }
  };

  const authenticateAdmin = async (name: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_auth')
        .select('*')
        .eq('name', name)
        .eq('password', password)
        .single();
      
      if (error || !data) {
        return { success: false, message: 'Credenciais inválidas' };
      }
      
      return { success: true, user: data };
    } catch (error) {
      return { success: false, message: 'Erro no login' };
    }
  };

  const registerClient = async (name: string, password: string, phone: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('client_auth')
        .insert({ name, password, phone, email })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          return { success: false, message: 'Nome já está em uso' };
        }
        return { success: false, message: 'Erro ao criar conta' };
      }
      
      return { success: true, user: data };
    } catch (error) {
      return { success: false, message: 'Erro ao criar conta' };
    }
  };

  const registerAdmin = async (salonId: string, name: string, password: string, email: string, phone?: string, role: 'admin' | 'manager' | 'collaborator' = 'admin') => {
    try {
      // Verificar limite de atendentes
      if (salon) {
        const currentCount = adminUsers.length;
        if (currentCount >= salon.max_attendants) {
          return { 
            success: false, 
            message: `Limite de ${salon.max_attendants} atendente(s) atingido. Faça upgrade do plano.`,
            needsUpgrade: true 
          };
        }
      }

      const { data, error } = await supabase
        .from('admin_auth')
        .insert({ salon_id: salonId, name, password, email, phone, role })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          return { success: false, message: 'Nome já está em uso' };
        }
        return { success: false, message: 'Erro ao criar conta' };
      }
      
      fetchData(); // Recarregar dados
      return { success: true, user: data };
    } catch (error) {
      return { success: false, message: 'Erro ao criar conta' };
    }
  };

  const updateAppointmentStatus = async (id: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status, notes, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (!error) {
        fetchData(); // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
    }
  };

  const updateSalon = async (salonData: Partial<Salon>) => {
    try {
      const { error } = await supabase
        .from('salons')
        .update(salonData)
        .eq('id', salon?.id || '');
      
      if (!error) {
        fetchData(); // Recarregar dados
        return { success: true };
      }
      return { success: false, message: 'Erro ao salvar alterações' };
    } catch (error) {
      return { success: false, message: 'Erro ao salvar alterações' };
    }
  };

  const updateAdminUser = async (userId: string, userData: Partial<AdminAuth>) => {
    try {
      const { error } = await supabase
        .from('admin_auth')
        .update(userData)
        .eq('id', userId);
      
      if (!error) {
        fetchData(); // Recarregar dados
        return { success: true };
      }
      return { success: false, message: 'Erro ao salvar alterações' };
    } catch (error) {
      return { success: false, message: 'Erro ao salvar alterações' };
    }
  };

  const deleteAdminUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('admin_auth')
        .delete()
        .eq('id', userId);
      
      if (!error) {
        fetchData(); // Recarregar dados
        return { success: true };
      }
      return { success: false, message: 'Erro ao excluir usuário' };
    } catch (error) {
      return { success: false, message: 'Erro ao excluir usuário' };
    }
  };

  const createAppointment = async (appointmentData: {
    salon_id: string;
    client_id: string;
    service_id: string;
    appointment_date: string;
    appointment_time: string;
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();
      
      if (!error) {
        fetchData(); // Recarregar dados
        return { success: true, appointment: data };
      }
      return { success: false, message: 'Erro ao criar agendamento' };
    } catch (error) {
      return { success: false, message: 'Erro ao criar agendamento' };
    }
  };

  return {
    salon,
    appointments,
    services,
    adminUsers,
    loading,
    authenticateClient,
    authenticateAdmin,
    registerClient,
    registerAdmin,
    updateAppointmentStatus,
    updateSalon,
    updateAdminUser,
    deleteAdminUser,
    createAppointment,
    refreshData: fetchData
  };
};
