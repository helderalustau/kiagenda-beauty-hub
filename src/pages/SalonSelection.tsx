
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Phone, Crown, Scissors } from "lucide-react";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";

const SalonSelection = () => {
  const { salons, fetchAllSalons, loading } = useSupabaseData();
  const { toast } = useToast();

  useEffect(() => {
    fetchAllSalons();
  }, []);

  const handleSalonSelect = (salonId: string) => {
    localStorage.setItem('selectedSalonId', salonId);
    window.location.href = '/client-dashboard';
  };

  const handleGoBack = () => {
    window.location.href = '/';
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
      case 'gold': return 'Gold';
      default: return 'Bronze';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando estabelecimentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header - Responsivo */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                onClick={handleGoBack}
                className="flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-blue-600 to-pink-500 p-1.5 sm:p-2 rounded-lg">
                  <Scissors className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
                  <span className="hidden sm:inline">Escolha um Estabelecimento</span>
                  <span className="sm:hidden">Estabelecimentos</span>
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
            Selecione o estabelecimento para agendar
          </h2>
          <p className="text-base sm:text-lg text-gray-600 px-4">
            Escolha entre os melhores salões de beleza da sua região
          </p>
        </div>

        {salons.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 sm:p-8 max-w-md mx-auto">
              <Scissors className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum estabelecimento encontrado
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Não há estabelecimentos cadastrados no momento.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {salons.map((salon) => (
              <Card 
                key={salon.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer bg-white/80 backdrop-blur-sm border-0"
                onClick={() => handleSalonSelect(salon.id)}
              >
                <CardHeader className="pb-3 p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2 break-words">
                        {salon.name}
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-sm">
                        {salon.owner_name}
                      </CardDescription>
                    </div>
                    <Badge className={`ml-2 flex-shrink-0 text-xs ${getPlanColor(salon.plan)}`}>
                      <Crown className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                      {getPlanName(salon.plan)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 p-4 sm:p-6">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="break-words">{salon.address}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span>{salon.phone}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 text-sm sm:text-base"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSalonSelect(salon.id);
                    }}
                  >
                    Agendar Serviços
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalonSelection;
