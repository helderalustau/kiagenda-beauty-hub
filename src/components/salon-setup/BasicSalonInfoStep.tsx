
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormData {
  salon_name: string;
  street_number: string;
  city: string;
  state: string;
  contact_phone: string;
  opening_hours: any;
}

interface BasicSalonInfoStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

const BasicSalonInfoStep = ({ formData, updateFormData }: BasicSalonInfoStepProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center py-4 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Informações do Estabelecimento
        </h3>
        <p className="text-gray-600">
          Agora vamos definir o nome do seu estabelecimento.
        </p>
      </div>

      <div>
        <Label htmlFor="salon_name">Nome do Estabelecimento *</Label>
        <Input
          id="salon_name"
          value={formData.salon_name}
          onChange={(e) => updateFormData({ salon_name: e.target.value })}
          placeholder="Digite o nome do seu estabelecimento"
          className={!formData.salon_name?.trim() ? "border-red-300" : ""}
        />
      </div>
    </div>
  );
};

export default BasicSalonInfoStep;
