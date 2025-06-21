
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

  // Filter appointments by status
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');

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
            pendingAppointments={pendingAppointments}
            completedAppointments={completedAppointments}
          />
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
