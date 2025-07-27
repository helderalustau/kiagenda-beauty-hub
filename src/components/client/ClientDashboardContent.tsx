
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, MapPin, Calendar, Clock, Star } from "lucide-react";
import { LocationFilter } from './LocationFilter';
import { Salon } from '@/types/supabase-entities';

interface ClientDashboardContentProps {
  salons: Salon[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
  handleBookService: (salon: Salon) => void;
  loading: boolean;
  user: any;
  locationFilter: {
    enabled: boolean;
    showOtherCities: boolean;
  };
  toggleLocationFilter: () => void;
  toggleShowOtherCities: () => void;
}

const ClientDashboardContent = ({
  salons,
  searchTerm,
  setSearchTerm,
  clearSearch,
  handleBookService,
  loading,
  user,
  locationFilter,
  toggleLocationFilter,
  toggleShowOtherCities
}: ClientDashboardContentProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtro de localização */}
      <LocationFilter
        clientCity={user?.city}
        clientState={user?.state}
        locationFilter={locationFilter}
        onToggleLocationFilter={toggleLocationFilter}
        onToggleShowOtherCities={toggleShowOtherCities}
        salonsCount={salons.length}
      />

      {/* Barra de pesquisa */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar estabelecimentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de estabelecimentos */}
      <div className="grid gap-4">
        {salons.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum estabelecimento encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Tente buscar por outros termos ou ajuste os filtros.'
                  : 'Não há estabelecimentos disponíveis na sua região no momento.'
                }
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={clearSearch}>
                  Limpar pesquisa
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          salons.map((salon) => (
            <Card key={salon.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Imagem do banner */}
                  <div className="w-24 h-24 bg-gray-100 rounded-l-lg flex-shrink-0 overflow-hidden">
                    {salon.banner_image_url ? (
                      <img 
                        src={salon.banner_image_url} 
                        alt={salon.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {salon.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Informações do estabelecimento */}
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {salon.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">
                          {salon.owner_name}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{salon.city || ''}, {salon.state || ''}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          salon.is_open 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {salon.is_open ? 'Aberto' : 'Fechado'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Horário flexível</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span>4.8</span>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handleBookService(salon)}
                        disabled={!salon.is_open}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Agendar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientDashboardContent;
