import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useSalonData } from './useSalonData';
import { useAppointmentData } from './useAppointmentData';
import { useServiceData } from './useServiceData';
import { useUnifiedRealtimeNotifications } from './useUnifiedRealtimeNotifications';
import { usePlanLimitsChecker } from './usePlanLimitsChecker';

export const useOptimizedAdminDashboard = () => {
  const { 
    salon, 
    fetchSalonData,
    loading: salonLoading
  } = useSalonData();
  
  const {
    appointments,
    fetchAllAppointments,
    updateAppointmentStatus,
    loading: appointmentLoading
  } = useAppointmentData();
  
  const {
    services,
    fetchSalonServices,
    loading: serviceLoading
  } = useServiceData();
  
  const { toast } = useToast();
  const { getSalonAppointmentStats } = usePlanLimitsChecker();
  
  // Use refs to avoid unnecessary re-renders
  const notificationShownRef = useRef(new Set<string>());
  
  const [newAppointment, setNewAppointment] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [currentSalonId, setCurrentSalonId] = useState<string | null>(null);

  // Memoized salon ID getter
  const getSalonId = useCallback(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      try {
        const admin = JSON.parse(adminAuth);
        if (admin.salon_id) {
          return admin.salon_id;
        }
      } catch (error) {
        console.error('Error parsing adminAuth:', error);
      }
    }
    
    // Fallback checks
    const fallbackKeys = ['salon_id', 'currentSalon', 'selectedSalon'];
    for (const key of fallbackKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        return value;
      }
    }
    
    return null;
  }, []);

  // Initialize salon ID once
  useEffect(() => {
    const salonId = getSalonId();
    if (salonId && salonId !== currentSalonId) {
      setCurrentSalonId(salonId);
    }
  }, [getSalonId, currentSalonId]);

  // Memoized loading state
  const loading = useMemo(() => 
    salonLoading || appointmentLoading || serviceLoading, 
    [salonLoading, appointmentLoading, serviceLoading]
  );

  // Optimized data refresh function
  const refreshData = useCallback(async () => {
    const salonId = currentSalonId || getSalonId();
    if (salonId) {
      await Promise.all([
        fetchSalonData(salonId),
        fetchSalonServices(salonId),
        fetchAllAppointments(salonId)
      ]);
    } else {
      console.error('Não foi possível obter salon ID para refresh dos dados');
      toast({
        title: "Erro",
        description: "Dados do estabelecimento não encontrados. Redirecionando para login...",
        variant: "destructive"
      });
      setTimeout(() => window.location.href = '/admin-login', 2000);
    }
  }, [currentSalonId, getSalonId, fetchSalonData, fetchSalonServices, fetchAllAppointments, toast]);

  // Optimized realtime notification handlers
  const handleNewAppointment = useCallback((appointment: any) => {
    // Avoid showing duplicate notifications
    if (notificationShownRef.current.has(appointment.id)) {
      return;
    }
    
    notificationShownRef.current.add(appointment.id);
    setNewAppointment(appointment);
    setShowNotification(true);
    
    // Clean up old notification IDs (keep only last 50)
    if (notificationShownRef.current.size > 50) {
      const idsArray = Array.from(notificationShownRef.current);
      const idsToKeep = idsArray.slice(-25);
      notificationShownRef.current.clear();
      idsToKeep.forEach(id => notificationShownRef.current.add(id));
    }
  }, []);

  const handleAppointmentUpdate = useCallback((appointment: any) => {
    // Update local appointment state if needed
    // This could trigger a selective refresh instead of full refresh
  }, []);

  // Setup realtime notifications with memoized handlers
  const {
    pendingAppointments,
    isCheckingManually,
    checkForNewAppointments,
    clearNotification,
    clearAllNotifications
  } = useUnifiedRealtimeNotifications({
    salonId: currentSalonId || '',
    onNewAppointment: handleNewAppointment,
    onAppointmentUpdate: handleAppointmentUpdate
  });

  // Optimized appointment handlers
  const handleAcceptAppointment = useCallback(async () => {
    if (!newAppointment) return;
    
    const result = await updateAppointmentStatus(newAppointment.id, 'confirmed');
    if (result.success) {
      setShowNotification(false);
      setNewAppointment(null);
      clearNotification(newAppointment.id);
      toast({
        title: "Agendamento Confirmado",
        description: "O cliente foi notificado sobre a confirmação."
      });
      await refreshData();
    } else {
      toast({
        title: "Erro",
        description: "Erro ao confirmar agendamento",
        variant: "destructive"
      });
    }
  }, [newAppointment, updateAppointmentStatus, clearNotification, toast, refreshData]);

  const handleRejectAppointment = useCallback(async () => {
    if (!newAppointment) return;
    
    const result = await updateAppointmentStatus(newAppointment.id, 'cancelled', 'Agendamento recusado pelo establishment');
    if (result.success) {
      setShowNotification(false);
      setNewAppointment(null);
      clearNotification(newAppointment.id);
      toast({
        title: "Agendamento Recusado",
        description: "O cliente foi notificado sobre a recusa."
      });
      await refreshData();
    } else {
      toast({
        title: "Erro",
        description: "Erro ao recusar agendamento",
        variant: "destructive"
      });
    }
  }, [newAppointment, updateAppointmentStatus, clearNotification, toast, refreshData]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('salon_id');
    localStorage.removeItem('currentSalon');
    localStorage.removeItem('selectedSalon');
    window.location.href = '/admin-login';
  }, []);

  const handleBackToHome = useCallback(() => {
    window.location.href = '/';
  }, []);

  const handleStatusChange = useCallback(async (isOpen: boolean) => {
    const salonId = currentSalonId || getSalonId();
    if (salonId) {
      await Promise.all([
        fetchSalonData(salonId),
        fetchAllAppointments(salonId)
      ]);
    }
  }, [currentSalonId, getSalonId, fetchSalonData, fetchAllAppointments]);

  // Initialize data on mount
  useEffect(() => {
    if (currentSalonId) {
      refreshData();
    }
  }, [currentSalonId]); // Only run when salon ID changes

  return {
    // Data
    salon,
    appointments,
    services,
    adminUsers,
    
    // Loading states
    loading,
    salonLoading,
    appointmentLoading,
    serviceLoading,
    
    // Notification state
    newAppointment,
    showNotification,
    pendingAppointments,
    isCheckingManually,
    
    // UI state
    mobileMenuOpen,
    setMobileMenuOpen,
    
    // Actions
    refreshData,
    handleAcceptAppointment,
    handleRejectAppointment,
    handleLogout,
    handleBackToHome,
    handleStatusChange,
    checkForNewAppointments,
    clearNotification,
    clearAllNotifications,
    
    // Utils
    getSalonId,
    currentSalonId
  };
};
