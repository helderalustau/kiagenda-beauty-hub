
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Scissors } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from '@/types/supabase-entities';

interface CompactAppointmentsTableProps {
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
}

const CompactAppointmentsTable = ({ appointments, onAppointmentClick }: CompactAppointmentsTableProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      confirmed: { label: 'Confirmado', className: 'bg-blue-100 text-blue-800 border-blue-300' },
      completed: { label: 'Concluído', className: 'bg-green-100 text-green-800 border-green-300' },
      cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800 border-red-300' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={`text-xs px-2 py-1 ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  const getClientName = (appointment: Appointment) => {
    if ((appointment as any).client?.name) return (appointment as any).client.name;
    if ((appointment as any).client_auth?.name) return (appointment as any).client_auth.name;
    if ((appointment as any).client?.username) return (appointment as any).client.username;
    return 'Cliente';
  };

  const getServiceName = (appointment: Appointment) => {
    if ((appointment as any).service?.name) return (appointment as any).service.name;
    if ((appointment as any).services?.name) return (appointment as any).services.name;
    return 'Serviço';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Agrupar agendamentos por data para melhor organização
  const appointmentsByDate = appointments.reduce((acc, appointment) => {
    try {
      const dateKey = format(new Date(appointment.appointment_date), 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(appointment);
    } catch (error) {
      console.error('Error processing appointment date:', appointment, error);
    }
    return acc;
  }, {} as Record<string, Appointment[]>);

  // Ordenar as datas
  const sortedDates = Object.keys(appointmentsByDate).sort();

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Nenhum agendamento encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Agendamentos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {sortedDates.map(dateKey => {
            const dateAppointments = appointmentsByDate[dateKey];
            const displayDate = format(new Date(dateKey), "dd 'de' MMM", { locale: ptBR });
            
            return (
              <div key={dateKey} className="border-b border-gray-100 last:border-b-0">
                {/* Header da Data */}
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-700 capitalize">
                    {displayDate}
                  </span>
                </div>
                
                {/* Agendamentos da Data */}
                <div className="divide-y divide-gray-100">
                  {dateAppointments
                    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => onAppointmentClick?.(appointment)}
                      >
                        <div className="grid grid-cols-12 gap-2 items-center text-sm">
                          {/* Horário */}
                          <div className="col-span-2 flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <span className="font-medium text-gray-900">
                              {appointment.appointment_time}
                            </span>
                          </div>
                          
                          {/* Cliente */}
                          <div className="col-span-3 flex items-center gap-1">
                            <User className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-800 truncate">
                              {getClientName(appointment)}
                            </span>
                          </div>
                          
                          {/* Serviço */}
                          <div className="col-span-3 flex items-center gap-1">
                            <Scissors className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-700 truncate">
                              {getServiceName(appointment)}
                            </span>
                          </div>
                          
                          {/* Valor */}
                          <div className="col-span-2 text-center">
                            <span className="font-medium text-green-600">
                              {formatCurrency((appointment as any).service?.price || 0)}
                            </span>
                          </div>
                          
                          {/* Status */}
                          <div className="col-span-2 flex justify-end">
                            {getStatusBadge(appointment.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactAppointmentsTable;
