
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Clock, Calendar } from "lucide-react";
import { Appointment } from '@/types/supabase-entities';

interface AppointmentStatusManagerProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (appointmentId: string, status: 'confirmed' | 'completed' | 'cancelled', notes?: string) => void;
  isUpdating: boolean;
}

const AppointmentStatusManager = ({ 
  appointment, 
  isOpen, 
  onClose, 
  onUpdateStatus, 
  isUpdating 
}: AppointmentStatusManagerProps) => {
  const [notes, setNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'confirmed' | 'completed' | 'cancelled' | null>(null);

  const handleStatusUpdate = (status: 'confirmed' | 'completed' | 'cancelled') => {
    if (!appointment) return;
    
    setSelectedStatus(status);
    onUpdateStatus(appointment.id, status, notes);
    setNotes('');
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Status do Agendamento</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações do Agendamento */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                {appointment.client?.name || appointment.client?.username || 'Cliente'}
              </h3>
              <Badge className={getStatusColor(appointment.status)}>
                {getStatusLabel(appointment.status)}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(appointment.appointment_date).toLocaleDateString('pt-BR')}</span>
                <Clock className="h-4 w-4 ml-2" />
                <span>{appointment.appointment_time}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium">Serviço:</span>
                <span>{appointment.service?.name || 'Serviço'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium">Valor:</span>
                <span className="text-green-600 font-semibold">
                  {formatCurrency(appointment.service?.price || 0)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-medium">Duração:</span>
                <span>{appointment.service?.duration_minutes || 0} min</span>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre o agendamento..."
              rows={3}
              className="mt-2"
            />
          </div>

          {/* Botões de Ação */}
          <div className="space-y-3">
            {appointment.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleStatusUpdate('confirmed')}
                  disabled={isUpdating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmar
                </Button>
                <Button
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={isUpdating}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}

            {appointment.status === 'confirmed' && (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={isUpdating}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marcar como Concluído
                </Button>
                <Button
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={isUpdating}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}

            {appointment.status === 'completed' && (
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Agendamento Concluído</span>
                </div>
              </div>
            )}

            {appointment.status === 'cancelled' && (
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">Agendamento Cancelado</span>
                </div>
              </div>
            )}
          </div>

          {/* Botão Fechar */}
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="w-full"
            disabled={isUpdating}
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentStatusManager;
