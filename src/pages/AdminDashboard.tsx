
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { AlertTriangle } from "lucide-react";
import { useAdminDashboardLogic } from '@/hooks/useAdminDashboardLogic';
import AdminDashboardHeader from '@/components/AdminDashboardHeader';
import AdminDashboardTabs from '@/components/AdminDashboardTabs';
import AdminDashboardContent from '@/components/AdminDashboardContent';
import AppointmentNotification from '@/components/AppointmentNotification';
import FloatingSupport from '@/components/admin/FloatingSupport';

const AdminDashboard = () => {
  const {
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
    handleStatusChange
  } = useAdminDashboardLogic();

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  const handleLogoutAndRedirect = () => {
    handleLogout();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Carregando dados do estabelecimento...</p>
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600 text-lg">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>Estabelecimento não encontrado</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              Não foi possível encontrar os dados do seu estabelecimento. Verifique se você completou a configuração inicial.
            </p>
            <div className="space-y-2">
              <Button onClick={() => window.location.href = '/salon-setup'} className="w-full text-sm">
                Configurar Estabelecimento
              </Button>
              <Button onClick={handleBackToHome} variant="outline" className="w-full text-sm">
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
      <AdminDashboardHeader
        salon={salon}
        mobileMenuOpen={mobileMenuOpen}
        pendingCount={pendingAppointments?.length || 0}
        isCheckingManually={isCheckingManually}
        onBackToHome={handleBackToHome}
        onLogout={handleLogoutAndRedirect}
        onToggleMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        onStatusChange={handleStatusChange}
        onCheckAppointments={checkForNewAppointments}
        onRefresh={refreshData}
      />

      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 lg:py-8">
        <Tabs defaultValue="overview" className="space-y-2 sm:space-y-4">
          <AdminDashboardTabs />
          <AdminDashboardContent
            appointments={appointments}
            services={services}
            salon={salon}
            adminUsers={adminUsers}
            onRefresh={refreshData}
          />
        </Tabs>
      </div>

      <AppointmentNotification
        isOpen={showNotification}
        appointment={newAppointment}
        soundType={salon.notification_sound as 'default' | 'bell' | 'chime' | 'alert' || 'default'}
        onAccept={handleAcceptAppointment}
        onReject={handleRejectAppointment}
      />

      <FloatingSupport />
    </div>
  );
};

export default AdminDashboard;
