
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ModernBookingModal from '@/components/client/ModernBookingModal';
import { Salon } from '@/hooks/useSupabaseData';

const ClientBooking = () => {
  const { salonSlug } = useParams();
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

  const handleBackToDashboard = () => {
    navigate('/client-dashboard');
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'bronze': return 'bg-amber-100 text-amber-800';
      case 'prata': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'bronze': return 'Bronze';
      case 'prata': return 'Prata';
      case 'gold': return 'Ouro';
      default: return plan;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Carregando estabelecimento...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadingError || !selectedSalon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {loadingError || 'Estabelecimento não encontrado'}
            </h2>
            <p className="text-gray-600 mb-4">
              O estabelecimento que você está tentando acessar não foi encontrado ou não está disponível.
            </p>
            <Button onClick={handleBackToDashboard}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Estabelecimentos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg p-2">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                  BeautyFlow
                </h1>
                <p className="text-sm text-gray-600">Agendamento</p>
              </div>
            </div>
            
            <Button 
              onClick={handleBackToDashboard}
              variant="outline" 
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-between items-start mb-4">
                <CardTitle className="text-3xl font-bold text-gray-900">
                  {selectedSalon.name}
                </CardTitle>
                <Badge className={getPlanColor(selectedSalon.plan)}>
                  {getPlanName(selectedSalon.plan)}
                </Badge>
              </div>
              <div className="text-lg text-gray-600">
                Responsável: {selectedSalon.owner_name}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center space-x-3 text-gray-600">
                  <MapPin className="h-5 w-5" />
                  <span>{selectedSalon.address}</span>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-600">
                  <Phone className="h-5 w-5" />
                  <span>{selectedSalon.contact_phone || selectedSalon.phone}</span>
                </div>
              </div>

              <div className="text-center">
                <div className="mb-6">
                  {selectedSalon.is_open ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2 text-lg">
                      Aceitando Agendamentos
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 border-red-200 px-4 py-2 text-lg">
                      Fechado
                    </Badge>
                  )}
                </div>

                <Button
                  onClick={handleOpenBookingModal}
                  disabled={!selectedSalon.is_open}
                  className={`w-full py-4 text-lg font-semibold transition-all duration-300 ${
                    selectedSalon.is_open 
                      ? 'bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {selectedSalon.is_open ? 'Agendar Serviço' : 'Não Disponível'}
                </Button>
              </div>

              {selectedSalon.banner_image_url && (
                <div className="mt-6">
                  <img
                    src={selectedSalon.banner_image_url}
                    alt={`Banner do ${selectedSalon.name}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </CardContent>
          </Card>
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
