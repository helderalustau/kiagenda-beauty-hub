
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowRight } from "lucide-react";
import { useSalonData } from '@/hooks/useSalonData';
import { Salon } from '@/hooks/useSupabaseData';

const SalonSelectionPage = () => {
  const navigate = useNavigate();
  const { fetchAllSalons } = useSalonData();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSalons = async () => {
      try {
        setLoading(true);
        const salonData = await fetchAllSalons();
        setSalons(salonData);
      } catch (error) {
        console.error('Error loading salons:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSalons();
  }, [fetchAllSalons]);

  const handleSalonSelect = (salon: Salon) => {
    // Store salon data for the booking flow
    localStorage.setItem('selectedSalonForBooking', JSON.stringify(salon));
    navigate(`/booking/${salon.unique_slug}`);
  };

  const getStatusBadge = (salon: Salon) => {
    if (salon.is_open) {
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200 font-medium">
          Aceitando Agendamentos
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200 font-medium">
          Indisponível
        </Badge>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando estabelecimentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Logo Section */}
      <div className="pt-16 pb-8 text-center">
        <div className="w-48 h-16 bg-gray-900 rounded-lg mx-auto flex items-center justify-center">
          <span className="text-white text-xl font-bold">LOGO</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        {/* Title */}
        <h1 className="text-2xl font-medium text-center text-black mb-10">
          Selecione uma unidade
        </h1>

        {/* Salons Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {salons.map((salon) => (
              <Card 
                key={salon.id} 
                className="border-0 shadow-[0_2px_8px_rgba(0,0,0,0.05)] rounded-xl overflow-hidden bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-shadow duration-200"
              >
                {/* Salon Image */}
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {salon.banner_image_url ? (
                    <img
                      src={salon.banner_image_url}
                      alt={`${salon.name} - Capa`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Sem imagem</span>
                    </div>
                  )}
                  
                  {/* Status Badge Overlay */}
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(salon)}
                  </div>
                </div>

                <CardContent className="p-5">
                  {/* Salon Name */}
                  <h3 className="text-lg font-medium text-black mb-2">
                    {salon.name}
                  </h3>
                  
                  {/* Address */}
                  {salon.address && (
                    <div className="flex items-start gap-2 mb-4 text-gray-600">
                      <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                      <span className="text-sm leading-relaxed">{salon.address}</span>
                    </div>
                  )}

                  {/* Select Button */}
                  <Button
                    onClick={() => handleSalonSelect(salon)}
                    disabled={!salon.is_open}
                    className={`w-full h-12 rounded-lg font-medium transition-all duration-200 ${
                      salon.is_open 
                        ? 'bg-black text-white hover:bg-[#C9A348] hover:text-black' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {salon.is_open ? (
                      <span className="flex items-center justify-center gap-2">
                        Selecionar
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    ) : (
                      'Indisponível'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Salons Message */}
          {salons.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg mb-4">
                Nenhum estabelecimento disponível no momento
              </p>
              <p className="text-gray-500 text-sm">
                Tente novamente mais tarde
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalonSelectionPage;
