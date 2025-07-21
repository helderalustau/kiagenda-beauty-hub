
import React from 'react';
import { Switch } from "@/components/ui/switch";

interface ServiceToggleProps {
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const ServiceToggle = ({ isActive, onToggle, disabled = false, loading = false }: ServiceToggleProps) => {
  console.log('ServiceToggle - Props:', { isActive, disabled, loading });
  
  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={isActive}
        onCheckedChange={onToggle}
        disabled={disabled || loading}
        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-400"
      />
      <span className={`text-sm font-medium ${
        loading 
          ? 'text-gray-400' 
          : isActive 
            ? 'text-green-600' 
            : 'text-gray-500'
      }`}>
        {loading ? 'Alterando...' : isActive ? 'Ativo' : 'Desabilitado'}
      </span>
    </div>
  );
};

export default ServiceToggle;
