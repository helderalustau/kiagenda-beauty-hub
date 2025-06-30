
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, CheckCircle, XCircle } from "lucide-react";
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
        return 'bg-amber-100 text-amber-800';
      case 'prata':
        return 'bg-gray-100 text-gray-800';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {salons.map((salon) => (
        <Card key={salon.id} className="hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
          {/* Banner da loja */}
          <div className="relative h-40 overflow-hidden">
            <img
              src={salon.banner_image_url || getDefaultBanner()}
              alt={`Banner ${salon.name}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getDefaultBanner();
              }}
            />
            <div className="absolute top-3 right-3">
              <Badge className={getPlanColor(salon.plan)}>
                {getPlanName(salon.plan)}
              </Badge>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-3 left-3 text-white">
              <h3 className="text-lg font-bold">{salon.name}</h3>
              <p className="text-sm opacity-90">Por: {salon.owner_name}</p>
            </div>
          </div>

          <CardContent className="p-4 space-y-3">
            <div className="flex items-start space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{salon.address}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>{formatPhoneNumber(salon.contact_phone || salon.phone)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                {salon.is_open ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                      Aceitando Agendamento
                    </Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                      Fechado
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <Button 
              onClick={() => handleBookService(salon)}
              className={`w-full font-semibold transition-all duration-300 ${
                salon.is_open 
                  ? 'bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!salon.is_open}
            >
              {salon.is_open ? 'Agendar Serviço' : 'Não Disponível'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SalonList;
