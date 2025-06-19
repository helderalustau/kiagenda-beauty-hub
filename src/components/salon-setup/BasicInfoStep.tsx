
import React from 'react';
import { Salon } from '@/hooks/useSupabaseData';

interface BasicInfoStepProps {
  salon: Salon | null;
}

const BasicInfoStep = ({ salon }: BasicInfoStepProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center py-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Bem-vindo, {salon?.owner_name}!
        </h3>
        <p className="text-gray-600 mb-6">
          Vamos configurar o seu estabelecimento "{salon?.name}" passo a passo.
          Isso levará apenas alguns minutos.
        </p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-700">
            Essas informações são importantes para que seus clientes possam 
            encontrar e agendar serviços no seu estabelecimento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
