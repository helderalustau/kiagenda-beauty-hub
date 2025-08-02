
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
        return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-3 w-3 text-red-600" />;
      case 'completed':
        return <CheckCircle2 className="h-3 w-3 text-blue-600" />;
      default:
        return <AlertCircle className="h-3 w-3 text-yellow-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'cancelled':
        return 'Cancelado';
      case 'completed':
        return 'Concluído';
      default:
        return 'Pendente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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
      await onUpdateStatus(appointment.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const totalValue = calculateTotalValue();
  const hasAdditionalServices = appointment.additional_services && 
    Array.isArray(appointment.additional_services) && 
    appointment.additional_services.length > 0;

  return (
    <Card className={`border-l-4 border-l-blue-500 hover:shadow-sm transition-shadow ${
      appointment.status === 'confirmed' ? 'ring-1 ring-blue-100' : ''
    }`}>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-sm text-gray-900 flex items-center truncate">
                <User className="h-3 w-3 mr-1 text-blue-500 flex-shrink-0" />
                {appointment.client?.name || appointment.client?.username || 'Cliente'}
              </h4>
              <Badge className={`${getStatusColor(appointment.status)} text-xs px-2 py-0.5 ml-2 flex-shrink-0`}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(appointment.status)}
                  <span className="text-xs">{getStatusLabel(appointment.status)}</span>
                </div>
              </Badge>
            </div>
            
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-blue-600" />
                  <span className="font-semibold text-blue-900 text-xs">
                    {appointment.appointment_time}
                  </span>
                </div>
                {!compact && (
                  <span className="text-gray-500 text-xs">
                    {format(new Date(appointment.appointment_date), "dd/MM", { locale: ptBR })}
                  </span>
                )}
              </div>
              
              {appointment.client?.phone && (
                <div className="flex items-center">
                  <Phone className="h-3 w-3 mr-1 text-gray-400" />
                  <span className="text-xs">{appointment.client.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Serviços - Compacto */}
        <div className="bg-gray-50 p-2 rounded text-xs space-y-1">
          {/* Serviço Principal */}
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <Star className="h-3 w-3 mr-1 text-yellow-500 flex-shrink-0" />
              <span className="font-medium truncate">{appointment.service?.name || 'Serviço'}</span>
              <span className="text-gray-500 ml-1 flex-shrink-0">({appointment.service?.duration_minutes || 0}min)</span>
            </div>
            <span className="font-semibold text-green-600 text-xs ml-2 flex-shrink-0">
              {formatCurrency(appointment.service?.price || 0)}
            </span>
          </div>

          {/* Serviços Adicionais - Compacto */}
          {hasAdditionalServices && (
            <div className="border-t pt-1 space-y-0.5">
              <div className="flex items-center text-xs text-gray-600">
                <Plus className="h-2 w-2 mr-1" />
                <span>Adicionais:</span>
              </div>
              {appointment.additional_services.map((additional: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-xs pl-3">
                  <span className="truncate flex-1">{additional.name || `Adicional ${index + 1}`}</span>
                  <span className="font-medium text-green-600 ml-2 flex-shrink-0">
                    {formatCurrency(additional.price || 0)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Valor Total - Compacto */}
          <div className="flex items-center justify-between border-t pt-1 font-bold">
            <span className="text-gray-900 text-xs">Total:</span>
            <span className="text-green-600 text-sm">
              {formatCurrency(totalValue)}
            </span>
          </div>
        </div>

        {/* Observações - Compacto */}
        {appointment.notes && (
          <div className="p-1.5 bg-blue-50 rounded text-xs">
            <strong>Obs:</strong> {appointment.notes}
          </div>
        )}

        {/* Ações - Melhoradas */}
        {showActions && (
          <div className="space-y-1 pt-1">
            {appointment.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate('confirmed')}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1 h-8 text-xs"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Confirmar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={isUpdating}
                  className="flex-1 h-8 text-xs"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Cancelar
                </Button>
              </div>
            )}

            {appointment.status === 'confirmed' && (
              <Button
                size="lg"
                onClick={() => handleStatusUpdate('completed')}
                disabled={isUpdating}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 shadow-lg transform hover:scale-105 transition-all duration-200 animate-pulse"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                🎉 CONCLUIR ATENDIMENTO 🎉
                <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded font-bold">
                  {formatCurrency(totalValue)}
                </span>
              </Button>
            )}

            {appointment.status === 'completed' && (
              <div className="text-center py-2">
                <div className="flex items-center justify-center gap-2 text-green-600 font-semibold text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Atendimento Concluído</span>
                  <span className="bg-green-100 px-2 py-1 rounded text-xs">
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
