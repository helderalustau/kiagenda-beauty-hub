
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Filter, Eye, EyeOff } from "lucide-react";

interface LocationFilterProps {
  clientCity?: string;
  clientState?: string;
  locationFilter: {
    enabled: boolean;
    showOtherCities: boolean;
  };
  onToggleLocationFilter: () => void;
  onToggleShowOtherCities: () => void;
  salonsCount: number;
}

export const LocationFilter = ({
  clientCity,
  clientState,
  locationFilter,
  onToggleLocationFilter,
  onToggleShowOtherCities,
  salonsCount
}: LocationFilterProps) => {
  if (!clientState) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-amber-600">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">
              Complete seu perfil com estado para ver estabelecimentos próximos
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">
              {locationFilter.enabled 
                ? (locationFilter.showOtherCities 
                    ? `Estabelecimentos em ${clientState}` 
                    : (clientCity ? `Estabelecimentos em ${clientCity}, ${clientState}` : `Estabelecimentos em ${clientState}`))
                : 'Todos os estabelecimentos'
              }
            </span>
            <span className="text-xs text-gray-500">
              ({salonsCount} encontrados)
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {locationFilter.enabled && clientCity && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleShowOtherCities}
                className="text-xs"
              >
                {locationFilter.showOtherCities ? (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Apenas {clientCity}
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    Outras cidades
                  </>
                )}
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleLocationFilter}
              className="text-xs"
            >
              <Filter className="h-3 w-3 mr-1" />
              {locationFilter.enabled ? 'Desabilitar filtro' : 'Filtrar por localização'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
