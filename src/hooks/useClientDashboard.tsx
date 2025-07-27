
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { useClientData } from '@/hooks/useClientData';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useToast } from "@/components/ui/use-toast";

// Função para normalizar strings para comparação
const normalizeString = (str: string | null | undefined): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, ' '); // Normaliza espaços
};

export const useClientDashboard = () => {
  const { 
    salons, 
    loading, 
    fetchAllSalons 
  } = useSupabaseData();
  const { appointments, fetchClientAppointments, setAppointments } = useAppointmentData();
  const { getClientByPhone } = useClientData();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [hasError, setHasError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSalons, setFilteredSalons] = useState(salons);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientUser, setClientUser] = useState<any>(null);
  const [locationFilter, setLocationFilter] = useState({
    enabled: true,
    showOtherCities: false
  });

  // Setup realtime notifications for client appointment updates
  useRealtimeNotifications({
    salonId: '', // Cliente não precisa filtrar por salon específico
    onAppointmentStatusChange: (appointment) => {
      // Atualizar appointments em tempo real quando status mudar
      if (appointment.client_auth_id === clientUser?.id) {
        setAppointments(prev => prev.map(apt => 
          apt.id === appointment.id ? appointment : apt
        ));
        
        // Mostrar notificação para o cliente
        if (appointment.status === 'confirmed') {
          toast({
            title: "✅ Agendamento Confirmado!",
            description: `Seu agendamento em ${appointment.salon?.name} foi confirmado`,
            duration: 8000,
          });
        } else if (appointment.status === 'completed') {
          toast({
            title: "🎉 Atendimento Concluído!",
            description: `Seu atendimento em ${appointment.salon?.name} foi finalizado`,
            duration: 8000,
          });
        } else if (appointment.status === 'cancelled') {
          toast({
            title: "❌ Agendamento Cancelado",
            description: `Seu agendamento em ${appointment.salon?.name} foi cancelado`,
            duration: 8000,
            variant: "destructive"
          });
        }
      }
    }
  });

  // Improved client authentication check
  useEffect(() => {
    const clientAuth = localStorage.getItem('clientAuth');
    const adminAuth = localStorage.getItem('adminAuth');
    
    // Prevent conflicts between client and admin auth
    if (adminAuth && clientAuth) {
      console.log('Conflicting auth detected, clearing admin auth for client session');
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('selectedSalonId');
    }
    
    if (!clientAuth) {
      console.log('No client authentication found, redirecting to login');
      navigate('/client-login');
      return;
    }

    try {
      const userData = JSON.parse(clientAuth);
      if (!userData.id || !userData.name || userData.role) {
        console.log('Invalid client auth data, redirecting to login');
        localStorage.removeItem('clientAuth');
        navigate('/client-login');
        return;
      }
      
      console.log('Client authenticated successfully:', userData);
      setClientUser(userData);
      loadData(userData);
    } catch (error) {
      console.error('Error parsing client auth:', error);
      localStorage.removeItem('clientAuth');
      navigate('/client-login');
    }
  }, [navigate]);

  // Filter salons based on search term and client location
  useEffect(() => {
    if (!salons || !Array.isArray(salons)) {
      console.log('No salons data available for filtering');
      setFilteredSalons([]);
      return;
    }

    console.log('=== FILTRO DE LOCALIZACAO ===');
    console.log('Total de salões no banco:', salons.length);
    console.log('Dados do cliente:', {
      name: clientUser?.name || clientUser?.username,
      city: clientUser?.city,
      state: clientUser?.state,
      searchTerm: searchTerm,
      locationFilter: locationFilter
    });

    let locationFilteredSalons = salons;

    // Apply location filter if enabled and client has city and state
    if (locationFilter.enabled && clientUser?.city && clientUser?.state && !locationFilter.showOtherCities) {
      const clientCityNormalized = normalizeString(clientUser.city);
      const clientStateNormalized = normalizeString(clientUser.state);
      
      console.log('Cliente normalizado:', {
        city: clientCityNormalized,
        state: clientStateNormalized
      });

      locationFilteredSalons = salons.filter(salon => {
        const salonCityNormalized = normalizeString(salon.city);
        const salonStateNormalized = normalizeString(salon.state);
        
        const cityMatch = salonCityNormalized === clientCityNormalized;
        const stateMatch = salonStateNormalized === clientStateNormalized;
        
        console.log(`Salão: ${salon.name}`, {
          salonCity: salon.city,
          salonState: salon.state,
          salonCityNormalized,
          salonStateNormalized,
          cityMatch,
          stateMatch,
          included: cityMatch && stateMatch
        });

        return cityMatch && stateMatch;
      });

      console.log('Resultado do filtro de localização:', {
        clientCity: clientUser.city,
        clientState: clientUser.state,
        totalSalons: salons.length,
        filteredSalons: locationFilteredSalons.length,
        salonNames: locationFilteredSalons.map(s => s.name)
      });
    } else if (locationFilter.showOtherCities && clientUser?.state) {
      // Mostrar apenas salões do mesmo estado
      const clientStateNormalized = normalizeString(clientUser.state);
      
      locationFilteredSalons = salons.filter(salon => {
        const salonStateNormalized = normalizeString(salon.state);
        return salonStateNormalized === clientStateNormalized;
      });
      
      console.log('Mostrando outras cidades do estado:', {
        clientState: clientUser.state,
        filteredSalons: locationFilteredSalons.length
      });
    } else {
      console.log('Filtro de localização desabilitado, mostrando todos os salões');
    }

    // Apply search filter on top of location filter
    if (searchTerm && searchTerm.trim()) {
      const searchNormalized = normalizeString(searchTerm);
      const searchFiltered = locationFilteredSalons.filter(salon => {
        const nameMatch = normalizeString(salon.name).includes(searchNormalized);
        const ownerMatch = normalizeString(salon.owner_name).includes(searchNormalized);
        const cityMatch = normalizeString(salon.city).includes(searchNormalized);
        return nameMatch || ownerMatch || cityMatch;
      });
      
      console.log('Filtro de busca aplicado:', {
        searchTerm,
        beforeSearch: locationFilteredSalons.length,
        afterSearch: searchFiltered.length
      });
      
      setFilteredSalons(searchFiltered);
    } else {
      setFilteredSalons(locationFilteredSalons);
    }

    console.log('=== FIM DO FILTRO ===');
  }, [salons, searchTerm, clientUser?.city, clientUser?.state, locationFilter]);

  const loadData = async (userData = clientUser) => {
    try {
      console.log('ClientDashboard - Loading data for user:', userData);
      setHasError(false);
      setIsRefreshing(true);
      
      // Load salons
      await fetchAllSalons();
      
      // Load client appointments directly using the authenticated user ID
      if (userData?.id) {
        console.log('Loading appointments for client ID:', userData.id);
        await fetchClientAppointments(userData.id);
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
    // Clear client-specific auth data
    localStorage.removeItem('clientAuth');
    setClientUser(null);
    setClientId(null);
    
    // Clear any cached data
    localStorage.removeItem('selectedSalonForBooking');
    
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

  const handleUserUpdate = (updatedUser: any) => {
    console.log('Updating client user data:', updatedUser);
    setClientUser(updatedUser);
    // Update localStorage with new user data
    localStorage.setItem('clientAuth', JSON.stringify(updatedUser));
  };

  const toggleLocationFilter = () => {
    setLocationFilter(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };

  const toggleShowOtherCities = () => {
    setLocationFilter(prev => ({
      ...prev,
      showOtherCities: !prev.showOtherCities
    }));
  };

  return {
    // State
    user: clientUser,
    salons: filteredSalons,
    appointments,
    loading,
    hasError,
    isRefreshing,
    searchTerm,
    clientId: clientUser?.id,
    locationFilter,
    
    // Actions
    setSearchTerm,
    handleBookService,
    handleLogout,
    handleBackToHome,
    handleRetry,
    clearSearch,
    handleUserUpdate,
    toggleLocationFilter,
    toggleShowOtherCities
  };
};
