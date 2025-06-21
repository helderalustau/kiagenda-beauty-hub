
import React from 'react';
import { Switch } from "@/components/ui/switch";

interface ServiceToggleProps {
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const ServiceToggle = ({ isActive, onToggle, disabled = false }: ServiceToggleProps) => {
  console.log('ServiceToggle - Props:', { isActive, disabled });
  
  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={isActive}
        onCheckedChange={onToggle}
        disabled={disabled}
        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-400"
      />
      <span className={`text-sm font-medium ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
        {isActive ? 'Ativo' : 'Desabilitado'}
      </span>
    </div>
  );
};

export default ServiceToggle;
