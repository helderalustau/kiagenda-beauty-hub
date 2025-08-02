
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
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
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

  // Calcular valor total incluindo serviços adicionais
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
    <Card className={`border-l-4 border-l-blue-500 hover:shadow-md transition-shadow ${
      appointment.status === 'confirmed' ? 'ring-2 ring-blue-100' : ''
    }`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <User className="h-4 w-4 mr-2 text-blue-500" />
                {appointment.client?.name || appointment.client?.username || 'Cliente'}
              </h4>
              <Badge className={getStatusColor(appointment.status)}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(appointment.status)}
                  <span>{getStatusLabel(appointment.status)}</span>
                </div>
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-semibold text-blue-900">
                    {appointment.appointment_time}
                  </span>
                </div>
                {!compact && (
                  <span className="text-gray-500">
                    {format(new Date(appointment.appointment_date), "dd/MM", { locale: ptBR })}
                  </span>
                )}
              </div>
              
              {appointment.client?.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{appointment.client.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Serviços */}
        <div className="space-y-3 mb-4 bg-gray-50 p-3 rounded-lg">
          {/* Serviço Principal */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-2 text-yellow-500" />
              <span className="font-medium">{appointment.service?.name || 'Serviço'}</span>
              <span className="text-gray-500 ml-2">({appointment.service?.duration_minutes || 0}min)</span>
            </div>
            <span className="font-semibold text-green-600">
              {formatCurrency(appointment.service?.price || 0)}
            </span>
          </div>

          {/* Serviços Adicionais */}
          {hasAdditionalServices && (
            <div className="space-y-2 border-t pt-2">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Plus className="h-3 w-3 mr-1" />
                <span>Serviços Adicionais:</span>
              </div>
              {appointment.additional_services.map((additional: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm pl-4">
                  <span>{additional.name || `Adicional ${index + 1}`}</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(additional.price || 0)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Valor Total */}
          <div className="flex items-center justify-between border-t pt-2 font-bold">
            <span className="text-gray-900">Total:</span>
            <span className="text-green-600 text-lg">
              {formatCurrency(totalValue)}
            </span>
          </div>
        </div>

        {/* Observações */}
        {appointment.notes && (
          <div className="mb-4 p-2 bg-blue-50 rounded text-sm">
            <strong>Observações:</strong> {appointment.notes}
          </div>
        )}

        {/* Ações */}
        {showActions && (
          <div className="space-y-2">
            {appointment.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate('confirmed')}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}

            {appointment.status === 'confirmed' && (
              <Button
                size="lg"
                onClick={() => handleStatusUpdate('completed')}
                disabled={isUpdating}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-3 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                ✨ CONCLUIR ATENDIMENTO ✨
                <span className="ml-2 text-sm bg-white/20 px-2 py-1 rounded">
                  {formatCurrency(totalValue)}
                </span>
              </Button>
            )}

            {appointment.status === 'completed' && (
              <div className="text-center py-2">
                <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Atendimento Concluído</span>
                  <span className="bg-green-100 px-2 py-1 rounded text-sm">
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
