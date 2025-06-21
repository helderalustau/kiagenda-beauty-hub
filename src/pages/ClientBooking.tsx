
import React from 'react';
import { useParams } from 'react-router-dom';
import ModernBookingModal from '@/components/client/ModernBookingModal';
import BookingPageHeader from '@/components/client/booking/BookingPageHeader';
import SalonBookingCard from '@/components/client/booking/SalonBookingCard';
import BookingErrorState from '@/components/client/booking/BookingErrorState';
import BookingLoadingState from '@/components/client/booking/BookingLoadingState';
import { useClientBookingLogic } from '@/hooks/client/useClientBookingLogic';

const ClientBooking = () => {
  const { salonSlug } = useParams();
  const {
    selectedSalon,
    loading,
    loadingError,
    isBookingModalOpen,
    setIsBookingModalOpen,
    handleOpenBookingModal,
    handleBookingSuccess
  } = useClientBookingLogic(salonSlug);

  if (loading) {
    return <BookingLoadingState />;
  }

  if (loadingError || !selectedSalon) {
    return <BookingErrorState error={loadingError || 'Estabelecimento não encontrado'} />;
  }

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

      {/* Modal de Agendamento Moderno */}
      <ModernBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        salon={selectedSalon}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
};

export default ClientBooking;
