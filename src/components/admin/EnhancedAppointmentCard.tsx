
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Phone, CheckCircle2, XCircle, AlertCircle, Star, Plus } from "lucide-react";
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
  compact = false 
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Concluído';
      default: return 'Pendente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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
      console.log('🔄 Atualizando status do card:', { appointmentId: appointment.id, newStatus });
      await onUpdateStatus(appointment.id, newStatus);
      console.log('✅ Status atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const totalValue = calculateTotalValue();
  const hasAdditionalServices = appointment.additional_services && 
    Array.isArray(appointment.additional_services) && 
    appointment.additional_services.length > 0;

  return (
    <Card className="border-l-2 border-l-blue-500 hover:shadow-sm transition-shadow">
      <CardContent className="p-2 space-y-1">
        {/* Header - Compacto */}
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            <User className="h-2 w-2 mr-1 text-blue-500 flex-shrink-0" />
            <h4 className="font-medium text-xs text-gray-900 truncate">
              {appointment.client?.name || appointment.client?.username || 'Cliente'}
            </h4>
          </div>
          <Badge className={`${getStatusColor(appointment.status)} text-xs px-1 py-0 ml-1 flex-shrink-0`}>
            <div className="flex items-center space-x-0.5">
              {getStatusIcon(appointment.status)}
              <span className="text-xs">{getStatusLabel(appointment.status)}</span>
            </div>
          </Badge>
        </div>

        {/* Horário e Data */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center">
            <Clock className="h-2 w-2 mr-1 text-blue-600" />
            <span className="font-medium text-blue-900">
              {appointment.appointment_time}
            </span>
          </div>
          {!compact && (
            <span className="text-gray-500">
              {format(new Date(appointment.appointment_date), "dd/MM", { locale: ptBR })}
            </span>
          )}
        </div>

        {/* Telefone */}
        {appointment.client?.phone && (
          <div className="flex items-center text-xs">
            <Phone className="h-2 w-2 mr-1 text-gray-400" />
            <span>{appointment.client.phone}</span>
          </div>
        )}

        {/* Serviços - Ultra Compacto */}
        <div className="bg-gray-50 p-1 rounded text-xs">
          {/* Serviço Principal */}
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <Star className="h-2 w-2 mr-0.5 text-yellow-500 flex-shrink-0" />
              <span className="font-medium truncate">{appointment.service?.name || 'Serviço'}</span>
              <span className="text-gray-500 ml-0.5 flex-shrink-0">({appointment.service?.duration_minutes || 0}m)</span>
            </div>
            <span className="font-medium text-green-600 ml-1 flex-shrink-0">
              {formatCurrency(appointment.service?.price || 0)}
            </span>
          </div>

          {/* Serviços Adicionais - Se existir */}
          {hasAdditionalServices && (
            <div className="border-t pt-0.5 mt-0.5 space-y-0.5">
              <div className="flex items-center">
                <Plus className="h-2 w-2 mr-0.5" />
                <span>+{appointment.additional_services.length} adicional(is)</span>
              </div>
            </div>
          )}

          {/* Valor Total */}
          <div className="flex items-center justify-between border-t pt-0.5 mt-0.5 font-bold">
            <span className="text-gray-900">Total:</span>
            <span className="text-green-600">
              {formatCurrency(totalValue)}
            </span>
          </div>
        </div>

        {/* Observações */}
        {appointment.notes && (
          <div className="p-1 bg-blue-50 rounded text-xs">
            <strong>Obs:</strong> {appointment.notes}
          </div>
        )}

        {/* Ações - Compactas */}
        {showActions && (
          <div className="space-y-1">
            {appointment.status === 'pending' && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate('confirmed')}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1 h-6 text-xs px-2"
                >
                  <CheckCircle2 className="h-2 w-2 mr-0.5" />
                  Confirmar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={isUpdating}
                  className="flex-1 h-6 text-xs px-2"
                >
                  <XCircle className="h-2 w-2 mr-0.5" />
                  Cancelar
                </Button>
              </div>
            )}

            {appointment.status === 'confirmed' && (
              <Button
                size="sm"
                onClick={() => handleStatusUpdate('completed')}
                disabled={isUpdating}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold h-7 shadow-md transform hover:scale-105 transition-all duration-200"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                🎉 CONCLUIR 🎉
                <span className="ml-1 text-xs bg-white/20 px-1 py-0.5 rounded font-bold">
                  {formatCurrency(totalValue)}
                </span>
              </Button>
            )}

            {appointment.status === 'completed' && (
              <div className="text-center py-1">
                <div className="flex items-center justify-center gap-2 text-green-600 font-medium text-xs">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Concluído</span>
                  <span className="bg-green-100 px-1 py-0.5 rounded text-xs">
                    {formatCurrency(totalValue)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedAppointmentCard;
