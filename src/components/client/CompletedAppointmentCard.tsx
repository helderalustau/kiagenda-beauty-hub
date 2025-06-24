
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, MapPin, User, Star } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from '@/types/supabase-entities';

interface CompletedAppointmentCardProps {
  appointment: Appointment;
}

const CompletedAppointmentCard = ({ appointment }: CompletedAppointmentCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="border-green-200 bg-green-50/50 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center text-green-800">
            <MapPin className="h-5 w-5 mr-2" />
            {appointment.salon?.name || 'Estabelecimento'}
          </CardTitle>
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            Concluído
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center text-gray-700">
            <User className="h-4 w-4 mr-2 text-green-600" />
            <span className="font-medium">{appointment.service?.name}</span>
            <span className="ml-2 text-sm font-semibold text-green-600">
              - {formatCurrency(appointment.service?.price || 0)}
            </span>
          </div>
          
          <div className="flex items-center text-gray-700">
            <CalendarIcon className="h-4 w-4 mr-2 text-green-600" />
            <span>
              {format(new Date(appointment.appointment_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
          
          <div className="flex items-center text-gray-700">
            <Clock className="h-4 w-4 mr-2 text-green-600" />
            <span>{appointment.appointment_time}</span>
            {appointment.service?.duration_minutes && (
              <span className="text-sm text-gray-500 ml-2">
                ({appointment.service.duration_minutes} min)
              </span>
            )}
          </div>

          {/* Status do atendimento concluído */}
          <div className="bg-green-100/50 p-3 rounded-lg border border-green-200">
            <h4 className="text-sm font-medium text-green-800 mb-2">Atendimento Finalizado:</h4>
            <p className="text-sm text-green-700">
              Serviço realizado com sucesso. Obrigado por escolher nossos serviços!
            </p>
          </div>

          {appointment.notes && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Observações:</strong> {appointment.notes}
              </p>
            </div>
          )}

          {/* Botão de avaliação */}
          <div className="pt-2">
            <Button variant="outline" size="sm" className="w-full border-green-200 text-green-600 hover:bg-green-50">
              <Star className="h-4 w-4 mr-2" />
              Avaliar Atendimento
            </Button>
          </div>
          
          <div className="text-xs text-green-600 pt-2 border-t border-green-200">
            Finalizado em {format(new Date(appointment.updated_at || appointment.created_at || ''), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletedAppointmentCard;
