
import { useToast } from "@/components/ui/use-toast";
import { useAuthData } from './useAuthData';
import { useSalonData } from './useSalonData';
import { useAppointmentData } from './useAppointmentData';
import { useServiceData } from './useServiceData';
import { useClientData } from './useClientData';
import { useDashboardData } from './useDashboardData';
import { useAdminUsersData } from './useAdminUsersData';
import { useDataRefresh } from './useDataRefresh';

// Re-export all interfaces for backward compatibility
export type {
  Salon,
  Service,
  Client,
  Appointment,
  AdminUser,
  PresetService,
  PlanConfiguration,
  DashboardStats
} from '@/types/supabase-entities';

export const useSupabaseData = () => {
  const { toast } = useToast();

  // Use all the specialized hooks
  const authData = useAuthData();
  const salonData = useSalonData();
  const appointmentData = useAppointmentData();
  const serviceData = useServiceData();
  const clientData = useClientData();
  const dashboardData = useDashboardData();
  const adminUsersData = useAdminUsersData();
  const { refreshData } = useDataRefresh();

  return {
    // State from individual hooks
    salon: salonData.salon,
    salons: salonData.salons,
    appointments: appointmentData.appointments,
    services: serviceData.services,
    adminUsers: adminUsersData.adminUsers,
    presetServices: serviceData.presetServices,
    planConfigurations: dashboardData.planConfigurations,
    dashboardStats: dashboardData.dashboardStats,
    loading: authData.loading || salonData.loading || appointmentData.loading || serviceData.loading || clientData.loading || dashboardData.loading || adminUsersData.loading,
    
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
    cleanupIncompleteSalons: salonData.cleanupIncompleteSalons,
    clearSalonFinancialData: salonData.clearSalonFinancialData,
    
    // Service methods
    fetchSalonServices: serviceData.fetchSalonServices,
    fetchPresetServices: serviceData.fetchPresetServices,
    createService: serviceData.createService,
    createServicesFromPresets: serviceData.createServicesFromPresets,
    updateService: serviceData.updateService,
    deleteService: serviceData.deleteService,
    toggleServiceStatus: serviceData.toggleServiceStatus,
    
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
    fetchAdminUsers: adminUsersData.fetchAdminUsers,
    setAdminUsers: adminUsersData.setAdminUsers,
    
    // Utility methods
    refreshData
  };
};
