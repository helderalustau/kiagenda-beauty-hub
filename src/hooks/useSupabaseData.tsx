
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuthData } from './useAuthData';
import { useSalonData } from './useSalonData';
import { useAppointmentData } from './useAppointmentData';
import { useServiceData } from './useServiceData';
import { useClientData } from './useClientData';
import { useDashboardData } from './useDashboardData';

// Re-export all interfaces for backward compatibility
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
  unique_slug?: string;
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
  street_address?: string;
  house_number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export interface Appointment {
  id: string;
  salon_id: string;
  client_id: string;
  service_id: string;
  user_id?: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  // Relações
  salon?: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
  };
  service?: {
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
  };
  client?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
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
  max_attendants?: number;
  max_appointments?: number;
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
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  // Use all the refactored hooks
  const authData = useAuthData();
  const salonData = useSalonData();
  const appointmentData = useAppointmentData();
  const serviceData = useServiceData();
  const clientData = useClientData();
  const dashboardData = useDashboardData();

  // Fetch admin users for current salon
  const fetchAdminUsers = async (salonId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_auth')
        .select('*')
        .eq('salon_id', salonId)
        .order('name');

      if (error) {
        console.error('Error fetching admin users:', error);
        return;
      }

      setAdminUsers(data || []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Additional functions needed by components
  const refreshData = async () => {
    await salonData.fetchAllSalons();
    await serviceData.fetchPresetServices();
    await dashboardData.fetchDashboardStats();
    await dashboardData.fetchPlanConfigurations();
  };

  return {
    // State from individual hooks
    salon: salonData.salon,
    salons: salonData.salons,
    appointments: appointmentData.appointments,
    services: serviceData.services,
    adminUsers,
    presetServices: serviceData.presetServices,
    planConfigurations: dashboardData.planConfigurations,
    dashboardStats: dashboardData.dashboardStats,
    loading: loading || authData.loading || salonData.loading || appointmentData.loading || serviceData.loading || clientData.loading || dashboardData.loading,
    
    // Auth methods
    authenticateAdmin: authData.authenticateAdmin,
    authenticateClient: authData.authenticateClient,
    registerClient: authData.registerClient,
    registerAdmin: authData.registerAdmin,
    linkAdminToSalon: authData.linkAdminToSalon,
    updateAdminUser: authData.updateAdminUser,
    deleteAdminUser: authData.deleteAdminUser,
    
    // Salon methods
    fetchSalonData: salonData.fetchSalonData,
    fetchSalonBySlug: salonData.fetchSalonBySlug,
    fetchAllSalons: salonData.fetchAllSalons,
    createSalon: salonData.createSalon,
    completeSalonSetup: salonData.completeSalonSetup,
    toggleSalonStatus: salonData.toggleSalonStatus,
    uploadSalonBanner: salonData.uploadSalonBanner,
    updateSalon: salonData.updateSalon,
    deleteSalon: salonData.deleteSalon,
    cleanupSalonsWithoutAdmins: salonData.cleanupSalonsWithoutAdmins,
    
    // Service methods
    fetchSalonServices: serviceData.fetchSalonServices,
    fetchPresetServices: serviceData.fetchPresetServices,
    createService: serviceData.createService,
    createServicesFromPresets: serviceData.createServicesFromPresets,
    
    // Appointment methods
    createAppointment: appointmentData.createAppointment,
    updateAppointmentStatus: appointmentData.updateAppointmentStatus,
    fetchAllAppointments: appointmentData.fetchAllAppointments,
    restoreAppointment: appointmentData.restoreAppointment,
    fetchClientAppointments: appointmentData.fetchClientAppointments,
    
    // Client methods
    updateClientProfile: clientData.updateClientProfile,
    getClientByPhone: clientData.getClientByPhone,
    getOrCreateClient: clientData.getOrCreateClient,
    
    // Dashboard methods
    fetchDashboardStats: dashboardData.fetchDashboardStats,
    fetchPlanConfigurations: dashboardData.fetchPlanConfigurations,
    updatePlanConfiguration: dashboardData.updatePlanConfiguration,

    // Admin users methods
    fetchAdminUsers,
    setAdminUsers,
    
    // Utility methods
    refreshData
  };
};
