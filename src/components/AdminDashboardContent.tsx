
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Appointment, Service, Salon, AdminUser } from '@/hooks/useSupabaseData';
import DashboardStats from '@/components/DashboardStats';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import ActiveAppointmentsList from '@/components/admin/ActiveAppointmentsList';
import FinancialDashboard from '@/components/admin/FinancialDashboard';
import ServicesPage from '@/pages/ServicesPage';
import SettingsPage from '@/pages/SettingsPage';
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Scissors } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AdminDashboardContentProps {
  appointments: Appointment[];
  services: Service[];
  salon: Salon;
  adminUsers: AdminUser[];
  onRefresh: () => Promise<void>;
}

const AdminDashboardContent = ({
  appointments,
  services,
  salon,
  adminUsers,
  onRefresh
}: AdminDashboardContentProps) => {
  const { updateAppointmentStatus } = useAppointmentData();

  const handleUpdateAppointmentStatus = async (appointmentId: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    await updateAppointmentStatus(appointmentId, status);
    await onRefresh();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // FIX: Parse date string correctly to avoid timezone issues
  const formatAppointmentDate = (dateString: string) => {
    try {
      // Parse the date string as YYYY-MM-DD and treat it as local date
      const [year, month, day] = dateString.split('-').map(Number);
      const localDate = new Date(year, month - 1, day); // month is 0-indexed
      return format(localDate, "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'confirmed':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Confirmado</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Filtrar apenas agendamentos concluídos para o histórico
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');

  return (
    <>
      <TabsContent value="overview" className="space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Visão Geral
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Acompanhe as métricas do seu estabelecimento
          </p>
        </div>
        
        {/* Layout lado a lado para Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardStats 
            appointments={appointments}
            services={services}
            salon={salon}
            adminUsers={adminUsers}
          />

          {/* Lista de Agendamentos Ativos */}
          <ActiveAppointmentsList 
            appointments={appointments}
            onUpdateStatus={handleUpdateAppointmentStatus}
          />
        </div>
      </TabsContent>

      <TabsContent value="calendar" className="space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Agenda Completa
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Visualize e gerencie todos os agendamentos na agenda semanal
          </p>
        </div>
        
        <WeeklyCalendar 
          appointments={appointments}
          onRefresh={onRefresh}
        />

        {/* Histórico de Serviços Realizados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scissors className="h-5 w-5 mr-2" />
              Histórico de Serviços Realizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {completedAppointments.length > 0 ? (
              <div className="space-y-4">
                {completedAppointments
                  .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())
                  .slice(0, 10) // Mostrar apenas os últimos 10
                  .map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-2 rounded-full">
                          <Scissors className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {(appointment as any).service?.name || 'Serviço não identificado'}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {(appointment as any).client_auth?.name || 'Cliente não identificado'}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatAppointmentDate(appointment.appointment_date)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {appointment.appointment_time}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(appointment.status)}
                        <div className="text-sm font-medium text-green-600 mt-1">
                          {formatCurrency((appointment as any).service?.price || 0)}
                        </div>
                      </div>
                    </div>
                  ))}
                
                {completedAppointments.length > 10 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      Mostrando os últimos 10 serviços realizados de {completedAppointments.length} total
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Scissors className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum serviço realizado</h3>
                <p className="text-gray-500">
                  Quando você concluir alguns atendimentos, eles aparecerão aqui.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="financial" className="space-y-4 sm:space-y-6">
        <FinancialDashboard appointments={appointments} />
      </TabsContent>

      <TabsContent value="services" className="space-y-4 sm:space-y-6">
        <ServicesPage 
          services={services}
          onRefresh={onRefresh}
        />
      </TabsContent>

      <TabsContent value="settings" className="space-y-4 sm:space-y-6">
        <SettingsPage 
          salon={salon}
          onRefresh={onRefresh}
        />
      </TabsContent>
    </>
  );
};

export default AdminDashboardContent;
