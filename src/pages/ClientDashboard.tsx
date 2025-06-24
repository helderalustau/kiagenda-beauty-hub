
import React from 'react';
import { useClientDashboard } from '@/hooks/useClientDashboard';
import ClientDashboardHeader from '@/components/client/ClientDashboardHeader';
import ClientDashboardLoading from '@/components/client/ClientDashboardLoading';
import ClientDashboardError from '@/components/client/ClientDashboardError';
import ClientDashboardContent from '@/components/client/ClientDashboardContent';

const ClientDashboard = () => {
  const {
    // State
    user,
    salons,
    appointments,
    loading,
    hasError,
    isRefreshing,
    searchTerm,
    
    // Actions
    setSearchTerm,
    handleBookService,
    handleLogout,
    handleBackToHome,
    handleRetry,
    clearSearch
  } = useClientDashboard();

  // Filter appointments by status - cliente vê agendamentos ativos (pending e confirmed)
  const activeAppointments = appointments.filter(apt => 
    apt.status === 'pending' || apt.status === 'confirmed'
  );
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');

  console.log('ClientDashboard - All appointments:', appointments);
  console.log('ClientDashboard - Active appointments:', activeAppointments);
  console.log('ClientDashboard - Completed appointments:', completedAppointments);

  if (loading && !isRefreshing) {
    return <ClientDashboardLoading />;
  }

  if (hasError) {
    return (
      <ClientDashboardError 
        onRetry={handleRetry}
        onBackToHome={handleBackToHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <ClientDashboardHeader
        user={user}
        searchTerm={searchTerm}
        isRefreshing={isRefreshing}
        onSearchChange={setSearchTerm}
        onClearSearch={clearSearch}
        onRetry={handleRetry}
        onBackToHome={handleBackToHome}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4">
        {isRefreshing ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Atualizando dados...</p>
          </div>
        ) : (
          <ClientDashboardContent
            salons={salons}
            onBookService={handleBookService}
            activeAppointments={activeAppointments}
            completedAppointments={completedAppointments}
          />
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
