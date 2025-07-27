
import React from 'react';
import { useClientDashboard } from '@/hooks/useClientDashboard';
import ClientDashboardHeader from '@/components/client/ClientDashboardHeader';
import ClientDashboardContent from '@/components/client/ClientDashboardContent';
import ClientDashboardLoading from '@/components/client/ClientDashboardLoading';
import ClientDashboardError from '@/components/client/ClientDashboardError';
import ClientAppointments from '@/components/client/ClientAppointments';
import PendingAppointments from '@/components/client/PendingAppointments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ClientDashboard = () => {
  const {
    user,
    salons,
    appointments,
    loading,
    hasError,
    isRefreshing,
    searchTerm,
    setSearchTerm,
    handleBookService,
    handleLogout,
    handleBackToHome,
    handleRetry,
    clearSearch,
    handleUserUpdate,
    locationFilter,
    toggleLocationFilter,
    toggleShowOtherCities
  } = useClientDashboard();

  if (loading && !user) {
    return <ClientDashboardLoading />;
  }

  if (hasError) {
    return <ClientDashboardError onRetry={handleRetry} onBackToHome={handleBackToHome} />;
  }

  // Filtrar apenas agendamentos pendentes
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientDashboardHeader
        user={user}
        onLogout={handleLogout}
        onBackToHome={handleBackToHome}
        onUserUpdate={handleUserUpdate}
      />
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="establishments" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="establishments">Estabelecimentos</TabsTrigger>
            <TabsTrigger value="appointments">Meus Agendamentos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="establishments" className="mt-6">
            <div className="space-y-6">
              <ClientDashboardContent
                salons={salons}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                clearSearch={clearSearch}
                handleBookService={handleBookService}
                loading={isRefreshing}
                user={user}
                locationFilter={locationFilter}
                toggleLocationFilter={toggleLocationFilter}
                toggleShowOtherCities={toggleShowOtherCities}
              />
              
              {/* Mostrar agendamentos pendentes abaixo dos filtros */}
              {pendingAppointments.length > 0 && (
                <PendingAppointments
                  clientId={user?.id}
                  appointments={pendingAppointments}
                />
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="appointments" className="mt-6">
            <ClientAppointments 
              appointments={appointments}
              loading={isRefreshing}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ClientDashboard;
