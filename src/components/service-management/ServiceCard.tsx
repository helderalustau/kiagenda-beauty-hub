
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Scissors, Clock, DollarSign, MoreVertical, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Service } from '@/hooks/useSupabaseData';

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggleStatus: (service: Service) => void;
}

const ServiceCard = ({ service, onEdit, onDelete, onToggleStatus }: ServiceCardProps) => {
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
    <Card className={`transition-all duration-300 hover:shadow-lg border-2 ${
      service.active 
        ? 'border-gray-200 bg-white hover:border-blue-300' 
        : 'border-gray-300 bg-gray-50 opacity-75'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Scissors className={`h-4 w-4 mr-2 ${service.active ? 'text-blue-600' : 'text-gray-400'}`} />
              {service.name}
            </CardTitle>
            {service.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {service.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <Badge 
              variant={service.active ? "default" : "secondary"}
              className={service.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
            >
              {service.active ? 'Ativo' : 'Inativo'}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border shadow-lg">
                <DropdownMenuItem onClick={() => onEdit(service)} className="cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleStatus(service)} className="cursor-pointer">
                  {service.active ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Desativar
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Ativar
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(service)} 
                  className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="h-4 w-4 mr-1 text-green-600" />
              <span>Preço:</span>
            </div>
            <span className="font-bold text-lg text-green-600">
              {formatCurrency(service.price)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1 text-blue-600" />
              <span>Duração:</span>
            </div>
            <span className="font-semibold text-blue-600">
              {formatDuration(service.duration_minutes)}
            </span>
          </div>
          
          <div className="pt-2">
            <Button
              onClick={() => onEdit(service)}
              variant="outline"
              size="sm"
              className="w-full hover:bg-blue-50 hover:border-blue-300"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Serviço
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
