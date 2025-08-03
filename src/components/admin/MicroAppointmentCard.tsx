
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, CheckCircle2, XCircle } from "lucide-react";
import { Appointment } from '@/types/supabase-entities';

interface MicroAppointmentCardProps {
  appointment: Appointment;
  onUpdateStatus?: (id: string, status: string) => Promise<void>;
  showActions?: boolean;
}

const MicroAppointmentCard = ({ 
  appointment, 
  onUpdateStatus, 
  showActions = true 
}: MicroAppointmentCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  console.log('🎯 MicroAppointmentCard - Renderizando:', {
    appointmentId: appointment.id,
    currentStatus: appointment.status,
    hasUpdateFunction: !!onUpdateStatus
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!onUpdateStatus) {
      console.warn('⚠️ onUpdateStatus function not available');
      return;
    }

    if (isUpdating) {
      console.warn('⚠️ Already updating, please wait');
      return;
    }
    
    console.log('🔄 MicroCard: Iniciando update de status:', { 
      appointmentId: appointment.id, 
      currentStatus: appointment.status, 
      newStatus 
    });
    
    setIsUpdating(true);
    try {
      await onUpdateStatus(appointment.id, newStatus);
      console.log('✅ MicroCard: Status atualizado com sucesso');
    } catch (error) {
      console.error('❌ MicroCard: Erro ao atualizar status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className={`border shadow-sm mb-1 hover:shadow-md transition-all ${getStatusColor(appointment.status)}`}>
      <CardContent className="p-1.5">
        {/* Linha 1: Hora e Status */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <Clock className="h-2 w-2 text-blue-600" />
            <span className="font-bold text-xs text-blue-900">{appointment.appointment_time}</span>
          </div>
          <Badge className="text-xs px-1 py-0 h-3 bg-gray-100">
            {appointment.status === 'pending' && 'P'}
            {appointment.status === 'confirmed' && 'C'}
            {appointment.status === 'completed' && '✓'}
            {appointment.status === 'cancelled' && 'X'}
          </Badge>
        </div>

        {/* Linha 2: Cliente */}
        <div className="flex items-center gap-1 mb-1">
          <User className="h-2 w-2 text-gray-500" />
          <span className="font-medium text-xs truncate text-gray-900">
            {appointment.client?.name || 'Cliente'}
          </span>
        </div>

        {/* Linha 3: Serviço e Preço */}
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="truncate font-medium text-gray-700">
            {appointment.service?.name}
          </span>
          <span className="font-bold text-green-600 ml-1">
            {formatCurrency(appointment.service?.price || 0)}
          </span>
        </div>

        {/* Botões de Ação Ultra Compactos */}
        {showActions && !isUpdating && (
          <>
            {appointment.status === 'pending' && (
              <div className="flex gap-0.5">
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate('confirmed')}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1 h-4 text-xs px-1 py-0"
                >
                  <CheckCircle2 className="h-2 w-2" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleStatusUpdate('cancelled')}
                  className="flex-1 h-4 text-xs px-1 py-0"
                >
                  <XCircle className="h-2 w-2" />
                </Button>
              </div>
            )}

            {appointment.status === 'confirmed' && (
              <Button
                size="sm"
                onClick={() => handleStatusUpdate('completed')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-4 text-xs font-bold py-0"
              >
                <CheckCircle2 className="h-2 w-2 mr-0.5" />
                FINALIZAR
              </Button>
            )}

            {appointment.status === 'completed' && (
              <div className="text-center">
                <span className="text-xs text-green-600 font-bold">✅ CONCLUÍDO</span>
              </div>
            )}

            {appointment.status === 'cancelled' && (
              <div className="text-center">
                <span className="text-xs text-red-600 font-bold">❌ CANCELADO</span>
              </div>
            )}
          </>
        )}

        {isUpdating && (
          <div className="flex items-center justify-center py-1">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            <span className="ml-1 text-xs text-blue-600">Atualizando...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MicroAppointmentCard;
