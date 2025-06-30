
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, CheckCircle, XCircle, Star, Calendar } from "lucide-react";
import { Salon } from '@/hooks/useSupabaseData';
import { usePhoneFormatter } from '@/hooks/usePhoneFormatter';

interface SalonListProps {
  salons: Salon[];
  onBookService: (salon: Salon) => Promise<void>;
}

const SalonList = ({ salons, onBookService }: SalonListProps) => {
  const { formatPhoneNumber } = usePhoneFormatter();

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'bronze':
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      case 'prata':
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
      case 'gold':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'bronze':
      case 'prata':  
      case 'gold':
        return <Star className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'bronze':
        return 'Bronze';
      case 'prata':
        return 'Prata';
      case 'gold':
        return 'Ouro';
      default:
        return plan;
    }
  };

  const getDefaultBanner = () => {
    return `https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=300&fit=crop&crop=center`;
  };

  const handleBookService = async (salon: Salon) => {
    console.log('SalonList - Booking service for salon:', salon);
    try {
      await onBookService(salon);
    } catch (error) {
      console.error('SalonList - Error booking service:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {salons.map((salon) => (
        <Card key={salon.id} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white overflow-hidden transform hover:-translate-y-1">
          {/* Banner da loja com overlay gradiente */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={salon.banner_image_url || getDefaultBanner()}
              alt={`Banner ${salon.name}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getDefaultBanner();
              }}
            />
            
            {/* Overlay gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Badge do plano */}
            <div className="absolute top-4 right-4">
              <Badge className={`${getPlanColor(salon.plan)} shadow-lg flex items-center space-x-1`}>
                {getPlanIcon(salon.plan)}
                <span className="font-semibold">{getPlanName(salon.plan)}</span>
              </Badge>
            </div>

            {/* Status do estabelecimento */}
            <div className="absolute top-4 left-4">
              {salon.is_open ? (
                <Badge className="bg-green-500/90 text-white shadow-lg flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Aberto</span>
                </Badge>
              ) : (
                <Badge className="bg-red-500/90 text-white shadow-lg flex items-center space-x-1">
                  <XCircle className="h-3 w-3" />
                  <span>Fechado</span>
                </Badge>
              )}
            </div>
            
            {/* Informações principais sobre o banner */}
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-xl font-bold mb-1 drop-shadow-lg">{salon.name}</h3>
              <p className="text-sm opacity-90 drop-shadow">Por: {salon.owner_name}</p>
            </div>
          </div>

          <CardContent className="p-6 space-y-4">
            {/* Endereço */}
            <div className="flex items-start space-x-3 text-gray-600">
              <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm leading-relaxed">{salon.address}</p>
                {(salon.city || salon.state) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {salon.city}{salon.city && salon.state && ', '}{salon.state}
                  </p>
                )}
              </div>
            </div>
            
            {/* Telefone */}
            <div className="flex items-center space-x-3 text-gray-600">
              <Phone className="h-5 w-5 flex-shrink-0 text-green-500" />
              <span className="text-sm font-medium">
                {formatPhoneNumber(salon.contact_phone || salon.phone)}
              </span>
            </div>

            {/* Status de disponibilidade */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                {salon.is_open ? (
                  <Badge className="bg-green-50 text-green-700 border-green-200 text-xs font-medium">
                    Aceitando Agendamentos
                  </Badge>
                ) : (
                  <Badge className="bg-red-50 text-red-700 border-red-200 text-xs font-medium">
                    Não Disponível
                  </Badge>
                )}
              </div>
            </div>

            {/* Botão de agendamento */}
            <Button 
              onClick={() => handleBookService(salon)}
              className={`w-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                salon.is_open 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed hover:scale-100'
              }`}
              disabled={!salon.is_open}
              size="lg"
            >
              {salon.is_open ? (
                <span className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Agendar Serviço</span>
                </span>
              ) : (
                'Não Disponível'
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SalonList;
