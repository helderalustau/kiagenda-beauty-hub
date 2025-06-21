
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Salon } from '@/hooks/useSupabaseData';
import { useBookingModal } from '@/hooks/useBookingModal';
import ServiceSelectionStep from './booking/ServiceSelectionStep';
import DateTimeSelectionStep from './booking/DateTimeSelectionStep';
import ClientDataStep from './booking/ClientDataStep';
import BookingProgressIndicator from './booking/BookingProgressIndicator';

interface ModernBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: Salon;
  onBookingSuccess: () => void;
}

const ModernBookingModal = ({ isOpen, onClose, salon, onBookingSuccess }: ModernBookingModalProps) => {
  const {
    currentStep,
    services,
    loadingServices,
    selectedService,
    selectedDate,
    selectedTime,
    availableTimes,
    clientData,
    isSubmitting,
    loadSalonServices,
    handleServiceSelect,
    handleDateSelect,
    handleTimeSelect,
    handleSubmit,
    handleReset,
    handleBack,
    formatCurrency,
    setClientData,
    setCurrentStep
  } = useBookingModal(salon);

  // Load services when modal opens
  useEffect(() => {
    if (isOpen && salon?.id) {
      console.log('ModernBookingModal - Loading services for salon:', salon.id);
      loadSalonServices();
    }
  }, [isOpen, salon?.id, loadSalonServices]);

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    console.log('ModernBookingModal - Submitting booking request');
    const result = await handleSubmit(e);
    if (result?.success) {
      handleReset();
      onBookingSuccess();
      onClose();
    }
  };

  const handleNextStep = () => {
    console.log('ModernBookingModal - Next step from:', currentStep);
    if (currentStep === 1 && selectedService) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedDate && selectedTime) {
      setCurrentStep(3);
    }
  };

  const canProceedToNext = () => {
    if (currentStep === 1) return selectedService !== null;
    if (currentStep === 2) return selectedDate !== undefined && selectedTime !== '';
    return false;
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
          <DateTimeSelectionStep
            selectedService={selectedService}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            availableTimes={availableTimes}
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
            <DialogTitle className="text-center text-red-600">
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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Solicitar Agendamento
            </DialogTitle>
            <DialogDescription className="text-blue-100">
              {salon.name} - {salon.address}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          <BookingProgressIndicator currentStep={currentStep} />
          
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Importante:</strong> Sua solicitação será enviada para análise do estabelecimento. 
              Você receberá uma resposta em breve sobre a aprovação do seu agendamento.
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
                className="flex items-center"
              >
                Cancelar
              </Button>

              <Button
                disabled={!canProceedToNext()}
                onClick={handleNextStep}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center"
              >
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Submit button for final step */}
          {currentStep === 3 && (
            <div className="flex justify-center mt-8 pt-6 border-t">
              <Button
                onClick={handleFormSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center px-8"
              >
                {isSubmitting ? 'Enviando Solicitação...' : 'Enviar Solicitação de Agendamento'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModernBookingModal;
