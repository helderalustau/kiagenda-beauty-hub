
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, User, Scissors, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from '@/types/supabase-entities';

interface RecentAppointmentsTableProps {
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
}

const RecentAppointmentsTable = ({ appointments, onAppointmentClick }: RecentAppointmentsTableProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      confirmed: { label: 'Confirmado', className: 'bg-blue-100 text-blue-800 border-blue-300' },
      completed: { label: 'Concluído', className: 'bg-green-100 text-green-800 border-green-300' },
      cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800 border-red-300' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={`text-xs px-2 py-1 border ${config.className}`}>
        <div className="flex items-center gap-1">
          {getStatusIcon(status)}
          {config.label}
        </div>
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

  if (appointments.length === 0) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 font-medium">Nenhum agendamento encontrado</p>
          <p className="text-gray-500 text-sm">Os agendamentos aparecerão aqui quando criados</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
          <Calendar className="h-5 w-5 text-blue-600" />
          Agendamentos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold text-slate-700 py-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Cliente
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 py-3">
                  <div className="flex items-center gap-2">
                    <Scissors className="h-4 w-4" />
                    Serviço
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 py-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data Agendada
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 py-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horário
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 py-3">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.slice(0, 10).map((appointment) => (
                <TableRow
                  key={appointment.id}
                  className="hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100"
                  onClick={() => onAppointmentClick?.(appointment)}
                >
                  <TableCell className="py-3">
                    <div className="font-medium text-slate-900">
                      {getClientName(appointment)}
                    </div>
                    {(appointment as any).client?.phone && (
                      <div className="text-sm text-slate-500">
                        {(appointment as any).client.phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="font-medium text-slate-800">
                      {getServiceName(appointment)}
                    </div>
                    <div className="text-sm text-slate-500">
                      {(appointment as any).service?.duration_minutes || 0} min
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="font-medium text-slate-900">
                      {format(new Date(appointment.appointment_date), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                    <div className="text-sm text-slate-500">
                      {format(new Date(appointment.appointment_date), "EEEE", { locale: ptBR })}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="font-medium text-slate-900">
                      {appointment.appointment_time}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    {getStatusBadge(appointment.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentAppointmentsTable;
