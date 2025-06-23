
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
    setCurrentStep,
    setSelectedService,
    setSelectedDate,
    setSelectedTime,
    setClientData,
    loadServices,
    loadAvailableTimes,
    submitBooking,
    resetBooking,
    formatCurrency
  } = useSimpleBooking(salon);

  // Carregar serviços quando o modal abre
  useEffect(() => {
    if (isOpen && salon?.id) {
      console.log('Modal opened, loading services for salon:', salon.name);
      loadServices();
    }
  }, [isOpen, salon?.id, loadServices]);

  // Carregar horários quando data é selecionada - com debounce para evitar loops
  useEffect(() => {
    if (selectedDate && !loadingTimes) {
      console.log('Date selected, loading times:', selectedDate.toDateString());
      const timeoutId = setTimeout(() => {
        loadAvailableTimes(selectedDate);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedDate, loadAvailableTimes, loadingTimes]);

  const handleClose = () => {
    console.log('Closing modal and resetting state');
    resetBooking();
    onClose();
  };

  const handleSubmit = async () => {
    console.log('Submitting booking');
    const success = await submitBooking();
    if (success) {
      onBookingSuccess();
      onClose();
    }
  };

  const handleTimeSelect = (time: string) => {
    console.log('Time selected:', time);
    setSelectedTime(time);
  };

  const handleDateSelect = (date: Date | undefined) => {
    console.log('Calendar date selected:', date?.toDateString());
    setSelectedDate(date);
    setSelectedTime(''); // Limpar horário selecionado quando data muda
  };

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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 -m-6 mb-6">
          <DialogTitle className="text-xl font-bold flex items-center">
            {isSubmitting && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
            Agendar Serviço - {salon.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Indicador de progresso */}
          <SimpleBookingProgressIndicator currentStep={currentStep} />

          {/* Etapa 1: Selecionar Serviço */}
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

          {/* Etapa 2: Selecionar Data e Horário */}
          {currentStep === 2 && (
            <SimpleDateTimeSelectionStep
              selectedService={selectedService}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              availableTimes={availableTimes}
              loadingTimes={loadingTimes}
              onDateSelect={handleDateSelect}
              onTimeSelect={handleTimeSelect}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
              formatCurrency={formatCurrency}
            />
          )}

          {/* Etapa 3: Dados do Cliente */}
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
      </DialogContent>
    </Dialog>
  );
};

export default SimpleBookingModal;
