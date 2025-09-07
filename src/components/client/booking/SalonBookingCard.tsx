
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Phone, Calendar, Star, Users, Clock, Instagram, X } from "lucide-react";
import { Salon } from '@/hooks/useSupabaseData';

interface SalonBookingCardProps {
  salon: Salon;
  onOpenBookingModal: () => void;
}

const SalonBookingCard = ({ salon, onOpenBookingModal }: SalonBookingCardProps) => {
  const [showHoursPopup, setShowHoursPopup] = useState(false);

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

  const formatOpeningHours = () => {
    if (!salon.opening_hours) return null;
    
    const daysOfWeek = [
      { key: 'monday', label: 'Segunda-feira' },
      { key: 'tuesday', label: 'Terça-feira' },
      { key: 'wednesday', label: 'Quarta-feira' },
      { key: 'thursday', label: 'Quinta-feira' },
      { key: 'friday', label: 'Sexta-feira' },
      { key: 'saturday', label: 'Sábado' },
      { key: 'sunday', label: 'Domingo' }
    ];

    return daysOfWeek.map(day => {
      const daySchedule = salon.opening_hours[day.key];
      if (!daySchedule) return null;
      
      if (daySchedule.closed) {
        return (
          <div key={day.key} className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-medium">{day.label}</span>
            <span className="text-red-500">Fechado</span>
          </div>
        );
      }

      return (
        <div key={day.key} className="flex justify-between py-2 border-b border-gray-100">
          <span className="font-medium">{day.label}</span>
          <span className="text-green-600">{daySchedule.open} - {daySchedule.close}</span>
        </div>
      );
    }).filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Banner Circular no Topo */}
      <div className="relative pt-8 pb-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl">
              {salon.banner_image_url ? (
                <img
                  src={salon.banner_image_url}
                  alt={`Banner do ${salon.name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <Users className="w-12 h-12 text-white" />
                </div>
              )}
            </div>
            {/* Badge do Plano */}
            <div className="absolute -top-2 -right-2">
              <Badge className={`${getPlanColor(salon.plan)} px-2 py-1 text-xs font-bold shadow-lg`}>
                {getPlanName(salon.plan)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Informações do Estabelecimento */}
      <Card className="mx-4 border-0 bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl">
        <CardContent className="p-6">
          {/* Nome e Responsável */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {salon.name}
            </h1>
            <p className="text-gray-600 text-sm">
              Responsável: {salon.owner_name}
            </p>
          </div>

          {/* Informações de Contato */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3 text-gray-600">
              <MapPin className="h-4 w-4 text-purple-500" />
              <span className="text-sm">{salon.address}</span>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-600">
              <Phone className="h-4 w-4 text-purple-500" />
              <span className="text-sm">{salon.contact_phone || salon.phone}</span>
            </div>
          </div>

          {/* Status */}
          <div className="text-center mb-6">
            {salon.is_open ? (
              <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2 text-sm">
                Aceitando Agendamentos
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800 border-red-200 px-4 py-2 text-sm">
                Fechado
              </Badge>
            )}
          </div>

          {/* Ícones de Ação - Estilo Beacons */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Instagram */}
            {salon.instagram_username && salon.instagram_username.trim() !== '' ? (
              <a
                href={`https://instagram.com/${salon.instagram_username.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 hover:from-pink-200 hover:to-purple-200 text-pink-700 transition-all duration-300"
              >
                <Instagram className="w-6 h-6 mb-2" />
                <span className="text-xs font-medium">Instagram</span>
              </a>
            ) : (
              <div></div>
            )}

            {/* Avaliações */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-700">
              <Star className="w-6 h-6 mb-2" />
              <span className="text-xs font-medium">Avaliações</span>
            </div>

            {/* Horários */}
            <button
              onClick={() => setShowHoursPopup(true)}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 hover:from-green-200 hover:to-emerald-200 transition-all duration-300"
            >
              <Clock className="w-6 h-6 mb-2" />
              <span className="text-xs font-medium">Horários</span>
            </button>
          </div>

          {/* Botão Principal */}
          <Button
            onClick={onOpenBookingModal}
            disabled={!salon.is_open}
            className={`w-full py-4 text-lg font-semibold rounded-2xl transition-all duration-300 ${
              salon.is_open 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {salon.is_open ? 'Agendar' : 'Não Disponível'}
          </Button>
        </CardContent>
      </Card>

      {/* Popup de Horários */}
      <Dialog open={showHoursPopup} onOpenChange={setShowHoursPopup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Horários de Funcionamento
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHoursPopup(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            {salon.opening_hours ? (
              formatOpeningHours()
            ) : (
              <p className="text-gray-500 text-center py-4">
                Horários não cadastrados
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalonBookingCard;
