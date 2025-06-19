
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormData {
  salon_name: string;
  category_id: string;
  street_number: string;
  city: string;
  state: string;
  contact_phone: string;
  opening_hours: any;
}

interface AddressStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

const AddressStep = ({ formData, updateFormData }: AddressStepProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center py-4 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Endereço do Estabelecimento
        </h3>
        <p className="text-gray-600">
          Forneça o endereço completo onde seu estabelecimento está localizado.
        </p>
      </div>

      <div>
        <Label htmlFor="street_number">Nome da Rua e Número *</Label>
        <Input
          id="street_number"
          value={formData.street_number}
          onChange={(e) => updateFormData({ street_number: e.target.value })}
          placeholder="Ex: Rua das Flores, 123"
        />
      </div>
      <div>
        <Label htmlFor="city">Cidade *</Label>
        <Input
          id="city"
          value={formData.city}
          onChange={(e) => updateFormData({ city: e.target.value })}
          placeholder="Ex: São Paulo"
        />
      </div>
      <div>
        <Label htmlFor="state">Estado *</Label>
        <Input
          id="state"
          value={formData.state}
          onChange={(e) => updateFormData({ state: e.target.value })}
          placeholder="Ex: SP"
        />
      </div>
    </div>
  );
};

export default AddressStep;
