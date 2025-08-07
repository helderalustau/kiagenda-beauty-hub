import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, CheckCircle2, XCircle, Calendar } from "lucide-react";

interface SimpleAppointmentCardProps {
  appointment: {
    id: string;
    status: string;
    appointment_date: string;
    appointment_time: string;
    client?: {
      name: string;
      username: string;
      phone?: string;
    };
    service?: {
      name: string;
      price: number;
      duration_minutes: number;
    };
  };
  onUpdateStatus: (id: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => Promise<boolean>;
  isUpdating?: boolean;
  compact?: boolean;
}

const SimpleAppointmentCard = ({ 
  appointment, 
  onUpdateStatus, 
  isUpdating = false,
  compact = false
}: SimpleAppointmentCardProps) => {
  
  const handleStatusUpdate = async (newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    console.log('🎯 SimpleAppointmentCard: INICIANDO ATUALIZAÇÃO DE STATUS:', {
      appointmentId: appointment.id,
      currentStatus: appointment.status,
      newStatus,
      isUpdating,
      timestamp: new Date().toISOString()
    });

    if (isUpdating) {
      console.warn('⚠️ SimpleAppointmentCard: Already updating, ignoring click');
      return;
    }
    
    try {
      console.log('🚀 SimpleAppointmentCard: Chamando onUpdateStatus...');
      const success = await onUpdateStatus(appointment.id, newStatus);
      console.log('✅ SimpleAppointmentCard: RESULTADO DA ATUALIZAÇÃO:', {
        success,
        appointmentId: appointment.id,
        newStatus,
        timestamp: new Date().toISOString()
      });
      
      if (!success) {
        console.error('❌ SimpleAppointmentCard: FALHA NA ATUALIZAÇÃO - success = false');
      }
    } catch (error) {
      console.error('❌ SimpleAppointmentCard: ERRO DURANTE ATUALIZAÇÃO:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-50 border-green-200 text-green-800';
      case 'cancelled': return 'bg-red-50 border-red-200 text-red-800';
      case 'completed': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      'confirmed': { label: 'Confirmado', color: 'bg-green-100 text-green-800' },
      'completed': { label: 'Concluído', color: 'bg-blue-100 text-blue-800' },
      'cancelled': { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
    };
    
    const variant = variants[status as keyof typeof variants] || variants.pending;
    return (
      <Badge className={`${variant.color} text-xs`}>
        {variant.label}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (compact) {
    return (
      <Card className={`border shadow-sm mb-1 hover:shadow-md transition-all ${getStatusColor(appointment.status)}`}>
        <CardContent className="p-2">
          {/* Cabeçalho compacto */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-blue-600" />
              <span className="font-bold text-xs">{appointment.appointment_time}</span>
            </div>
            {getStatusBadge(appointment.status)}
          </div>

          {/* Informações do cliente e serviço em linha única */}
          <div className="flex items-center justify-between mb-1 text-xs">
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <User className="h-3 w-3 text-gray-500 flex-shrink-0" />
              <span className="font-medium truncate">
                {appointment.client?.name || appointment.client?.username || 'Cliente'}
              </span>
            </div>
            <span className="font-bold text-green-600 text-xs ml-1">
              {formatCurrency(appointment.service?.price || 0)}
            </span>
          </div>

          {/* Nome do serviço */}
          <div className="text-xs text-gray-600 mb-2 truncate">
            {appointment.service?.name}
          </div>

          {/* Botões de ação compactos */}
          {!isUpdating && (
            <>
              {appointment.status === 'pending' && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate('confirmed')}
                    className="bg-green-600 hover:bg-green-700 text-white flex-1 h-6 text-xs px-1"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStatusUpdate('cancelled')}
                    className="flex-1 h-6 text-xs px-1"
                  >
                    <XCircle className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {appointment.status === 'confirmed' && (
                <Button
                  size="sm"
                  onClick={() => {
                    console.log('🔥 BOTÃO CONCLUIR CLICADO!', { appointmentId: appointment.id, status: appointment.status });
                    handleStatusUpdate('completed');
                  }}
                  disabled={isUpdating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-6 text-xs font-bold"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  CONCLUIR
                </Button>
              )}

              {appointment.status === 'completed' && (
                <div className="text-center py-1">
                  <span className="text-blue-600 font-bold text-xs">✅ CONCLUÍDO</span>
                </div>
              )}

              {appointment.status === 'cancelled' && (
                <div className="text-center py-1">
                  <span className="text-red-600 font-bold text-xs">❌ CANCELADO</span>
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
  }

  return (
    <Card className={`border shadow-sm mb-3 hover:shadow-md transition-all ${getStatusColor(appointment.status)}`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-bold text-lg">{appointment.appointment_time}</p>
              <p className="text-sm text-gray-600">{formatDate(appointment.appointment_date)}</p>
            </div>
          </div>
          {getStatusBadge(appointment.status)}
        </div>

        {/* Client info */}
        <div className="flex items-center gap-2 mb-3">
          <User className="h-4 w-4 text-gray-500" />
          <div>
            <p className="font-medium">{appointment.client?.name || appointment.client?.username || 'Cliente'}</p>
            {appointment.client?.phone && (
              <p className="text-sm text-gray-600">{appointment.client.phone}</p>
            )}
          </div>
        </div>

        {/* Service info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{appointment.service?.name}</p>
              <p className="text-sm text-gray-600">
                Duração: {appointment.service?.duration_minutes || 0} min
              </p>
            </div>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(appointment.service?.price || 0)}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        {!isUpdating && (
          <div className="space-y-2">
            {appointment.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleStatusUpdate('confirmed')}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmar Agendamento
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleStatusUpdate('cancelled')}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}

            {appointment.status === 'confirmed' && (
              <Button
                onClick={() => handleStatusUpdate('completed')}
                disabled={isUpdating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-3"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                {isUpdating ? 'FINALIZANDO ATENDIMENTO...' : 'FINALIZAR ATENDIMENTO'}
              </Button>
            )}

            {appointment.status === 'completed' && (
              <div className="text-center py-2">
                <span className="text-blue-600 font-bold">✅ ATENDIMENTO CONCLUÍDO</span>
              </div>
            )}

            {appointment.status === 'cancelled' && (
              <div className="text-center py-2">
                <span className="text-red-600 font-bold">❌ AGENDAMENTO CANCELADO</span>
              </div>
            )}
          </div>
        )}

        {isUpdating && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-blue-600 font-medium">Atualizando status...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleAppointmentCard;