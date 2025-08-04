
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { Salon } from '@/hooks/useSupabaseData';
import { useSimpleBooking } from '@/hooks/useSimpleBooking';
import SimpleBookingProgressIndicator from './booking/SimpleBookingProgressIndicator';
import SimpleServiceSelectionStep from './booking/SimpleServiceSelectionStep';
import SimpleDateTimeSelectionStep from './booking/SimpleDateTimeSelectionStep';
import SimpleClientDataStep from './booking/SimpleClientDataStep';

interface SimpleBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: Salon;
  onBookingSuccess: () => void;
}

const SimpleBookingModal = ({ isOpen, onClose, salon, onBookingSuccess }: SimpleBookingModalProps) => {
  const {
    currentStep,
    selectedService,
    selectedDate,
    selectedTime,
    clientData,
    services,
    availableTimes,
    isSubmitting,
    loadingServices,
    loadingTimes,
    timeSlotsError,
    servicesError,
    isClient,
    user,
    setCurrentStep,
    handleServiceSelect,
    handleDateSelect,
    handleTimeSelect,
    setClientData,
    submitBooking,
    resetBooking,
    formatCurrency,
    validateBookingData
  } = useSimpleBooking(salon);

  const handleClose = () => {
    if (isSubmitting) {
      console.log('⚠️ Cannot close modal during submission');
      return;
    }
    
    console.log('🚪 Closing modal and resetting state');
    resetBooking();
    onClose();
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      console.log('⚠️ Submit already in progress, ignoring click');
      return;
    }

    console.log('📋 Modal submitting booking');
    
    try {
      const success = await submitBooking();
      
      if (success) {
        console.log('✅ Booking successful, calling success callback');
        onBookingSuccess();
        // Fechar modal após sucesso
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Error in modal submit:', error);
    }
  };

  // Validações para navegação entre steps
  const canProceedToStep2 = () => {
    return selectedService !== null && !loadingServices;
  };

  const canProceedToStep3 = () => {
    return selectedDate !== undefined && selectedTime !== '' && !loadingTimes;
  };

  const canSubmit = () => {
    const validation = validateBookingData();
    return validation.isValid && !isSubmitting;
  };

  // Handle authentication issues
  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              Login Necessário
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              Você precisa estar logado para fazer um agendamento.
            </p>
            <Button onClick={handleClose}>
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!isClient) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Acesso Restrito
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              Apenas clientes podem fazer agendamentos. Você está logado como administrador.
            </p>
            <Button onClick={handleClose}>
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
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
            <Button onClick={handleClose} className="mt-4">
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={!isSubmitting ? handleClose : undefined}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 -m-6 mb-6">
          <DialogTitle className="text-xl font-bold flex items-center">
            {isSubmitting && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
            {isSubmitting ? 'Enviando Solicitação...' : `Agendar Serviço - ${salon.name}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <SimpleBookingProgressIndicator currentStep={currentStep} />

          {currentStep === 1 && (
            <SimpleServiceSelectionStep
              services={services}
              selectedService={selectedService}
              loadingServices={loadingServices}
              onServiceSelect={handleServiceSelect}
              onNext={() => {
                if (canProceedToStep2()) {
                  setCurrentStep(2);
                }
              }}
              onCancel={handleClose}
            />
          )}

          {currentStep === 2 && (
            <SimpleDateTimeSelectionStep
              selectedService={selectedService}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              availableTimes={availableTimes}
              loadingTimes={loadingTimes}
              timeSlotsError={timeSlotsError}
              onDateSelect={handleDateSelect}
              onTimeSelect={handleTimeSelect}
              onNext={() => {
                if (canProceedToStep3()) {
                  setCurrentStep(3);
                }
              }}
              onBack={() => setCurrentStep(1)}
              formatCurrency={formatCurrency}
            />
          )}

          {currentStep === 3 && (
            <SimpleClientDataStep
              selectedService={selectedService}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              clientData={clientData}
              isSubmitting={isSubmitting}
              onClientDataChange={setClientData}
              onSubmit={handleSubmit}
              onBack={() => setCurrentStep(2)}
              onCancel={handleClose}
              formatCurrency={formatCurrency}
            />
          )}
        </div>

        {/* Debug Info - Remover em produção */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-400 mt-4 p-2 bg-gray-100 rounded">
            Debug: Step {currentStep} | Service: {selectedService?.name || 'none'} | 
            Date: {selectedDate?.toDateString() || 'none'} | Time: {selectedTime || 'none'} |
            Can Submit: {canSubmit().toString()}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SimpleBookingModal;
