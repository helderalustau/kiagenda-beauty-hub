
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
  max_attendants?: number;
  created_at?: string;
  updated_at?: string;
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
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
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

export interface PlanConfiguration {
  id: string;
  plan_type: string;
  name: string;
  price: number;
  description?: string;
}

export interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  totalSalons?: number;
  totalServices?: number;
  salonsByPlan?: {
    bronze: number;
    prata: number;
    gold: number;
  };
  expectedRevenue?: {
    total: number;
    bronze: number;
    prata: number;
    gold: number;
  };
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

  // Fetch salon data
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

      setSalon(data as Salon);
    } catch (error) {
      console.error('Error fetching salon data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all salons
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

      setSalons(data as Salon[] || []);
    } catch (error) {
      console.error('Error fetching salons:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch salon services
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

  // Fetch preset services
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

  // Create appointment
  const createAppointment = async (appointmentData: any) => {
    try {
      setLoading(true);
      
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

  // Complete salon setup
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

      setSalon(data as Salon);
      return { success: true, salon: data };
    } catch (error) {
      console.error('Error completing salon setup:', error);
      return { success: false, message: 'Erro ao finalizar configuração' };
    } finally {
      setLoading(false);
    }
  };

  // Create services from presets
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

  // Additional functions needed by components
  const refreshData = async () => {
    // Refresh all data
    await fetchAllSalons();
    await fetchPresetServices();
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string, notes?: string) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status, notes })
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating appointment:', error);
        return { success: false, message: 'Erro ao atualizar agendamento' };
      }

      return { success: true, appointment: data };
    } catch (error) {
      console.error('Error updating appointment:', error);
      return { success: false, message: 'Erro ao atualizar agendamento' };
    }
  };

  const createService = async (serviceData: any) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert(serviceData)
        .select()
        .single();

      if (error) {
        console.error('Error creating service:', error);
        return { success: false, message: 'Erro ao criar serviço' };
      }

      return { success: true, service: data };
    } catch (error) {
      console.error('Error creating service:', error);
      return { success: false, message: 'Erro ao criar serviço' };
    }
  };

  const toggleSalonStatus = async (salonId: string, isOpen: boolean) => {
    try {
      const { data, error } = await supabase
        .from('salons')
        .update({ is_open: isOpen })
        .eq('id', salonId)
        .select()
        .single();

      if (error) {
        console.error('Error toggling salon status:', error);
        return { success: false, message: 'Erro ao alterar status' };
      }

      return { success: true, salon: data };
    } catch (error) {
      console.error('Error toggling salon status:', error);
      return { success: false, message: 'Erro ao alterar status' };
    }
  };

  const uploadSalonBanner = async (file: File, salonId: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${salonId}-${Math.random()}.${fileExt}`;
      const filePath = `salon-banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('salon-assets')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return { success: false, message: 'Erro ao fazer upload da imagem' };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('salon-assets')
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from('salons')
        .update({ banner_image_url: publicUrl })
        .eq('id', salonId)
        .select()
        .single();

      if (error) {
        console.error('Error updating salon banner:', error);
        return { success: false, message: 'Erro ao atualizar banner' };
      }

      return { success: true, salon: data };
    } catch (error) {
      console.error('Error uploading salon banner:', error);
      return { success: false, message: 'Erro ao fazer upload' };
    }
  };

  const updateSalon = async (salonData: any) => {
    try {
      const { data, error } = await supabase
        .from('salons')
        .update(salonData)
        .eq('id', salonData.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating salon:', error);
        return { success: false, message: 'Erro ao atualizar estabelecimento' };
      }

      return { success: true, salon: data };
    } catch (error) {
      console.error('Error updating salon:', error);
      return { success: false, message: 'Erro ao atualizar estabelecimento' };
    }
  };

  const deleteSalon = async (salonId: string) => {
    try {
      const { error } = await supabase
        .from('salons')
        .delete()
        .eq('id', salonId);

      if (error) {
        console.error('Error deleting salon:', error);
        return { success: false, message: 'Erro ao excluir estabelecimento' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting salon:', error);
      return { success: false, message: 'Erro ao excluir estabelecimento' };
    }
  };

  const fetchAllAppointments = async (salonId: string, includeDeleted: boolean = false) => {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          clients (*),
          services (*)
        `)
        .eq('salon_id', salonId);

      if (includeDeleted) {
        query = query.not('deleted_at', 'is', null);
      } else {
        query = query.is('deleted_at', null);
      }

      const { data, error } = await query.order('appointment_date', { ascending: false });

      if (error) {
        console.error('Error fetching appointments:', error);
        return { success: false, message: 'Erro ao buscar agendamentos' };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return { success: false, message: 'Erro ao buscar agendamentos' };
    }
  };

  const restoreAppointment = async (appointmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ deleted_at: null })
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) {
        console.error('Error restoring appointment:', error);
        return { success: false, message: 'Erro ao restaurar agendamento' };
      }

      return { success: true, appointment: data };
    } catch (error) {
      console.error('Error restoring appointment:', error);
      return { success: false, message: 'Erro ao restaurar agendamento' };
    }
  };

  const updatePlanConfiguration = async (planData: any) => {
    try {
      const { data, error } = await supabase
        .from('plan_configurations')
        .update(planData)
        .eq('id', planData.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating plan configuration:', error);
        return { success: false, message: 'Erro ao atualizar configuração do plano' };
      }

      return { success: true, plan: data };
    } catch (error) {
      console.error('Error updating plan configuration:', error);
      return { success: false, message: 'Erro ao atualizar configuração do plano' };
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
    createServicesFromPresets,
    refreshData,
    updateAppointmentStatus,
    createService,
    toggleSalonStatus,
    uploadSalonBanner,
    updateSalon,
    deleteSalon,
    fetchAllAppointments,
    restoreAppointment,
    updatePlanConfiguration
  };
};
