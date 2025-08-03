
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Phone, CheckCircle2, XCircle, AlertCircle, Star } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from '@/hooks/useSupabaseData';

interface EnhancedAppointmentCardProps {
  appointment: Appointment;
  onUpdateStatus?: (id: string, status: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

const EnhancedAppointmentCard = ({ 
  appointment, 
  onUpdateStatus, 
  showActions = true,
  compact = true 
}: EnhancedAppointmentCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="h-2 w-2 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-2 w-2 text-red-600" />;
      case 'completed':
        return <CheckCircle2 className="h-2 w-2 text-blue-600" />;
      default:
        return <AlertCircle className="h-2 w-2 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateTotalValue = () => {
    let total = appointment.service?.price || 0;
    
    if (appointment.additional_services && Array.isArray(appointment.additional_services)) {
      const additionalTotal = appointment.additional_services.reduce((sum: number, additional: any) => {
        return sum + (Number(additional?.price || 0));
      }, 0);
      total += additionalTotal;
    }
    
    return total;
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!onUpdateStatus || isUpdating) return;
    
    setIsUpdating(true);
    try {
      console.log('🔄 Card: Atualizando status:', { appointmentId: appointment.id, newStatus });
      await onUpdateStatus(appointment.id, newStatus);
      console.log('✅ Card: Status atualizado com sucesso');
    } catch (error) {
      console.error('❌ Card: Erro ao atualizar status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const totalValue = calculateTotalValue();

  return (
    <Card className="border border-gray-200 shadow-sm mb-1 hover:shadow-md transition-all">
      <CardContent className="p-2">
        {/* Header ultra compacto */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center min-w-0 flex-1 gap-1">
            <User className="h-2.5 w-2.5 text-blue-500 flex-shrink-0" />
            <span className="font-medium text-xs truncate text-gray-900">
              {appointment.client?.name || 'Cliente'}
            </span>
          </div>
          <Badge className={`${getStatusColor(appointment.status)} text-xs px-1 py-0 flex-shrink-0`}>
            <div className="flex items-center gap-0.5">
              {getStatusIcon(appointment.status)}
              <span className="text-xs">
                {appointment.status === 'pending' && 'Pend'}
                {appointment.status === 'confirmed' && 'Conf'}
                {appointment.status === 'completed' && 'Concl'}
                {appointment.status === 'cancelled' && 'Canc'}
              </span>
            </div>
          </Badge>
        </div>

        {/* Data e hora */}
        <div className="flex items-center justify-between text-xs mb-1">
          <div className="flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5 text-blue-600" />
            <span className="font-medium text-blue-900">{appointment.appointment_time}</span>
          </div>
          <span className="text-gray-500 text-xs">
            {format(new Date(appointment.appointment_date), "dd/MM", { locale: ptBR })}
          </span>
        </div>

        {/* Telefone compacto */}
        {appointment.client?.phone && (
          <div className="flex items-center gap-0.5 text-xs mb-1">
            <Phone className="h-2.5 w-2.5 text-gray-400" />
            <span className="text-gray-600">{appointment.client.phone}</span>
          </div>
        )}

        {/* Serviço compacto */}
        <div className="bg-gray-50 p-1 rounded text-xs mb-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1 gap-0.5">
              <Star className="h-2.5 w-2.5 text-yellow-500 flex-shrink-0" />
              <span className="font-medium truncate">{appointment.service?.name}</span>
              <span className="text-gray-500 flex-shrink-0">({appointment.service?.duration_minutes}m)</span>
            </div>
            <span className="font-bold text-green-600 ml-1 flex-shrink-0">
              {formatCurrency(totalValue)}
            </span>
          </div>
        </div>

        {/* Observações compactas */}
        {appointment.notes && (
          <div className="p-1 bg-blue-50 rounded text-xs mb-1">
            <strong>Obs:</strong> {appointment.notes.substring(0, 50)}{appointment.notes.length > 50 ? '...' : ''}
          </div>
        )}

        {/* Ações ultra compactas */}
        {showActions && (
          <div className="space-y-0.5">
            {appointment.status === 'pending' && (
              <div className="flex gap-0.5">
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate('confirmed')}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1 h-5 text-xs px-1"
                >
                  <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                  OK
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={isUpdating}
                  className="flex-1 h-5 text-xs px-1"
                >
                  <XCircle className="h-2.5 w-2.5 mr-0.5" />
                  X
                </Button>
              </div>
            )}

            {appointment.status === 'confirmed' && (
              <Button
                size="sm"
                onClick={() => handleStatusUpdate('completed')}
                disabled={isUpdating}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-6 text-xs"
              >
                <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                🎉 CONCLUIR ({formatCurrency(totalValue)})
              </Button>
            )}

            {appointment.status === 'completed' && (
              <div className="text-center py-0.5">
                <span className="text-xs text-green-600 font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  CONCLUÍDO - {formatCurrency(totalValue)}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedAppointmentCard;
