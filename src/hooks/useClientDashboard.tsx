
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { useClientData } from '@/hooks/useClientData';
import { useToast } from "@/components/ui/use-toast";

export const useClientDashboard = () => {
  const { 
    salons, 
    loading, 
    fetchAllSalons 
  } = useSupabaseData();
  const { appointments, fetchClientAppointments } = useAppointmentData();
  const { getClientByPhone } = useClientData();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [hasError, setHasError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSalons, setFilteredSalons] = useState(salons);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/client-login');
      return;
    }
    loadData();
  }, [user, navigate]);

  // Filter salons based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSalons(salons);
    } else {
      const filtered = salons.filter(salon => 
        salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salon.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSalons(filtered);
    }
  }, [salons, searchTerm]);

  // Load client appointments when clientId is available
  useEffect(() => {
    if (clientId) {
      fetchClientAppointments(clientId);
    }
  }, [clientId, fetchClientAppointments]);

  const loadData = async () => {
    try {
      console.log('ClientDashboard - Loading data...');
      setHasError(false);
      setIsRefreshing(true);
      
      // Load salons
      await fetchAllSalons();
      
      // Load client data and appointments
      if (user?.id) {
        const clientResult = await getClientByPhone(user.id);
        if (clientResult.success && clientResult.client) {
          setClientId(clientResult.client.id);
        }
      }
      
      console.log('ClientDashboard - Data loaded successfully');
    } catch (error) {
      console.error('ClientDashboard - Error loading data:', error);
      setHasError(true);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBookService = async (salon: any) => {
    try {
      console.log('ClientDashboard - Selecting salon for booking:', salon);
      
      localStorage.setItem('selectedSalonForBooking', JSON.stringify(salon));
      
      const routeParam = salon.unique_slug || salon.id;
      console.log('ClientDashboard - Navigating to booking route:', `/booking/${routeParam}`);
      
      navigate(`/booking/${routeParam}`);
    } catch (error) {
      console.error('ClientDashboard - Error selecting salon:', error);
      toast({
        title: "Erro",
        description: "Erro ao selecionar estabelecimento. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleRetry = () => {
    loadData();
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return {
    // State
    user,
    salons: filteredSalons,
    appointments,
    loading,
    hasError,
    isRefreshing,
    searchTerm,
    clientId,
    
    // Actions
    setSearchTerm,
    handleBookService,
    handleLogout,
    handleBackToHome,
    handleRetry,
    clearSearch
  };
};
