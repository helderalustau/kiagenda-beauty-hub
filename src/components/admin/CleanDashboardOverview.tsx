import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Users, 
  DollarSign,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment, Service, Salon, AdminUser } from '@/hooks/useSupabaseData';

interface CleanDashboardOverviewProps {
  appointments: Appointment[];
  services: Service[];
  salon: Salon;
  adminUsers: AdminUser[];
  onUpdateStatus: (id: string, status: 'confirmed' | 'completed' | 'cancelled') => void;
}

const CleanDashboardOverview = ({ 
  appointments, 
  services, 
  salon, 
  adminUsers,
  onUpdateStatus 
}: CleanDashboardOverviewProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">Pendente</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Confirmado</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">Concluído</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Cancelado</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  const getClientName = (appointment: Appointment) => {
    if (appointment.client?.name) return appointment.client.name;
    if (appointment.client?.username) return appointment.client.username;
    return 'Cliente';
  };

  const getServiceName = (appointment: Appointment) => {
    if ((appointment as any).service?.name) return (appointment as any).service.name;
    return 'Serviço';
  };

  const formatAppointmentDate = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const localDate = new Date(year, month - 1, day);
      return format(localDate, "dd/MM", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Estatísticas básicas
  const todayAppointments = appointments.filter(apt => {
    const today = new Date();
    const appointmentDate = new Date(apt.appointment_date);
    return appointmentDate.toDateString() === today.toDateString();
  });

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');

  const totalRevenue = completedAppointments.reduce((total, apt) => {
    return total + ((apt as any).service?.price || 0);
  }, 0);

  // Agendamentos recentes (últimos 5)
  const recentAppointments = appointments
    .filter(apt => apt.status === 'pending' || apt.status === 'confirmed')
    .sort((a, b) => {
      const dateA = new Date(a.appointment_date + 'T' + a.appointment_time);
      const dateB = new Date(b.appointment_date + 'T' + b.appointment_time);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Estatísticas em Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingAppointments.length}</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmados</p>
                <p className="text-2xl font-bold text-green-600">{confirmedAppointments.length}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Agendamentos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            Próximos Agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Nenhum agendamento próximo</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAppointments.map((appointment) => (
                <div 
                  key={appointment.id} 
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {getClientName(appointment)}
                      </div>
                      <div className="text-xs text-gray-600">
                        {getServiceName(appointment)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-xs text-gray-500">
                      {formatAppointmentDate(appointment.appointment_date)} às {appointment.appointment_time}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(appointment.status)}
                      
                      {appointment.status === 'pending' && (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            onClick={() => onUpdateStatus(appointment.id, 'confirmed')}
                            className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
                            className="h-6 w-6 p-0 bg-red-600 hover:bg-red-700"
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      
                      {appointment.status === 'confirmed' && (
                        <Button
                          size="sm"
                          onClick={() => onUpdateStatus(appointment.id, 'completed')}
                          className="h-6 px-2 text-xs bg-blue-600 hover:bg-blue-700"
                        >
                          Concluir
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CleanDashboardOverview;