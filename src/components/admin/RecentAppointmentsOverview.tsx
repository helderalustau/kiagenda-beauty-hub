import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Eye, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from '@/types/supabase-entities';

interface RecentAppointmentsOverviewProps {
  appointments: Appointment[];
  onUpdateStatus: (id: string, status: 'confirmed' | 'completed' | 'cancelled') => void;
  onViewDetails?: (appointment: Appointment) => void;
}

const RecentAppointmentsOverview = ({ 
  appointments, 
  onUpdateStatus, 
  onViewDetails 
}: RecentAppointmentsOverviewProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">⏳ Pendente</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">✅ Confirmado</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">🎉 Concluído</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">❌ Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
      return format(localDate, "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  if (appointments.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Agendamentos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <div className="text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Nenhum agendamento recente</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Agendamentos Recentes ({appointments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {appointments.slice(0, 8).map((appointment) => (
          <div 
            key={appointment.id} 
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-900 text-sm">
                  {getClientName(appointment)}
                </span>
              </div>
              <div className="text-xs text-gray-600 mb-1">
                {getServiceName(appointment)}
              </div>
              <div className="flex items-center space-x-3 text-xs text-gray-500">
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
            
            <div className="flex items-center space-x-2">
              {getStatusBadge(appointment.status)}
              
              {appointment.status === 'pending' && (
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateStatus(appointment.id, 'confirmed')}
                    className="h-7 w-7 p-0"
                  >
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
                    className="h-7 w-7 p-0"
                  >
                    <XCircle className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {appointment.status === 'confirmed' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus(appointment.id, 'completed')}
                  className="h-7 px-2 text-xs"
                >
                  Concluir
                </Button>
              )}
              
              {onViewDetails && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewDetails(appointment)}
                  className="h-7 w-7 p-0"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
        
        {appointments.length > 8 && (
          <div className="text-center py-2">
            <p className="text-xs text-gray-500">
              Mostrando 8 de {appointments.length} agendamentos
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentAppointmentsOverview;