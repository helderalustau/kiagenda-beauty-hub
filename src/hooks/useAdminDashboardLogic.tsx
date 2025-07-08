
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useSalonData } from './useSalonData';
import { useAppointmentData } from './useAppointmentData';
import { useServiceData } from './useServiceData';

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
  const [newAppointment, setNewAppointment] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [salonStatus, setSalonStatus] = useState<boolean | null>(null);

  const loading = salonLoading || appointmentLoading || serviceLoading;

  // Get correct salon ID from localStorage
  const getSalonId = () => {
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
  };

  // Sincronizar o status local com o salon
  useEffect(() => {
    if (salon) {
      setSalonStatus(salon.is_open);
    }
  }, [salon]);

  const refreshData = async () => {
    const salonId = getSalonId();
    if (salonId) {
      console.log('Refreshing data for salon:', salonId);
      await fetchSalonData(salonId);
      await fetchSalonServices(salonId);
      const appointmentResult = await fetchAllAppointments(salonId);
      if (appointmentResult && appointmentResult.success) {
        console.log('Appointments refreshed successfully');
      }
    } else {
      console.error('Não foi possível obter salon ID para refresh dos dados');
      toast({
        title: "Erro",
        description: "Dados do estabelecimento não encontrados. Redirecionando para login...",
        variant: "destructive"
      });
      setTimeout(() => window.location.href = '/admin-login', 2000);
    }
  };

  useEffect(() => {
    const salonId = getSalonId();
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
  }, []);

  useEffect(() => {
    if (salon && !salon.setup_completed) {
      console.log('Setup não concluído, redirecionando para salon-setup');
      window.location.href = '/salon-setup';
    }
  }, [salon]);

  // Monitorar novos agendamentos pendentes
  useEffect(() => {
    if (appointments && appointments.length > 0) {
      const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
      
      if (pendingAppointments.length > 0) {
        const latestPending = pendingAppointments.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        )[0];
        
        if (!showNotification || (newAppointment && newAppointment.id !== latestPending.id)) {
          setNewAppointment(latestPending);
          setShowNotification(true);
        }
      }
    }
  }, [appointments]);

  // Verificar agendamentos pendentes periodicamente
  useEffect(() => {
    const checkPendingAppointments = async () => {
      const adminData = localStorage.getItem('adminData');
      if (adminData) {
        const admin = JSON.parse(adminData);
        if (admin.salon_id) {
          const result = await fetchAllAppointments(admin.salon_id);
          if (result && result.success) {
            console.log('Verificação automática de agendamentos concluída');
          }
        }
      }
    };

    const interval = setInterval(checkPendingAppointments, 60000); // 1 minuto
    return () => clearInterval(interval);
  }, []);

  const handleAcceptAppointment = async () => {
    if (newAppointment) {
      const result = await updateAppointmentStatus(newAppointment.id, 'confirmed');
      if (result.success) {
        setShowNotification(false);
        setNewAppointment(null);
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
  };

  const handleRejectAppointment = async () => {
    if (newAppointment) {
      const result = await updateAppointmentStatus(newAppointment.id, 'cancelled', 'Agendamento recusado pelo establishment');
      if (result.success) {
        setShowNotification(false);
        setNewAppointment(null);
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
  };

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

  const handleStatusChange = async (isOpen: boolean) => {
    setSalonStatus(isOpen);
    const salonId = getSalonId();
    if (salonId) {
      await fetchSalonData(salonId);
    }
  };

  return {
    salon,
    appointments,
    services,
    adminUsers,
    loading,
    newAppointment,
    showNotification,
    mobileMenuOpen,
    salonStatus,
    setMobileMenuOpen,
    refreshData,
    handleAcceptAppointment,
    handleRejectAppointment,
    handleLogout,
    handleBackToHome,
    handleStatusChange
  };
};
