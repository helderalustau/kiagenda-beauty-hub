
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, MapPin, User, Phone, CheckCircle, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from '@/types/supabase-entities';

interface ActiveAppointmentCardProps {
  appointment: Appointment;
}

const ActiveAppointmentCard = ({ appointment }: ActiveAppointmentCardProps) => {
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
      return format(localDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return dateString;
    }
  };

  const formatCreatedAt = (dateString: string) => {
    try {
      // For created_at, use parseISO since it includes time
      const date = parseISO(dateString);
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      console.error('Error formatting created_at:', dateString, error);
      return dateString;
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Aguardando Aprovação',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          cardColor: 'border-orange-200 bg-orange-50/50',
          icon: <AlertCircle className="h-5 w-5 text-orange-600" />
        };
      case 'confirmed':
        return {
          label: 'Confirmado',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          cardColor: 'border-blue-200 bg-blue-50/50',
          icon: <CheckCircle className="h-5 w-5 text-blue-600" />
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          cardColor: 'border-gray-200 bg-gray-50/50',
          icon: <AlertCircle className="h-5 w-5 text-gray-600" />
        };
    }
  };

  const statusInfo = getStatusInfo(appointment.status);

  return (
    <Card className={`${statusInfo.cardColor} hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center text-gray-800">
            <MapPin className="h-5 w-5 mr-2" />
            {appointment.salon?.name || 'Estabelecimento'}
          </CardTitle>
          <div className="flex items-center">
            {statusInfo.icon}
            <Badge variant="secondary" className={`ml-2 ${statusInfo.color}`}>
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center text-gray-700">
            <User className="h-4 w-4 mr-2 text-gray-500" />
            <span className="font-medium">{appointment.service?.name}</span>
            <span className="ml-2 text-sm text-gray-600">
              - {formatCurrency(appointment.service?.price || 0)}
            </span>
          </div>
          
          <div className="flex items-center text-gray-700">
            <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
            <span>
              {formatAppointmentDate(appointment.appointment_date)}
            </span>
          </div>
          
          <div className="flex items-center text-gray-700">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span>{appointment.appointment_time}</span>
            {appointment.service?.duration_minutes && (
              <span className="text-sm text-gray-500 ml-2">
                ({appointment.service.duration_minutes} min)
              </span>
            )}
          </div>

          {/* Status-specific information */}
          {appointment.status === 'pending' && (
            <div className="bg-orange-100/50 p-3 rounded-lg border border-orange-200">
              <h4 className="text-sm font-medium text-orange-800 mb-2">Status:</h4>
              <p className="text-sm text-orange-700">
                Seu agendamento foi enviado e está aguardando aprovação do estabelecimento.
              </p>
            </div>
          )}

          {appointment.status === 'confirmed' && (
            <div className="bg-blue-100/50 p-3 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Status:</h4>
              <p className="text-sm text-blue-700">
                Agendamento confirmado! Compareça no horário marcado.
              </p>
              {appointment.salon?.phone && (
                <div className="flex items-center text-sm text-blue-700 mt-2">
                  <Phone className="h-3 w-3 mr-2" />
                  <span><strong>Contato:</strong> {appointment.salon.phone}</span>
                </div>
              )}
            </div>
          )}

          {appointment.notes && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Observações:</strong> {appointment.notes}
              </p>
            </div>
          )}
          
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
            Solicitado em {appointment.created_at ? formatCreatedAt(appointment.created_at) : 'Data não disponível'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveAppointmentCard;
