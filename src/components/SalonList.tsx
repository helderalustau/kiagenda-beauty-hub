
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Star, Clock, CheckCircle, XCircle } from "lucide-react";
import { Salon } from '@/hooks/useSupabaseData';

interface SalonListProps {
  salons: Salon[];
  onBookService: (salon: Salon) => Promise<void>;
}

const SalonList = ({ salons, onBookService }: SalonListProps) => {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {salons.map((salon) => (
        <Card key={salon.id} className="hover:shadow-lg transition-shadow border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg text-gray-900">{salon.name}</CardTitle>
              <Badge className={getPlanColor(salon.plan)}>
                {getPlanName(salon.plan)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{salon.address}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{salon.contact_phone || salon.phone}</span>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4" />
              <div className="flex items-center space-x-2">
                {salon.is_open ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Aceitando Agendamento
                    </Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      Fechado
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>4.8 (124 avaliações)</span>
            </div>

            <div className="pt-2">
              <Button 
                onClick={() => onBookService(salon)}
                className={`w-full font-semibold transition-all duration-300 ${
                  salon.is_open 
                    ? 'bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!salon.is_open}
              >
                {salon.is_open ? 'Agendar Serviço' : 'Não Disponível'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SalonList;
