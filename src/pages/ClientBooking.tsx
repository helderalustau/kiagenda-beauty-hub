
import React from 'react';
import { useClientBookingLogic } from '@/hooks/client/useClientBookingLogic';
import BookingPageHeader from '@/components/client/booking/BookingPageHeader';
import SalonBookingCard from '@/components/client/booking/SalonBookingCard';
import OptimizedBookingModal from '@/components/client/OptimizedBookingModal';
import BookingLoadingState from '@/components/client/booking/BookingLoadingState';
import BookingErrorState from '@/components/client/booking/BookingErrorState';

const ClientBooking = () => {
  const {
    selectedSalon,
    services,
    selectedService,
    selectedDate,
    selectedTime,
    currentStep,
    isBookingModalOpen,
    clientData,
    availableSlots,
    loadingSalon,
    loadingServices,
    slotsLoading,
    setSelectedService,
    setSelectedDate,
    setSelectedTime,
    setCurrentStep,
    setIsBookingModalOpen,
    setClientData,
    handleOpenBookingModal,
    handleBookingSuccess,
    loadAvailableSlots
  } = useClientBookingLogic();

  console.log('ClientBooking - Salon:', selectedSalon?.name, 'Loading:', loadingSalon);

  if (loadingSalon) {
    return <BookingLoadingState />;
  }

  if (!selectedSalon) {
    return <BookingErrorState />;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <BookingPageHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <SalonBookingCard 
            salon={selectedSalon}
            onOpenBookingModal={handleOpenBookingModal}
          />
        </div>
      </div>

      <OptimizedBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        salon={selectedSalon}
        services={services}
        selectedService={selectedService}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        currentStep={currentStep}
        clientData={clientData}
        availableSlots={availableSlots}
        loadingServices={loadingServices}
        slotsLoading={slotsLoading}
        onServiceSelect={setSelectedService}
        onDateSelect={(date) => {
          setSelectedDate(date);
          if (date && selectedService) {
            loadAvailableSlots(date, selectedService.id);
          }
        }}
        onTimeSelect={setSelectedTime}
        onStepChange={setCurrentStep}
        onClientDataChange={setClientData}
        onBookingSuccess={handleBookingSuccess}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default ClientBooking;
