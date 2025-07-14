
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, CheckCircle, AlertCircle, Star } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from '@/types/supabase-entities';

interface ActiveAppointmentsListProps {
  appointments: Appointment[];
  onUpdateStatus: (appointmentId: string, status: 'confirmed' | 'completed' | 'cancelled') => void;
}

const ActiveAppointmentsList = ({ appointments, onUpdateStatus }: ActiveAppointmentsListProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Aguardando Aprovação',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: <AlertCircle className="h-4 w-4" />
        };
      case 'confirmed':
        return {
          label: 'Confirmado',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <CheckCircle className="h-4 w-4" />
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800',
          icon: <AlertCircle className="h-4 w-4" />
        };
    }
  };

  // Filtrar e ordenar agendamentos ativos (pending e confirmed) por data de criação
  const activeAppointments = appointments
    .filter(apt => apt.status === 'pending' || apt.status === 'confirmed')
    .sort((a, b) => {
      const dateA = new Date(a.created_at || '').getTime();
      const dateB = new Date(b.created_at || '').getTime();
      return dateB - dateA; // Mais recentes primeiro
    });

  if (activeAppointments.length === 0) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
            Agendamentos Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Nenhum agendamento ativo no momento</p>
            <p className="text-gray-400 text-xs mt-1">Novos agendamentos aparecerão aqui</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-blue-600" />
          Agendamentos Ativos
          <Badge variant="secondary" className="ml-2">
            {activeAppointments.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">{/* Scroll para muitos agendamentos */}
        {activeAppointments.map((appointment) => {
          const statusInfo = getStatusInfo(appointment.status);
          
          return (
            <Card key={appointment.id} className="border-l-4 border-l-blue-500 hover:shadow-sm transition-shadow bg-slate-50/50">
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {statusInfo.icon}
                    <Badge className={statusInfo.color} variant="secondary">
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(appointment.created_at || ''), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Informações do Cliente */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-500" />
                      Cliente
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{appointment.client?.name || appointment.client?.username}</p>
                      {appointment.client?.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          {appointment.client.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informações do Serviço */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Star className="h-4 w-4 text-green-500" />
                      Serviço
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{appointment.service?.name}</p>
                      <p className="text-sm text-green-600 font-semibold">
                        {formatCurrency(appointment.service?.price || 0)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {appointment.service?.duration_minutes} minutos
                      </p>
                    </div>
                  </div>
                </div>

                {/* Data e Hora do Agendamento */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {(() => {
                            const [year, month, day] = appointment.appointment_date.split('-');
                            return `${day}/${month}/${year}`;
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{appointment.appointment_time}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                {appointment.notes && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Observações:</strong> {appointment.notes}
                    </p>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="mt-4 flex gap-2">
                  {appointment.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => onUpdateStatus(appointment.id, 'confirmed')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Confirmar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                  
                  {appointment.status === 'confirmed' && (
                    <Button 
                      size="sm" 
                      onClick={() => onUpdateStatus(appointment.id, 'completed')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Marcar como Concluído
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ActiveAppointmentsList;
