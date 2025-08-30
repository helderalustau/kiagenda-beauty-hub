import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Phone, CheckCircle2, XCircle, Scissors, Eye } from "lucide-react";
import { Appointment } from '@/types/supabase-entities';
import { useAppointmentParser } from '@/hooks/useAppointmentParser';
import AppointmentDetailsModal from '../AppointmentDetailsModal';
interface EnhancedAppointmentCardProps {
  appointment: Appointment;
  onUpdateAppointment: (id: string, updates: {
    status: string;
    notes?: string;
  }) => Promise<boolean>;
  isUpdating: boolean;
}
const EnhancedAppointmentCard = ({
  appointment,
  onUpdateAppointment,
  isUpdating
}: EnhancedAppointmentCardProps) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [localUpdating, setLocalUpdating] = useState<string | null>(null);
  const {
    parseAppointment,
    formatCurrency
  } = useAppointmentParser();
  console.log('🎯 EnhancedAppointmentCard - Rendering for appointment:', appointment.id, 'Status:', appointment.status);
  
  // Log quando o status do appointment muda
  useEffect(() => {
    console.log('🔄 EnhancedAppointmentCard - Status changed for appointment:', appointment.id, 'New status:', appointment.status);
  }, [appointment.status, appointment.id]);
  
  const parsedAppointment = parseAppointment(appointment);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Aguardando';
      case 'confirmed':
        return 'Confirmado';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };
  return <>
      <Card onClick={() => setShowDetailsModal(true)} className="mb-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary cursor-pointer rounded-sm">
        <CardContent className="p-3 sm:p-6 rounded-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2 rounded-sm">
                <h4 className="font-bold text-foreground flex items-center text-sm">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-primary" />
                  {appointment.client?.name || appointment.client?.username || 'Cliente'}
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
                    {getStatusLabel(appointment.status)}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => setShowDetailsModal(true)} className="hover:bg-muted font-light text-xs">
                    <Eye className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Detalhes</span>
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3 text-lg text-muted-foreground px-0 rounded-sm py-0 my-0 mx-0 sm:mx-[9px]">
                <div className="flex items-center bg-muted/50 p-2 sm:p-3 rounded-sm">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-primary" />
                  <span className="font-bold text-left text-xs sm:text-sm">{appointment.appointment_time}</span>
                </div>
                
                {appointment.client?.phone && <div className="flex items-center bg-muted/30 p-2 sm:p-3 rounded-sm">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-primary" />
                    <span className="font-bold text-xs sm:text-sm">{appointment.client.phone}</span>
                  </div>}

                {/* Lista de Serviços em formato de pedido - SEMPRE VISÍVEL */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2 sm:p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-2">
                    <Scissors className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-blue-600" />
                    <span className="font-semibold text-blue-900 text-xs sm:text-sm">Serviços do Agendamento</span>
                  </div>
                  
                  <div className="space-y-1">
                    {parsedAppointment.services.map((service, index) => <div key={index} className="flex justify-between items-center bg-white p-1.5 sm:p-2 rounded border text-xs sm:text-sm">
                        <div className="flex items-center min-w-0 flex-1">
                          <span className={`inline-block w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full mr-1 sm:mr-2 flex-shrink-0 ${service.type === 'main' ? 'bg-blue-500' : 'bg-green-500'}`} />
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-gray-900 block truncate">{service.name}</span>
                            <span className="text-xs text-gray-500">({service.duration}min)</span>
                          </div>
                        </div>
                        <span className="font-bold text-green-600 ml-2 flex-shrink-0">
                          {formatCurrency(service.price)}
                        </span>
                      </div>)}
                  </div>

                  {/* Total Consolidado */}
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <div className="flex justify-between items-center bg-green-50 p-1.5 sm:p-2 rounded border border-green-200">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-green-900 text-xs sm:text-sm">TOTAL</span>
                        <div className="text-xs text-green-700">
                          {parsedAppointment.services.length} serviço{parsedAppointment.services.length > 1 ? 's' : ''} • {parsedAppointment.totalDuration}min
                        </div>
                      </div>
                      <span className="font-bold text-green-600 text-sm sm:text-base ml-2 flex-shrink-0">
                        {formatCurrency(parsedAppointment.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {appointment.status === 'pending' && <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
              <Button 
                size="lg" 
                onClick={async () => {
                  setLocalUpdating('confirming');
                  console.log('🔄 EnhancedAppointmentCard: Aprovando agendamento...', appointment.id);
                  await onUpdateAppointment(appointment.id, { status: 'confirmed' });
                  setLocalUpdating(null);
                }} 
                disabled={isUpdating || localUpdating !== null} 
                className="bg-success hover:bg-success/90 text-white flex-1 font-semibold py-3 transition-all duration-200 active:scale-95"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {localUpdating === 'confirming' ? 'Aprovando...' : 'Aprovar'}
              </Button>
              <Button 
                size="lg" 
                variant="destructive" 
                onClick={async () => {
                  setLocalUpdating('cancelling');
                  console.log('🔄 EnhancedAppointmentCard: Rejeitando agendamento...', appointment.id);
                  await onUpdateAppointment(appointment.id, { status: 'cancelled' });
                  setLocalUpdating(null);
                }} 
                disabled={isUpdating || localUpdating !== null} 
                className="flex-1 font-semibold py-3 transition-all duration-200 active:scale-95"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {localUpdating === 'cancelling' ? 'Rejeitando...' : 'Rejeitar'}
              </Button>
            </div>}

          {appointment.status === 'confirmed' && <Button 
            size="lg" 
            onClick={async (e) => {
              console.log('🎯 BUTTON CLICK - Before update, appointment status:', appointment.status);
              console.log('🎯 BUTTON CLICK - Appointment ID:', appointment.id);
              
              // Efeito visual imediato mais intenso
              const button = e.currentTarget;
              button.style.transform = 'scale(0.9)';
              button.style.transition = 'all 0.1s ease-out';
              
              setTimeout(() => {
                button.style.transform = 'scale(1.05)';
                setTimeout(() => {
                  button.style.transform = 'scale(1)';
                }, 100);
              }, 100);
              
              setLocalUpdating('completing');
              
              try {
                console.log('🔄 CALLING onUpdateAppointment...');
                const result = await onUpdateAppointment(appointment.id, { status: 'completed' });
                console.log('✅ onUpdateAppointment RESULT:', result);
                console.log('🎯 AFTER UPDATE - appointment should now be completed');
                
                if (result) {
                  console.log('🎉 UPDATE SUCCESS - status should change automatically');
                  // Feedback visual de sucesso
                  button.style.background = 'linear-gradient(45deg, #10b981, #059669)';
                  button.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.5)';
                  
                  setTimeout(() => {
                    setLocalUpdating(null);
                  }, 500);
                } else {
                  console.error('❌ UPDATE FAILED');
                  setLocalUpdating(null);
                }
              } catch (error) {
                console.error('❌ UPDATE ERROR:', error);
                setLocalUpdating(null);
              }
            }} 
            disabled={isUpdating || localUpdating !== null} 
            className={`w-full mt-4 font-semibold py-4 text-sm transition-all duration-200 rounded-lg shadow-md relative overflow-hidden ${
              localUpdating === 'completing' 
                ? 'bg-gradient-to-r from-success via-emerald-500 to-success cursor-not-allowed animate-pulse ring-2 ring-success/50' 
                : 'bg-gradient-to-r from-success to-emerald-600 hover:from-success/90 hover:to-emerald-600/90 hover:shadow-xl active:scale-95 transform hover-scale'
            }`}
          >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              {localUpdating === 'completing' ? 'Finalizando...' : `Finalizar Atendimento - ${formatCurrency(parsedAppointment.totalPrice)}`}
              
              {/* Efeito de brilho durante loading */}
              {localUpdating === 'completing' && (
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              )}
            </Button>}
        </CardContent>
      </Card>

      <AppointmentDetailsModal 
        appointment={appointment} 
        isOpen={showDetailsModal} 
        onClose={() => setShowDetailsModal(false)} 
        onStatusUpdate={async (updatedAppointment) => {
          console.log('🔄 EnhancedAppointmentCard: Status updated via modal:', updatedAppointment);
          setShowDetailsModal(false);
          // O sistema realtime já cuida da atualização
        }} 
      />
    </>;
};
export default EnhancedAppointmentCard;