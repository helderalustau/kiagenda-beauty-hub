
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface ServiceItemProps {
  service: any;
  isSelected: boolean;
  currentPrice: number | string;
  onServiceToggle: (serviceId: string) => void;
  onServicePriceChange: (serviceId: string, price: number) => void;
  isCustomService?: boolean;
}

export const ServiceItem: React.FC<ServiceItemProps> = ({
  service,
  isSelected,
  currentPrice,
  onServiceToggle,
  onServicePriceChange,
  isCustomService = false
}) => {
  const numericPrice = typeof currentPrice === 'string' ? parseFloat(currentPrice) || 0 : currentPrice;
  const hasValidPrice = isSelected && numericPrice > 0;

  return (
    <div className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
      isSelected && !hasValidPrice ? 'border-amber-300 bg-amber-50' : ''
    }`}>
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onServiceToggle(service.id)}
      />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm flex items-center space-x-2">
          <span>{service.name}</span>
          {isCustomService && (
            <Badge variant="secondary" className="text-xs">
              Personalizado
            </Badge>
          )}
        </div>
        <div className="text-xs text-gray-500 flex items-center space-x-2">
          <span className="truncate">{service.description || 'Sem descrição'}</span>
          <span className="flex items-center space-x-1 flex-shrink-0">
            <Clock className="h-3 w-3" />
            <span>{service.default_duration_minutes || service.duration_minutes} min</span>
          </span>
        </div>
      </div>
      {isSelected && (
        <div className="w-24 flex-shrink-0">
          <Input
            type="number"
            placeholder="R$ 0,00"
            value={currentPrice}
            onChange={(e) => onServicePriceChange(service.id, Number(e.target.value))}
            className={`text-sm h-8 ${!hasValidPrice ? 'border-amber-300' : ''}`}
            min="0.01"
            step="0.01"
            required
          />
          {isSelected && !hasValidPrice && (
            <p className="text-xs text-amber-600 mt-1">Preço obrigatório</p>
          )}
        </div>
      )}
    </div>
  );
};
