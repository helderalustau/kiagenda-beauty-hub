
import React, { useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Salon } from '@/hooks/useSupabaseData';
import { useOptimizedBookingModal } from '@/hooks/useOptimizedBookingModal';
import BookingProgressIndicator from './booking/BookingProgressIndicator';
import ClosedSalonDialog from './booking/ClosedSalonDialog';
import OptimizedBookingHeader from './booking/OptimizedBookingHeader';
import OptimizedBookingInfo from './booking/OptimizedBookingInfo';
import OptimizedStepRenderer from './booking/OptimizedStepRenderer';
import OptimizedBookingNavigation from './booking/OptimizedBookingNavigation';

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

  if (!salon?.is_open) {
    return (
      <ClosedSalonDialog
        isOpen={isOpen}
        onClose={handleClose}
        salon={salon}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto p-0">
        <OptimizedBookingHeader salon={salon} isSubmitting={isSubmitting} />

        <div className="p-6">
          <BookingProgressIndicator currentStep={currentStep} />
          <OptimizedBookingInfo />
          
          <OptimizedStepRenderer
            currentStep={currentStep}
            services={services}
            loadingServices={loadingServices}
            selectedService={selectedService}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            availableSlots={availableSlots}
            slotsLoading={slotsLoading}
            clientData={clientData}
            salon={salon}
            onServiceSelect={handleServiceSelect}
            onDateSelect={handleDateSelect}
            onTimeSelect={handleTimeSelect}
            onClientDataChange={setClientData}
            setCurrentStep={setCurrentStep}
            formatCurrency={formatCurrency}
            handleNextStep={handleNextStep}
            handleFormSubmit={handleFormSubmit}
          />

          <OptimizedBookingNavigation
            currentStep={currentStep}
            isSubmitting={isSubmitting}
            loadingServices={loadingServices}
            canProceedToStep2={canProceedToStep2}
            onClose={handleClose}
            onNextStep={handleNextStep}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OptimizedBookingModal;
