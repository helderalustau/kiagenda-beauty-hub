
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { Salon } from '@/hooks/useSupabaseData';

export const useClientBookingLogic = (salonSlug: string | undefined) => {
  const navigate = useNavigate();
  const { user, isClient } = useAuth();
  const { fetchSalonBySlug, fetchSalonData } = useSupabaseData();
  
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const loadSalonData = useCallback(async () => {
    if (!salonSlug) {
      setLoadingError('Slug do estabelecimento não fornecido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setLoadingError(null);
      console.log('ClientBooking - Loading salon data for:', salonSlug);

      // Try to get from localStorage first (if available)
      const storedSalon = localStorage.getItem('selectedSalonForBooking');
      let salonData = null;

      if (storedSalon) {
        try {
          const parsedSalon = JSON.parse(storedSalon);
          console.log('ClientBooking - Found salon in localStorage:', parsedSalon);
          
          // Check if it matches the current slug
          if (parsedSalon.unique_slug === salonSlug || parsedSalon.id === salonSlug) {
            setSelectedSalon(parsedSalon);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Error parsing stored salon data:', e);
          localStorage.removeItem('selectedSalonForBooking');
        }
      }

      // Fetch from database
      if (salonSlug.includes('-') && salonSlug.length > 30) {
        // Probably a UUID, try fetching by ID
        console.log('ClientBooking - Attempting to fetch by ID:', salonSlug);
        salonData = await fetchSalonData(salonSlug);
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
    } finally {
      setLoading(false);
    }
  }, [salonSlug, fetchSalonBySlug, fetchSalonData]);

  // Load salon data on mount and when salonSlug changes
  useEffect(() => {
    if (salonSlug) {
      loadSalonData();
    }
  }, [salonSlug, loadSalonData]);

  const handleOpenBookingModal = useCallback(() => {
    console.log('🔐 Checking authentication before opening booking modal');
    console.log('User:', user);
    console.log('Is client:', isClient);

    // Verificar se o usuário está logado e é um cliente
    if (!user || !isClient) {
      console.log('🚫 User not authenticated or not a client, redirecting to login');
      
      // Salvar URL atual para retornar após login
      const currentPath = window.location.pathname;
      localStorage.setItem('returnUrl', currentPath);
      
      // Salvar dados do salão para usar após o login
      if (selectedSalon) {
        localStorage.setItem('selectedSalonForBooking', JSON.stringify(selectedSalon));
      }
      
      // Redirecionar para login
      navigate('/client-login');
      return;
    }

    // Usuário autenticado, verificar se o salão está aberto
    if (selectedSalon && selectedSalon.is_open) {
      console.log('✅ User authenticated and salon is open, opening booking modal');
      setIsBookingModalOpen(true);
    } else {
      console.log('❌ Salon is closed or not available');
    }
  }, [selectedSalon, user, isClient, navigate]);

  const handleBookingSuccess = useCallback(() => {
    console.log('✅ Booking successful, cleaning up and redirecting');
    // Clean up localStorage and redirect
    localStorage.removeItem('selectedSalonForBooking');
    localStorage.removeItem('returnUrl');
    navigate('/client-dashboard');
  }, [navigate]);

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
