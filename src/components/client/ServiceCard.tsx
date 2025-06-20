
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Scissors } from "lucide-react";
import { Service } from '@/hooks/useSupabaseData';

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
  isSelected: boolean;
}

const ServiceCard = ({ service, onSelect, isSelected }: ServiceCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    return `${mins}min`;
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-blue-300'
      }`}
      onClick={() => onSelect(service)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Scissors className="h-5 w-5 mr-2 text-blue-600" />
            {service.name}
          </CardTitle>
          {isSelected && (
            <Badge className="bg-blue-600 text-white">
              Selecionado
            </Badge>
          )}
        </div>
        {service.description && (
          <p className="text-sm text-gray-600 mt-2">{service.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-green-600">
            <DollarSign className="h-4 w-4 mr-1" />
            <span className="font-bold text-lg">{formatCurrency(service.price)}</span>
          </div>
          
          <div className="flex items-center text-blue-600">
            <Clock className="h-4 w-4 mr-1" />
            <span className="font-medium">{formatDuration(service.duration_minutes)}</span>
          </div>
        </div>
        
        <Button 
          className={`w-full ${
            isSelected 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(service);
          }}
        >
          {isSelected ? 'Serviço Selecionado' : 'Selecionar Serviço'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
