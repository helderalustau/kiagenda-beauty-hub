
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, AlertCircle, XCircle, TrendingUp } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from '@/hooks/useSupabaseData';
import SimpleAppointmentCard from './admin/SimpleAppointmentCard';

interface AdminAppointmentsSummaryProps {
  appointments: Appointment[];
  selectedDate: Date;
  loading: boolean;
  showFutureOnly?: boolean;
  onUpdateStatus: (id: string, status: string) => Promise<void>;
}

const AdminAppointmentsSummary = ({ 
  appointments, 
  selectedDate, 
  loading, 
  showFutureOnly = false,
  onUpdateStatus 
}: AdminAppointmentsSummaryProps) => {
  
  console.log('📊 AdminAppointmentsSummary - Dados recebidos:', {
    appointmentsCount: appointments.length,
    selectedDate: format(selectedDate, 'dd/MM/yyyy'),
    showFutureOnly
  });

  // Filtrar agendamentos do dia selecionado
  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    return aptDate.toDateString() === selectedDate.toDateString();
  });

  // Próximos agendamentos (hoje e amanhã)
  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    return (isToday(aptDate) || isTomorrow(aptDate)) && apt.status !== 'cancelled';
  }).slice(0, 6);

  // Estatísticas
  const stats = {
    pending: appointments.filter(apt => apt.status === 'pending').length,
    confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
    completed: appointments.filter(apt => apt.status === 'completed').length,
    cancelled: appointments.filter(apt => apt.status === 'cancelled').length
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[1,2,3,4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-3">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Cards de Estatísticas Compactos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-2 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertCircle className="h-3 w-3 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-800">Pendentes</span>
            </div>
            <p className="text-lg font-bold text-yellow-900">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-2 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-800">Confirmados</span>
            </div>
            <p className="text-lg font-bold text-blue-900">{stats.confirmed}</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-2 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium text-green-800">Concluídos</span>
            </div>
            <p className="text-lg font-bold text-green-900">{stats.completed}</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-2 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <XCircle className="h-3 w-3 text-red-600" />
              <span className="text-xs font-medium text-red-800">Cancelados</span>
            </div>
            <p className="text-lg font-bold text-red-900">{stats.cancelled}</p>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Agendamentos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Próximos Agendamentos ({upcomingAppointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          {upcomingAppointments.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">
              Nenhum agendamento próximo
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {upcomingAppointments.map((appointment) => (
              <SimpleAppointmentCard
                key={appointment.id}
                appointment={appointment}
                onUpdateStatus={async (id, status) => {
                  await onUpdateStatus(id, status);
                  return true;
                }}
                compact={true}
              />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAppointmentsSummary;
