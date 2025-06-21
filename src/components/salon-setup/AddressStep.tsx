
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { StateSelect } from "@/components/ui/state-select";

interface FormData {
  salon_name: string;
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
  const handleInputChange = (field: keyof FormData, value: string) => {
    // Auto format to uppercase for address fields
    if (field === 'street_number' || field === 'city') {
      value = value.toUpperCase();
    }
    updateFormData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Endereço do Estabelecimento
        </h3>
        <p className="text-gray-600">
          Informe o endereço onde seus clientes irão encontrar você
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do Endereço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="street_number">Rua e Número *</Label>
            <Input
              id="street_number"
              placeholder="Ex: RUA JOAQUIM RODRIGUES 107"
              value={formData.street_number}
              onChange={(e) => handleInputChange('street_number', e.target.value)}
              className="text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Informe a rua completa com número
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                placeholder="Ex: BELEM"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="text-sm"
              />
            </div>

            <div>
              <Label htmlFor="state">Estado *</Label>
              <StateSelect
                value={formData.state}
                onValueChange={(value) => updateFormData({ state: value })}
                placeholder="Selecione o estado"
              />
            </div>
          </div>

          {(formData.street_number || formData.city || formData.state) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Endereço:</strong> {formData.street_number}
                {formData.city && `, ${formData.city}`}
                {formData.state && `, ${formData.state}`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AddressStep;
