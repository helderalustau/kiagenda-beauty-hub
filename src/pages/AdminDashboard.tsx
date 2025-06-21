import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BarChart3, Calendar, Users, Settings, LogOut, AlertTriangle, Menu } from "lucide-react";
import { useSalonData } from '@/hooks/useSalonData';
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { useServiceData } from '@/hooks/useServiceData';
import { useToast } from "@/components/ui/use-toast";
import DashboardStats from '@/components/DashboardStats';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import ServicesPage from '@/pages/ServicesPage';
import SettingsPage from '@/pages/SettingsPage';
import SalonStatusToggle from '@/components/SalonStatusToggle';
import AppointmentNotification from '@/components/AppointmentNotification';

const AdminDashboard = () => {
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
    // Try to get from adminAuth first
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

    // Fallback to selectedSalonId
    const selectedSalonId = localStorage.getItem('selectedSalonId');
    if (selectedSalonId) {
      console.log('Salon ID encontrado em selectedSalonId:', selectedSalonId);
      return selectedSalonId;
    }

    // Last fallback to adminData (legacy)
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
    // Verificar se temos os dados necessários no localStorage
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

    // Buscar dados ao carregar
    refreshData();
  }, []);

  // Verificar se a configuração foi concluída
  useEffect(() => {
    if (salon && !salon.setup_completed) {
      console.log('Setup não concluído, redirecionando para salon-setup');
      window.location.href = '/salon-setup';
    }
  }, [salon]);

  // Monitorar novos agendamentos pendentes - melhorado
  useEffect(() => {
    if (appointments && appointments.length > 0) {
      const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
      
      // Verificar se há um novo agendamento pendente que ainda não foi mostrado
      if (pendingAppointments.length > 0) {
        const latestPending = pendingAppointments.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        )[0];
        
        // Só mostrar se for diferente do atual ou se não há notificação sendo mostrada
        if (!showNotification || (newAppointment && newAppointment.id !== latestPending.id)) {
          setNewAppointment(latestPending);
          setShowNotification(true);
        }
      }
    }
  }, [appointments]);

  // Verificar agendamentos pendentes periodicamente (a cada 30 segundos)
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

    const interval = setInterval(checkPendingAppointments, 30000); // 30 segundos
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do estabelecimento...</p>
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <span>Estabelecimento não encontrado</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Não foi possível encontrar os dados do seu estabelecimento. Verifique se você completou a configuração inicial.
            </p>
            <div className="space-y-2">
              <Button onClick={() => window.location.href = '/salon-setup'} className="w-full">
                Configurar Estabelecimento
              </Button>
              <Button onClick={handleBackToHome} variant="outline" className="w-full">
                Voltar ao Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header - Responsivo */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                onClick={handleBackToHome}
                className="flex items-center space-x-1 sm:space-x-2 text-sm"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Voltar ao Login</span>
              </Button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate max-w-48 sm:max-w-none">{salon.name}</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Dashboard Administrativo</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:block">
                <SalonStatusToggle 
                  salonId={salon.id}
                  isOpen={salonStatus}
                  onStatusChange={handleStatusChange}
                />
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm"
                size="sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="sm:hidden mt-4 pt-4 border-t border-gray-200">
              <div className="mb-4">
                <SalonStatusToggle 
                  salonId={salon.id}
                  isOpen={salonStatus}
                  onStatusChange={handleStatusChange}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <div className="sm:hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview" className="text-xs">
                <BarChart3 className="h-3 w-3 mr-1" />
                Visão
              </TabsTrigger>
              <TabsTrigger value="calendar" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                Agenda
              </TabsTrigger>
            </TabsList>
            <div className="mt-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="services" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  Serviços
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs">
                  <Settings className="h-3 w-3 mr-1" />
                  Config
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="hidden sm:block">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Visão Geral</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Agenda</span>
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Serviços</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Visão Geral
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Acompanhe as métricas do seu estabelecimento
              </p>
            </div>
            <DashboardStats 
              appointments={appointments}
              services={services}
              salon={salon}
              adminUsers={adminUsers}
            />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Agenda
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Gerencie os agendamentos do seu estabelecimento
              </p>
            </div>
            <WeeklyCalendar 
              appointments={appointments}
              onRefresh={refreshData}
            />
          </TabsContent>

          <TabsContent value="services" className="space-y-4 sm:space-y-6">
            <ServicesPage 
              services={services}
              onRefresh={refreshData}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 sm:space-y-6">
            <SettingsPage 
              salon={salon}
              onRefresh={refreshData}
            />
          </TabsContent>
        </Tabs>
      </div>

      <AppointmentNotification
        isOpen={showNotification}
        appointment={newAppointment}
        soundType={salon.notification_sound as 'default' | 'bell' | 'chime' | 'alert' || 'default'}
        onAccept={handleAcceptAppointment}
        onReject={handleRejectAppointment}
      />
    </div>
  );
};

export default AdminDashboard;
