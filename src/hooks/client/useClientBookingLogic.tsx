
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Salon, Service } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ClientData {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export const useClientBookingLogic = () => {
  const { salonSlug } = useParams<{ salonSlug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [clientData, setClientData] = useState<ClientData>({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  const [loadingSalon, setLoadingSalon] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const loadSalonData = useCallback(async () => {
    if (!salonSlug) return;
    
    setLoadingSalon(true);
    console.log(`Loading salon data for slug: ${salonSlug}`);
    
    try {
      const { data: salon, error: salonError } = await supabase
        .from('salons')
        .select('*')
        .eq('unique_slug', salonSlug)
        .eq('is_open', true)
        .eq('setup_completed', true)
        .single();

      if (salonError) {
        console.error('Error fetching salon:', salonError);
        navigate('/not-found');
        return;
      }

      if (!salon) {
        console.error('Salon not found or not available');
        navigate('/not-found');
        return;
      }

      setSelectedSalon(salon);
      console.log('Salon loaded:', salon.name);

      // Load services for this salon
      setLoadingServices(true);
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salon.id)
        .eq('active', true);

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
      } else {
        setServices(servicesData || []);
        console.log('Services loaded:', servicesData?.length || 0);
      }
    } catch (error) {
      console.error('Unexpected error loading salon data:', error);
      navigate('/not-found');
    } finally {
      setLoadingSalon(false);
      setLoadingServices(false);
    }
  }, [salonSlug, navigate]);

  // Load salon data when component mounts or slug changes
  useEffect(() => {
    if (salonSlug) {
      loadSalonData();
    }
  }, [salonSlug, loadSalonData]);

  const handleOpenBookingModal = useCallback(() => {
    console.log('Opening booking modal, user:', user ? 'authenticated' : 'not authenticated');
    
    // Check if user is authenticated
    if (!user) {
      console.log('User not authenticated, saving return URL and redirecting to login');
      // Save the complete current URL to return after login
      const returnUrl = `/booking/${salonSlug}`;
      localStorage.setItem('returnUrl', returnUrl);
      console.log('Saved return URL:', returnUrl);
      
      // Navigate to client login
      navigate('/client-login');
      return;
    }

    // User is authenticated, check salon availability
    if (selectedSalon && selectedSalon.is_open) {
      console.log('Opening booking modal for authenticated user');
      setIsBookingModalOpen(true);
    } else {
      console.log('Salon not available for booking');
    }
  }, [selectedSalon, user, navigate, salonSlug]);

  const handleBookingSuccess = useCallback(() => {
    // Clean up and redirect to client dashboard after successful booking
    setIsBookingModalOpen(false);
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedTime('');
    setClientData({
      name: '',
      phone: '',
      email: '',
      notes: ''
    });
    
    console.log('Booking successful, redirecting to dashboard');
    navigate('/client-dashboard');
  }, [navigate]);

  const loadAvailableSlots = useCallback(async (date: Date, serviceId?: string) => {
    if (!selectedSalon || !date) return;

    setSlotsLoading(true);
    console.log('Loading available slots for:', date, serviceId);

    try {
      const { data: slots, error } = await supabase
        .rpc('get_available_time_slots', {
          p_salon_id: selectedSalon.id,
          p_date: date.toISOString().split('T')[0],
          p_service_id: serviceId || null
        });

      if (error) {
        console.error('Error fetching time slots:', error);
        setAvailableSlots([]);
      } else {
        const formattedSlots = (slots || []).map((slot: any) => slot.time_slot);
        setAvailableSlots(formattedSlots);
        console.log('Available slots loaded:', formattedSlots.length);
      }
    } catch (error) {
      console.error('Error loading time slots:', error);
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [selectedSalon]);

  return {
    // State
    selectedSalon,
    services,
    selectedService,
    selectedDate,
    selectedTime,
    currentStep,
    isBookingModalOpen,
    clientData,
    availableSlots,
    
    // Loading states
    loadingSalon,
    loadingServices,
    slotsLoading,
    
    // Actions
    setSelectedService,
    setSelectedDate,
    setSelectedTime,
    setCurrentStep,
    setIsBookingModalOpen,
    setClientData,
    handleOpenBookingModal,
    handleBookingSuccess,
    loadAvailableSlots
  };
};
