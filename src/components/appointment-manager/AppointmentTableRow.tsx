
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Scissors, RotateCcw } from "lucide-react";
import { Appointment } from '@/hooks/useSupabaseData';

interface AppointmentTableRowProps {
  appointment: Appointment;
  onRestore: (appointmentId: string) => void;
}

const AppointmentTableRow = ({ appointment, onRestore }: AppointmentTableRowProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <TableRow className={appointment.deleted_at ? 'opacity-60' : ''}>
      <TableCell>
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{appointment.client?.name}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Scissors className="h-4 w-4 text-gray-400" />
          <span>{appointment.service?.name}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{formatDate(appointment.appointment_date)}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span>{formatTime(appointment.appointment_time)}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={getStatusColor(appointment.status)}>
          {getStatusLabel(appointment.status)}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="font-semibold text-green-600">
          {formatCurrency(appointment.service?.price || 0)}
        </span>
      </TableCell>
      <TableCell>
        {appointment.deleted_at && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Restaurar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Restauração</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja restaurar este agendamento? 
                  Ele ficará visível novamente para o administrador do estabelecimento.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRestore(appointment.id)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Restaurar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </TableCell>
    </TableRow>
  );
};

export default AppointmentTableRow;
