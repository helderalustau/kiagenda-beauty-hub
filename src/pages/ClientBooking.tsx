
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
  const { salonId } = useParams();
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

  useEffect(() => {
    if (!user) {
      navigate('/client-login');
      return;
    }

    if (salonId) {
      loadSalonData();
    }
  }, [user, salonId, navigate]);

  const loadSalonData = async () => {
    if (!salonId) return;

    // Primeiro tentar carregar do localStorage se disponível
    const storedSalon = localStorage.getItem('selectedSalonForBooking');
    if (storedSalon) {
      const parsedSalon = JSON.parse(storedSalon);
      setSelectedSalon(parsedSalon);
    }

    // Tentar buscar por slug primeiro, depois por ID
    let salonData = null;
    
    if (salonId.includes('-')) {
      // Provavelmente é um slug
      salonData = await fetchSalonBySlug(salonId);
    } else {
      // Provavelmente é um ID
      await fetchSalonData(salonId);
      salonData = salon;
    }

    if (salonData) {
      setSelectedSalon(salonData);
    }
  };

  const handleOpenBookingModal = () => {
    if (selectedSalon && selectedSalon.is_open) {
      setIsBookingModalOpen(true);
    }
  };

  const handleBookingSuccess = () => {
    // Redirecionar de volta para o dashboard do cliente
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

  if (!selectedSalon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Estabelecimento não encontrado
            </h2>
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
