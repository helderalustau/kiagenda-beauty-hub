
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useSalonData } from './useSalonData';
import { useAppointmentData } from './useAppointmentData';
import { useServiceData } from './useServiceData';
import { useUnifiedRealtimeNotifications } from './useUnifiedRealtimeNotifications';
import { usePlanLimitsChecker } from './usePlanLimitsChecker';

export const useAdminDashboardLogic = () => {
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
  const { getSalonAppointmentStats } = usePlanLimitsChecker(); // Removido checkAndEnforcePlanLimits
  const [newAppointment, setNewAppointment] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);

  // Get salon ID first, then setup notifications
  const [currentSalonId, setCurrentSalonId] = useState<string | null>(null);

  // Function to get salon ID from localStorage
  function getSalonId() {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      try {
        const admin = JSON.parse(adminAuth);
        if (admin.salon_id) {
          console.log('Salon ID encontrado em adminAuth:', admin.salon_id);
          return admin.salon_id;
        }
      } catch (error) {
        console.error('Erro ao parsear adminAuth:', error);
      }
    }

    const selectedSalonId = localStorage.getItem('selectedSalonId');
    if (selectedSalonId) {
      console.log('Salon ID encontrado em selectedSalonId:', selectedSalonId);
      return selectedSalonId;
    }

    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      try {
        const admin = JSON.parse(adminData);
        if (admin.salon_id) {
          console.log('Salon ID encontrado em adminData (legacy):', admin.salon_id);
          return admin.salon_id;
        }
      } catch (error) {
        console.error('Erro ao parsear adminData:', error);
      }
    }

    console.error('Nenhum salon ID encontrado no localStorage');
    return null;
  }

  // Initialize salon ID
  useEffect(() => {
    const salonId = getSalonId();
    setCurrentSalonId(salonId);
    console.log('🔑 Salon ID inicializado para notificações:', salonId);
  }, []);

  const loading = useMemo(() => salonLoading || appointmentLoading || serviceLoading, [salonLoading, appointmentLoading, serviceLoading]);

  // Setup unified realtime notifications (conditional on salon ID)
  const {
    pendingAppointments,
    isCheckingManually,
    checkForNewAppointments,
    clearNotification,
    clearAllNotifications
  } = useUnifiedRealtimeNotifications({
    salonId: currentSalonId || '',
    onNewAppointment: (appointment) => {
      console.log('🔔 Nova notificação de agendamento:', appointment);
      setNewAppointment(appointment);
      setShowNotification(true);
    },
    onAppointmentUpdate: (appointment) => {
      console.log('📝 Agendamento atualizado:', appointment);
      refreshData();
    }
  });

  // REMOVIDO: Verificação automática de limites que fechava a loja
  // Agora apenas obtém estatísticas para exibição
  useEffect(() => {
    if (salon) {
      const getStatsForDisplay = async () => {
        try {
          const stats = await getSalonAppointmentStats(salon.id);
          if (stats.success && stats.limitReached) {
            // Apenas aviso, não fecha a loja
            console.log(`📊 Limite atingido: ${stats.currentAppointments}/${stats.maxAppointments}`);
          }
        } catch (error) {
          console.error('Erro ao obter estatísticas:', error);
        }
      };
      getStatsForDisplay();
    }
  }, [salon, getSalonAppointmentStats]);

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
  }, [currentSalonId, fetchSalonData, fetchSalonServices, fetchAllAppointments, toast]);

  useEffect(() => {
    const salonId = currentSalonId || getSalonId();
    if (!salonId) {
      console.error('Salon ID não encontrado, redirecionando para login');
      toast({
        title: "Erro",
        description: "Dados do estabelecimento não encontrados. Redirecionando para login...",
        variant: "destructive"
      });
      setTimeout(() => window.location.href = '/admin-login', 1500);
      return;
    }

    refreshData();
  }, [currentSalonId]);

  useEffect(() => {
    if (salon && !salon.setup_completed) {
      console.log('Setup não concluído, redirecionando para salon-setup');
      window.location.href = '/salon-setup';
    }
  }, [salon]);

  // Monitorar novos agendamentos pendentes (backup para notificações unificadas)
  useEffect(() => {
    if (appointments && appointments.length > 0) {
      const pendingAppts = appointments.filter(apt => apt.status === 'pending');
      
      if (pendingAppts.length > 0 && !showNotification) {
        const latestPending = pendingAppts.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        )[0];
        
        if (!newAppointment || newAppointment.id !== latestPending.id) {
          setNewAppointment(latestPending);
          setShowNotification(true);
        }
      }
    }
  }, [appointments, showNotification, newAppointment]);

  const handleAcceptAppointment = useCallback(async () => {
    if (newAppointment) {
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
    }
  }, [newAppointment, updateAppointmentStatus, clearNotification, toast, refreshData]);

  const handleRejectAppointment = useCallback(async () => {
    if (newAppointment) {
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
    }
  }, [newAppointment, updateAppointmentStatus, clearNotification, toast, refreshData]);

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('adminData');
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('selectedSalonId');
    window.location.href = '/';
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  const handleStatusChange = useCallback(async (isOpen: boolean) => {
    const salonId = currentSalonId || getSalonId();
    if (salonId && salon) {
      // Atualizar estado local imediatamente para responsividade
      const updatedSalon = { ...salon, is_open: isOpen };
      // Se tiver setSalon disponível, usar aqui para atualizar imediatamente
      
      // Buscar dados atualizados em background
      setTimeout(async () => {
        await Promise.all([
          fetchSalonData(salonId),
          fetchAllAppointments(salonId)
        ]);
      }, 100);
    }
  }, [currentSalonId, salon, fetchSalonData, fetchAllAppointments]);

  return {
    salon,
    appointments,
    services,
    adminUsers,
    loading,
    newAppointment,
    showNotification,
    mobileMenuOpen,
    pendingAppointments,
    isCheckingManually,
    setMobileMenuOpen,
    refreshData,
    checkForNewAppointments,
    handleAcceptAppointment,
    handleRejectAppointment,
    handleLogout,
    handleBackToHome,
    handleStatusChange
  };
};
