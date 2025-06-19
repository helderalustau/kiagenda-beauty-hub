
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
      
      if (salonData) setSalon(salonData);

      // Buscar agendamentos com dados dos clientes e serviços
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`
          *,
          clients(*),
          services(*)
        `)
        .eq('salon_id', salonData?.id || '');
      
      if (appointmentsData) setAppointments(appointmentsData);

      // Buscar serviços
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonData?.id || '')
        .eq('active', true);
      
      if (servicesData) setServices(servicesData);

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
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

  return {
    salon,
    appointments,
    services,
    loading,
    updateAppointmentStatus,
    refreshData: fetchData
  };
};
