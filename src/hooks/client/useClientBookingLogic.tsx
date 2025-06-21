
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { Salon } from '@/hooks/useSupabaseData';

export const useClientBookingLogic = (salonSlug: string | undefined) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    salon, 
    loading, 
    fetchSalonData,
    fetchSalonBySlug 
  } = useSupabaseData();
  
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/client-login');
      return;
    }

    if (salonSlug) {
      loadSalonData();
    }
  }, [user, salonSlug, navigate]);

  const loadSalonData = async () => {
    if (!salonSlug) return;

    try {
      setLoadingError(null);
      console.log('ClientBooking - Loading salon data for:', salonSlug);

      // First, try to get from localStorage if available
      const storedSalon = localStorage.getItem('selectedSalonForBooking');
      if (storedSalon) {
        const parsedSalon = JSON.parse(storedSalon);
        console.log('ClientBooking - Found salon in localStorage:', parsedSalon);
        setSelectedSalon(parsedSalon);
      }

      let salonData = null;
      
      // Check if salonSlug looks like a UUID (contains hyphens)
      if (salonSlug.includes('-') && salonSlug.length > 30) {
        // Probably a UUID, try fetching by ID
        console.log('ClientBooking - Attempting to fetch by ID:', salonSlug);
        await fetchSalonData(salonSlug);
        salonData = salon;
      } else {
        // Probably a slug, try fetching by slug
        console.log('ClientBooking - Attempting to fetch by slug:', salonSlug);
        salonData = await fetchSalonBySlug(salonSlug);
      }

      if (salonData) {
        console.log('ClientBooking - Salon data loaded:', salonData);
        setSelectedSalon(salonData);
        // Update localStorage with fresh data
        localStorage.setItem('selectedSalonForBooking', JSON.stringify(salonData));
      } else {
        console.warn('ClientBooking - No salon data found for:', salonSlug);
        setLoadingError('Estabelecimento não encontrado');
      }
    } catch (error) {
      console.error('ClientBooking - Error loading salon:', error);
      setLoadingError('Erro ao carregar estabelecimento');
    }
  };

  const handleOpenBookingModal = () => {
    if (selectedSalon && selectedSalon.is_open) {
      setIsBookingModalOpen(true);
    }
  };

  const handleBookingSuccess = () => {
    // Redirect back to client dashboard
    navigate('/client-dashboard');
  };

  return {
    selectedSalon,
    loading,
    loadingError,
    isBookingModalOpen,
    setIsBookingModalOpen,
    handleOpenBookingModal,
    handleBookingSuccess
  };
};
