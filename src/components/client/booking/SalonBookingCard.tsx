
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone } from "lucide-react";
import { Salon } from '@/hooks/useSupabaseData';

interface SalonBookingCardProps {
  salon: Salon;
  onOpenBookingModal: () => void;
}

const SalonBookingCard = ({ salon, onOpenBookingModal }: SalonBookingCardProps) => {
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

  return (
    <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-2xl">
      <CardHeader className="text-center pb-6">
        <div className="flex justify-between items-start mb-4">
          <CardTitle className="text-3xl font-bold text-gray-900">
            {salon.name}
          </CardTitle>
          <Badge className={getPlanColor(salon.plan)}>
            {getPlanName(salon.plan)}
          </Badge>
        </div>
        <div className="text-lg text-gray-600">
          Responsável: {salon.owner_name}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="flex items-center space-x-3 text-gray-600">
            <MapPin className="h-5 w-5" />
            <span>{salon.address}</span>
          </div>
          
          <div className="flex items-center space-x-3 text-gray-600">
            <Phone className="h-5 w-5" />
            <span>{salon.contact_phone || salon.phone}</span>
          </div>
        </div>

        <div className="text-center">
          <div className="mb-6">
            {salon.is_open ? (
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
            onClick={onOpenBookingModal}
            disabled={!salon.is_open}
            className={`w-full py-4 text-lg font-semibold transition-all duration-300 ${
              salon.is_open 
                ? 'bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {salon.is_open ? 'Agendar Serviço' : 'Não Disponível'}
          </Button>
        </div>

        {salon.banner_image_url && (
          <div className="mt-4">
            <img
              src={salon.banner_image_url}
              alt={`Banner do ${salon.name}`}
              className="w-full h-24 object-cover rounded-lg"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalonBookingCard;
