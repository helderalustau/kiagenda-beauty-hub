
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { useClientData } from '@/hooks/useClientData';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useToast } from "@/components/ui/use-toast";

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
    if (!salons || !clientUser) {
      setFilteredSalons(salons);
      return;
    }

    let locationFilteredSalons = salons;

    // Filter by client's city and state if available
    if (clientUser.city && clientUser.state) {
      locationFilteredSalons = salons.filter(salon => {
        const salonCity = salon.city?.toLowerCase().trim();
        const salonState = salon.state?.toLowerCase().trim();
        const clientCity = clientUser.city?.toLowerCase().trim();
        const clientState = clientUser.state?.toLowerCase().trim();

        return salonCity === clientCity && salonState === clientState;
      });

      console.log('Client location filter applied:', {
        clientCity: clientUser.city,
        clientState: clientUser.state,
        totalSalons: salons.length,
        filteredSalons: locationFilteredSalons.length
      });
    }

    // Apply search filter on top of location filter
    if (!searchTerm.trim()) {
      setFilteredSalons(locationFilteredSalons);
    } else {
      const searchFiltered = locationFilteredSalons.filter(salon => 
        salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salon.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSalons(searchFiltered);
    }
  }, [salons, searchTerm, clientUser]);

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
    setClientUser(updatedUser);
    // Update localStorage with new user data
    localStorage.setItem('clientAuth', JSON.stringify(updatedUser));
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
    
    // Actions
    setSearchTerm,
    handleBookService,
    handleLogout,
    handleBackToHome,
    handleRetry,
    clearSearch,
    handleUserUpdate
  };
};
