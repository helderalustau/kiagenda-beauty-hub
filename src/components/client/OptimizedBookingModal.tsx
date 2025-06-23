
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Salon } from '@/hooks/useSupabaseData';
import { useOptimizedBookingModal } from '@/hooks/useOptimizedBookingModal';
import ServiceSelectionStep from './booking/ServiceSelectionStep';
import OptimizedDateTimeStep from './booking/OptimizedDateTimeStep';
import ClientDataStep from './booking/ClientDataStep';
import BookingProgressIndicator from './booking/BookingProgressIndicator';

interface OptimizedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: Salon;
  onBookingSuccess: () => void;
}

const OptimizedBookingModal = ({ isOpen, onClose, salon, onBookingSuccess }: OptimizedBookingModalProps) => {
  const {
    currentStep,
    services,
    loadingServices,
    selectedService,
    selectedDate,
    selectedTime,
    availableSlots,
    slotsLoading,
    clientData,
    isSubmitting,
    loadSalonServices,
    handleServiceSelect,
    handleDateSelect,
    handleTimeSelect,
    handleSubmit,
    handleReset,
    formatCurrency,
    setClientData,
    setCurrentStep,
    canProceedToStep2,
    canProceedToStep3,
    canSubmit
  } = useOptimizedBookingModal(salon);

  // Carrega serviços quando o modal abre
  useEffect(() => {
    if (isOpen && salon?.id) {
      console.log('🔄 Loading services for salon:', salon.name);
      loadSalonServices();
    }
  }, [isOpen, salon?.id, loadSalonServices]);

  const handleClose = () => {
    console.log('🚪 Closing booking modal');
    handleReset();
    onClose();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📋 Submitting optimized booking request');
    
    if (!canSubmit()) {
      console.log('❌ Cannot submit - validation failed');
      return;
    }
    
    const result = await handleSubmit(e);
    if (result?.success) {
      console.log('✅ Booking successful, closing modal');
      handleReset();
      onBookingSuccess();
      onClose();
    }
  };

  const handleNextStep = () => {
    console.log('➡️ Moving to next step from:', currentStep);
    
    if (currentStep === 1 && canProceedToStep2()) {
      console.log('➡️ Moving to step 2 (date/time selection)');
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedToStep3()) {
      console.log('➡️ Moving to step 3 (client data)');
      setCurrentStep(3);
    } else {
      console.log('❌ Cannot proceed - validation failed for step:', currentStep);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ServiceSelectionStep
            services={services}
            loadingServices={loadingServices}
            selectedService={selectedService}
            onServiceSelect={handleServiceSelect}
          />
        );

      case 2:
        return (
          <OptimizedDateTimeStep
            selectedService={selectedService}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            availableTimes={availableSlots}
            loading={slotsLoading}
            onDateSelect={handleDateSelect}
            onTimeSelect={handleTimeSelect}
            onBack={() => setCurrentStep(1)}
            formatCurrency={formatCurrency}
            onContinue={handleNextStep}
          />
        );

      case 3:
        return (
          <ClientDataStep
            salon={salon}
            selectedService={selectedService}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            clientData={clientData}
            onClientDataChange={setClientData}
            onBack={() => setCurrentStep(2)}
            formatCurrency={formatCurrency}
            onSubmit={handleFormSubmit}
          />
        );

      default:
        return null;
    }
  };

  if (!salon?.is_open) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-red-600 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Estabelecimento Fechado
            </DialogTitle>
            <DialogDescription className="text-center">
              {salon.name} não está aceitando agendamentos no momento.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button onClick={handleClose} variant="outline">
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto p-0">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center">
              {isSubmitting && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
              Solicitar Agendamento
            </DialogTitle>
            <DialogDescription className="text-blue-100">
              {salon.name} - {salon.address}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          <BookingProgressIndicator currentStep={currentStep} />
          
          <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>⚡ Processo Rápido:</strong> Sua solicitação será enviada diretamente para o estabelecimento. 
              Você receberá uma confirmação em breve!
            </p>
          </div>
          
          {renderStepContent()}

          {/* Navigation buttons - Only show for step 1 */}
          {currentStep === 1 && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex items-center"
              >
                Cancelar
              </Button>

              <Button
                disabled={!canProceedToStep2() || isSubmitting}
                onClick={handleNextStep}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center"
              >
                {loadingServices ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Submit button for final step - Hidden, handled by ClientDataStep */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OptimizedBookingModal;
