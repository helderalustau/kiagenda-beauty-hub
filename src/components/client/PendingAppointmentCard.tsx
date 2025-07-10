
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, MapPin, User, Phone } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from '@/types/supabase-entities';

interface PendingAppointmentCardProps {
  appointment: Appointment;
}

const PendingAppointmentCard = ({ appointment }: PendingAppointmentCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // FIX: Corrigir formatação de data para exibir corretamente
  const formatAppointmentDate = (dateString: string) => {
    try {
      // Para appointment_date (formato YYYY-MM-DD), criar data local sem conversão de timezone
      const dateParts = dateString.split('-');
      if (dateParts.length === 3) {
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // Month é 0-indexed
        const day = parseInt(dateParts[2], 10);
        const localDate = new Date(year, month, day);
        return format(localDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      }
      
      // Fallback para outros formatos
      const date = new Date(dateString + 'T00:00:00');
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      console.error('Error formatting appointment date:', dateString, error);
      return dateString;
    }
  };

  const formatCreatedAt = (dateString: string) => {
    try {
      // Para created_at, usar parseISO pois inclui horário
      const date = parseISO(dateString);
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      console.error('Error formatting created_at:', dateString, error);
      return dateString;
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50/50 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center text-orange-800">
            <MapPin className="h-5 w-5 mr-2" />
            {appointment.salon?.name || 'Estabelecimento'}
          </CardTitle>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Aguardando Aprovação
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center text-gray-700">
            <User className="h-4 w-4 mr-2 text-orange-600" />
            <span className="font-medium">{appointment.service?.name}</span>
            <span className="ml-2 text-sm text-orange-600">
              - {formatCurrency(appointment.service?.price || 0)}
            </span>
          </div>
          
          <div className="flex items-center text-gray-700">
            <CalendarIcon className="h-4 w-4 mr-2 text-orange-600" />
            <span>
              {formatAppointmentDate(appointment.appointment_date)}
            </span>
          </div>
          
          <div className="flex items-center text-gray-700">
            <Clock className="h-4 w-4 mr-2 text-orange-600" />
            <span>{appointment.appointment_time}</span>
            {appointment.service?.duration_minutes && (
              <span className="text-sm text-gray-500 ml-2">
                ({appointment.service.duration_minutes} min)
              </span>
            )}
          </div>

          {/* Informações do Cliente */}
          <div className="bg-orange-100/50 p-3 rounded-lg border border-orange-200">
            <h4 className="text-sm font-medium text-orange-800 mb-2">Dados da Solicitação:</h4>
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-700">
                <User className="h-3 w-3 mr-2 text-orange-600" />
                <span><strong>Nome:</strong> {appointment.client?.name || appointment.client?.username}</span>
              </div>
              {appointment.client?.phone && (
                <div className="flex items-center text-sm text-gray-700">
                  <Phone className="h-3 w-3 mr-2 text-orange-600" />
                  <span><strong>Telefone:</strong> {appointment.client.phone}</span>
                </div>
              )}
            </div>
          </div>

          {appointment.notes && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Observações:</strong> {appointment.notes}
              </p>
            </div>
          )}
          
          <div className="text-xs text-orange-600 pt-2 border-t border-orange-200">
            Solicitado em {appointment.created_at ? formatCreatedAt(appointment.created_at) : 'Data não disponível'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingAppointmentCard;
