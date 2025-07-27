
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Phone, User } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/types/supabase-entities';

interface ClientAppointmentsProps {
  appointments: Appointment[];
  loading: boolean;
}

const ClientAppointments = ({ appointments, loading }: ClientAppointmentsProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum agendamento encontrado
          </h3>
          <p className="text-gray-600">
            Você ainda não possui agendamentos. Explore os estabelecimentos disponíveis para fazer seu primeiro agendamento.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Separar agendamentos por status
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');
  const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'confirmed':
        return 'Confirmado';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const renderAppointmentCard = (appointment: Appointment) => (
    <Card key={appointment.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {appointment.salon?.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {appointment.service?.name}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {format(new Date(appointment.appointment_date), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{appointment.appointment_time}</span>
              </div>
            </div>
            
            {appointment.salon?.address && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <MapPin className="h-3 w-3" />
                <span>{appointment.salon.address}</span>
              </div>
            )}
            
            {appointment.salon?.phone && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <Phone className="h-3 w-3" />
                <span>{appointment.salon.phone}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
              {getStatusText(appointment.status)}
            </span>
            
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                R$ {appointment.service?.price?.toFixed(2) || '0,00'}
              </p>
              <p className="text-xs text-gray-500">
                {appointment.service?.duration_minutes || 0} min
              </p>
            </div>
          </div>
        </div>
        
        {appointment.notes && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
            <strong>Observações:</strong> {appointment.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Agendamentos Pendentes */}
      {pendingAppointments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Agendamentos Pendentes ({pendingAppointments.length})
          </h2>
          {pendingAppointments.map(renderAppointmentCard)}
        </div>
      )}

      {/* Agendamentos Confirmados */}
      {confirmedAppointments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Agendamentos Confirmados ({confirmedAppointments.length})
          </h2>
          {confirmedAppointments.map(renderAppointmentCard)}
        </div>
      )}

      {/* Agendamentos Concluídos */}
      {completedAppointments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Histórico - Concluídos ({completedAppointments.length})
          </h2>
          {completedAppointments.map(renderAppointmentCard)}
        </div>
      )}

      {/* Agendamentos Cancelados */}
      {cancelledAppointments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Histórico - Cancelados ({cancelledAppointments.length})
          </h2>
          {cancelledAppointments.map(renderAppointmentCard)}
        </div>
      )}
    </div>
  );
};

export default ClientAppointments;
