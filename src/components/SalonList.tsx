
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Scissors, Star } from "lucide-react";
import { Salon } from '@/hooks/useSupabaseData';

interface SalonListProps {
  salons: Salon[];
  onBookService: (salon: Salon) => void;
}

const SalonList = ({ salons, onBookService }: SalonListProps) => {
  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'bronze':
        return 'bg-orange-100 text-orange-800';
      case 'prata':
        return 'bg-gray-100 text-gray-800';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (salons.length === 0) {
    return (
      <div className="text-center py-8">
        <Scissors className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum estabelecimento encontrado
        </h3>
        <p className="text-gray-600">
          Não há estabelecimentos disponíveis no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {salons.map((salon) => (
        <Card key={salon.id} className="hover:shadow-lg transition-shadow">
          {salon.banner_image_url && (
            <div className="h-48 overflow-hidden rounded-t-lg">
              <img 
                src={salon.banner_image_url} 
                alt={salon.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg">
                  <Scissors className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{salon.name}</CardTitle>
                  <p className="text-sm text-gray-600">Estabelecimento</p>
                </div>
              </div>
              <Badge className={getPlanBadgeColor(salon.plan)}>
                {salon.plan.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{salon.address}</span>
              </div>
              {salon.phone && (
                <div className="flex items-center">
                  <span className="font-medium">Telefone:</span>
                  <span className="ml-2">{salon.phone}</span>
                </div>
              )}
              {salon.opening_hours && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Horários disponíveis</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <Button 
                onClick={() => onBookService(salon)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Star className="h-4 w-4 mr-2" />
                Agendar Serviço
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SalonList;
