
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from '@/hooks/useSupabaseData';

interface AdminAppointmentsSummaryProps {
  appointments: Appointment[];
  selectedDate: Date;
  loading: boolean;
}

const AdminAppointmentsSummary = ({ appointments, selectedDate, loading }: AdminAppointmentsSummaryProps) => {
  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    return aptDate.toDateString() === selectedDate.toDateString();
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'cancelled':
        return 'Cancelado';
      case 'completed':
        return 'Concluído';
      default:
        return 'Pendente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Agendamentos do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando agendamentos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Agendamentos para {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
          </div>
          <Badge variant="outline" className="ml-2">
            {todayAppointments.length} agendamento{todayAppointments.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todayAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhum agendamento para hoje
            </h3>
            <p className="text-gray-500">
              Você está livre para este dia! 🎉
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayAppointments
              .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
              .map((appointment) => (
                <Card key={appointment.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold text-blue-900">
                            {appointment.appointment_time}
                          </span>
                          <Badge className={getStatusColor(appointment.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(appointment.status)}
                              <span>{getStatusLabel(appointment.status)}</span>
                            </div>
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{appointment.client?.name}</span>
                          </div>
                          
                          {appointment.client?.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{appointment.client.phone}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="h-4 w-4 text-gray-400" />
                            <span>{appointment.service?.name}</span>
                            <span className="text-green-600 font-medium">
                              R$ {appointment.service?.price.toFixed(2)}
                            </span>
                          </div>
                          
                          {appointment.notes && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                              <strong>Observações:</strong> {appointment.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {todayAppointments.filter(apt => apt.status === 'confirmed').length}
                  </div>
                  <div className="text-sm text-blue-800">Confirmados</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {todayAppointments.filter(apt => apt.status === 'pending').length}
                  </div>
                  <div className="text-sm text-yellow-800">Pendentes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {todayAppointments.filter(apt => apt.status === 'completed').length}
                  </div>
                  <div className="text-sm text-green-800">Concluídos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {todayAppointments.filter(apt => apt.status === 'cancelled').length}
                  </div>
                  <div className="text-sm text-red-800">Cancelados</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAppointmentsSummary;
