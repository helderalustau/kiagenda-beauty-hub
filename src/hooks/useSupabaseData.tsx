
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

export interface Salon {
  id: string;
  name: string;
  owner_name: string;
  phone: string;
  address: string;
  plan: 'bronze' | 'prata' | 'gold';
  notification_sound?: string;
  street_number?: string;
  city?: string;
  state?: string;
  contact_phone?: string;
  opening_hours?: any;
  is_open?: boolean;
  setup_completed?: boolean;
  banner_image_url?: string;
}

export interface Service {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  active: boolean;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface Appointment {
  id: string;
  salon_id: string;
  client_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes?: string;
  client?: Client;
  service?: Service;
}

export interface AdminUser {
  id: string;
  salon_id?: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  avatar_url?: string;
}

export interface PresetService {
  id: string;
  category: string;
  name: string;
  description?: string;
  default_duration_minutes: number;
}

export interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
}

export const useSupabaseData = () => {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [presetServices, setPresetServices] = useState<PresetService[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  // Authenticate admin user
  const authenticateAdmin = async (username: string, password: string) => {
    try {
      setLoading(true);
      
      // Set up a temporary session for authentication check
      const { data, error } = await supabase
        .from('admin_auth')
        .select('*')
        .eq('name', username)
        .eq('password', password)
        .single();

      if (error) {
        console.error('Authentication error:', error);
        return { success: false, message: 'Credenciais inválidas' };
      }

      if (data) {
        // Store admin session info
        localStorage.setItem('adminAuth', JSON.stringify({
          id: data.id,
          name: data.name,
          role: data.role,
          salon_id: data.salon_id
        }));
        
        return { success: true, admin: data };
      }

      return { success: false, message: 'Credenciais inválidas' };
    } catch (error) {
      console.error('Error during authentication:', error);
      return { success: false, message: 'Erro durante a autenticação' };
    } finally {
      setLoading(false);
    }
  };

  // Authenticate client
  const authenticateClient = async (username: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('client_auth')
        .select('*')
        .eq('name', username)
        .eq('password', password)
        .single();

      if (error) {
        console.error('Client authentication error:', error);
        return { success: false, message: 'Credenciais inválidas' };
      }

      if (data) {
        localStorage.setItem('clientAuth', JSON.stringify({
          id: data.id,
          name: data.name
        }));
        
        return { success: true, client: data };
      }

      return { success: false, message: 'Credenciais inválidas' };
    } catch (error) {
      console.error('Error during client authentication:', error);
      return { success: false, message: 'Erro durante a autenticação' };
    } finally {
      setLoading(false);
    }
  };

  // Fetch salon data (public access)
  const fetchSalonData = async (salonId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .eq('id', salonId)
        .single();

      if (error) {
        console.error('Error fetching salon:', error);
        return;
      }

      setSalon(data);
    } catch (error) {
      console.error('Error fetching salon data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all salons (public access)
  const fetchAllSalons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching salons:', error);
        return;
      }

      setSalons(data || []);
    } catch (error) {
      console.error('Error fetching salons:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch salon services (public access for active services)
  const fetchSalonServices = async (salonId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonId)
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('Error fetching services:', error);
        return;
      }

      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch preset services (public access)
  const fetchPresetServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('preset_services')
        .select('*')
        .order('category', { ascending: true });

      if (error) {
        console.error('Error fetching preset services:', error);
        return;
      }

      setPresetServices(data || []);
    } catch (error) {
      console.error('Error fetching preset services:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create appointment (public access)
  const createAppointment = async (appointmentData: any) => {
    try {
      setLoading(true);
      
      // First create the client if it doesn't exist
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .upsert({
          name: appointmentData.clientName,
          phone: appointmentData.clientPhone,
          email: appointmentData.clientEmail || null
        }, {
          onConflict: 'phone',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (clientError) {
        console.error('Error creating/updating client:', clientError);
        return { success: false, message: 'Erro ao registrar cliente' };
      }

      // Then create the appointment
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          salon_id: appointmentData.salonId,
          client_id: clientData.id,
          service_id: appointmentData.serviceId,
          appointment_date: appointmentData.date,
          appointment_time: appointmentData.time,
          status: 'pending',
          notes: appointmentData.notes || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating appointment:', error);
        return { success: false, message: 'Erro ao criar agendamento' };
      }

      return { success: true, appointment: data };
    } catch (error) {
      console.error('Error creating appointment:', error);
      return { success: false, message: 'Erro ao criar agendamento' };
    } finally {
      setLoading(false);
    }
  };

  // Complete salon setup (requires admin authentication)
  const completeSalonSetup = async (salonId: string, setupData: any) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('salons')
        .update({
          ...setupData,
          setup_completed: true,
          is_open: true
        })
        .eq('id', salonId)
        .select()
        .single();

      if (error) {
        console.error('Error completing salon setup:', error);
        return { success: false, message: 'Erro ao finalizar configuração' };
      }

      setSalon(data);
      return { success: true, salon: data };
    } catch (error) {
      console.error('Error completing salon setup:', error);
      return { success: false, message: 'Erro ao finalizar configuração' };
    } finally {
      setLoading(false);
    }
  };

  // Create services from presets (requires admin authentication)
  const createServicesFromPresets = async (salonId: string, selectedServices: any[]) => {
    try {
      setLoading(true);
      
      const servicesToCreate = selectedServices.map(({ presetId, price }) => {
        const preset = presetServices.find(p => p.id === presetId);
        if (!preset) return null;
        
        return {
          salon_id: salonId,
          name: preset.name,
          description: preset.description,
          price: price,
          duration_minutes: preset.default_duration_minutes,
          active: true
        };
      }).filter(Boolean);

      const { data, error } = await supabase
        .from('services')
        .insert(servicesToCreate)
        .select();

      if (error) {
        console.error('Error creating services:', error);
        return { success: false, message: 'Erro ao criar serviços' };
      }

      return { success: true, services: data };
    } catch (error) {
      console.error('Error creating services from presets:', error);
      return { success: false, message: 'Erro ao criar serviços' };
    } finally {
      setLoading(false);
    }
  };

  return {
    salon,
    salons,
    appointments,
    services,
    adminUsers,
    presetServices,
    dashboardStats,
    loading,
    fetchSalonData,
    fetchAllSalons,
    fetchSalonServices,
    fetchPresetServices,
    authenticateAdmin,
    authenticateClient,
    createAppointment,
    completeSalonSetup,
    createServicesFromPresets
  };
};
