
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
    handleBackToHome,
    handleStatusChange
  } = useAdminDashboardLogic();

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
      <AdminDashboardHeader
        salon={salon}
        mobileMenuOpen={mobileMenuOpen}
        pendingCount={pendingAppointments?.length || 0}
        isCheckingManually={isCheckingManually}
        onBackToHome={handleBackToHome}
        onLogout={handleLogout}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        onStatusChange={handleStatusChange}
        onCheckAppointments={checkForNewAppointments}
      />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
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

      {/* Suporte Flutuante */}
      <FloatingSupport />
    </div>
  );
};

export default AdminDashboard;
