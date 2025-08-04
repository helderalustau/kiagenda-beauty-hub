import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, Mail, DollarSign, Timer } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from '@/types/supabase-entities';

interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

const AppointmentDetailsModal = ({ appointment, isOpen, onClose }: AppointmentDetailsModalProps) => {
  if (!appointment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalhes do Agendamento</span>
            <Badge className={getStatusColor(appointment.status)}>
              {getStatusText(appointment.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Cliente */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              Cliente
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-gray-500" />
                <span className="font-medium">
                  {(appointment as any).client?.name || (appointment as any).client?.username || 'Cliente'}
                </span>
              </div>
              
              {(appointment as any).client?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-700">{(appointment as any).client.phone}</span>
                </div>
              )}
              
              {(appointment as any).client?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-700">{(appointment as any).client.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Informações do Serviço */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Serviço</h3>
            
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <div className="font-medium text-gray-900">
                {(appointment as any).service?.name || 'Serviço'}
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3 text-green-500" />
                  <span className="font-semibold text-green-600">
                    {formatCurrency((appointment as any).service?.price || 0)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Timer className="h-3 w-3 text-blue-500" />
                  <span>{(appointment as any).service?.duration_minutes || 60} min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Data e Hora */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Data e Hora</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">
                  {format(new Date(appointment.appointment_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{appointment.appointment_time}</span>
              </div>
            </div>
          </div>

          {/* Observações */}
          {appointment.notes && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Observações</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-700 text-sm">{appointment.notes}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailsModal;