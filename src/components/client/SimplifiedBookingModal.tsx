import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Salon } from '@/hooks/useSupabaseData';
import { useBookingFlow } from '@/hooks/useBookingFlow';
import { useBookingServices } from '@/hooks/booking/useBookingServices';
import { useAvailableTimeSlots } from '@/hooks/useAvailableTimeSlots';
import SimpleServiceSelectionStep from './booking/SimpleServiceSelectionStep';
import SimpleAdditionalServicesStep from './booking/SimpleAdditionalServicesStep';
import SimpleDateTimeSelectionStep from './booking/SimpleDateTimeSelectionStep';
import SimpleClientDataStep from './booking/SimpleClientDataStep';
import { useAuth } from '@/hooks/useAuth';

interface SimplifiedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: Salon;
  onBookingSuccess: () => void;
}

const SimplifiedBookingModal = ({ isOpen, onClose, salon, onBookingSuccess }: SimplifiedBookingModalProps) => {
  const {
    currentStep,
    selectedService,
    selectedAdditionalServices,
    selectedDate,
    selectedTime,
    clientData,
    isSubmitting,
    setCurrentStep,
    setSelectedService,
    setSelectedAdditionalServices,
    setSelectedDate,
    setSelectedTime,
    setClientData,
    toggleAdditionalService,
    submitBookingRequest,
    resetBooking
  } = useBookingFlow(salon?.id);

  const { services, loadingServices, loadServices } = useBookingServices(salon?.id);
  const { user, isClient } = useAuth();
  
  // Calculate total duration for time slot calculation
  const totalDuration = (selectedService?.duration_minutes || 0) + 
    selectedAdditionalServices.reduce((acc, service) => acc + service.duration_minutes, 0);

  // Fix: Pass only the required parameters to useAvailableTimeSlots
  const { availableSlots, loading: loadingTimes, error: timeSlotsError, refetch: refetchSlots } = useAvailableTimeSlots(
    salon?.id, 
    selectedDate,
    selectedService?.id
  );

  // Carregar serviços quando o modal abre
  useEffect(() => {
    if (isOpen && salon?.id) {
      console.log('SimplifiedBookingModal - Loading services for salon:', salon.id);
      loadServices();
    }
  }, [isOpen, salon?.id, loadServices]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetBooking();
    onClose();
  };

  const handleSubmit = async () => {
    // Verificação adicional de autenticação antes do submit
    if (!user || !isClient) {
      console.log('🚫 User not authenticated during submit, should not happen');
      return;
    }

    const success = await submitBookingRequest();
    if (success) {
      onBookingSuccess();
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  };

  // Verificação de autenticação - não deveria abrir se não estiver logado
  if (!user || !isClient) {
    console.log('🚫 Modal opened without proper authentication, closing...');
    if (isOpen) {
      onClose();
    }
    return null;
  }

  if (!salon?.is_open) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Estabelecimento Fechado</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-gray-600">Este estabelecimento não está aceitando agendamentos no momento.</p>
            <Button onClick={handleClose} className="mt-4">Entendi</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Agendar Serviço - {salon?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          {currentStep === 1 && (
            <SimpleServiceSelectionStep
              services={services}
              selectedService={selectedService}
              loadingServices={loadingServices}
              onServiceSelect={setSelectedService}
              onNext={() => setCurrentStep(2)}
              onCancel={handleClose}
            />
          )}

          {currentStep === 2 && (
            <SimpleAdditionalServicesStep
              services={services}
              selectedService={selectedService}
              selectedAdditionalServices={selectedAdditionalServices}
              loadingServices={loadingServices}
              onAdditionalServiceToggle={toggleAdditionalService}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
              onSkip={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && (
            <SimpleDateTimeSelectionStep
              selectedService={selectedService}
              selectedAdditionalServices={selectedAdditionalServices}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              availableTimes={availableSlots || []}
              loadingTimes={loadingTimes}
              timeSlotsError={timeSlotsError}
              onDateSelect={setSelectedDate}
              onTimeSelect={setSelectedTime}
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
              formatCurrency={formatCurrency}
              refetchSlots={refetchSlots}
            />
          )}

          {currentStep === 4 && (
            <SimpleClientDataStep
              selectedService={selectedService}
              selectedAdditionalServices={selectedAdditionalServices}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              clientData={clientData}
              isSubmitting={isSubmitting}
              onClientDataChange={setClientData}
              onSubmit={handleSubmit}
              onBack={() => setCurrentStep(3)}
              onCancel={handleClose}
              formatCurrency={formatCurrency}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimplifiedBookingModal;
