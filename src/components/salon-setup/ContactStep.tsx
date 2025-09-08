
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone } from "lucide-react";

interface FormData {
  salon_name: string;
  street_number: string;
  city: string;
  state: string;
  contact_phone: string;
  opening_hours: any;
}

interface ContactStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

// Função para formatar telefone internacional brasileiro
const formatBrazilianPhone = (value: string): string => {
  let numbers = value.replace(/\D/g, '');
  
  // Remove o código do país se já estiver presente
  if (numbers.startsWith('55') && numbers.length > 11) {
    numbers = numbers.substring(2);
  }
  
  // Limita a 11 dígitos
  numbers = numbers.substring(0, 11);
  
  if (numbers.length === 0) return '';
  if (numbers.length <= 2) return `+55 (${numbers}`;
  if (numbers.length <= 6) return `+55 (${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `+55 (${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `+55 (${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
};

const ContactStep = ({ formData, updateFormData }: ContactStepProps) => {
  const handlePhoneChange = (value: string) => {
    // Aplicar formatação internacional brasileira automaticamente
    const formatted = formatBrazilianPhone(value);
    updateFormData({ contact_phone: formatted });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Phone className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Informações de Contato
        </h3>
        <p className="text-gray-600">
          Como seus clientes poderão entrar em contato
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Telefone de Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="contact_phone">Telefone Principal</Label>
            <Input
              id="contact_phone"
              placeholder="+55 (83) 99802-2115"
              value={formData.contact_phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="text-sm"
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              Digite apenas números - a formatação é automática
            </p>
          </div>

          {formData.contact_phone && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                <strong>Telefone:</strong> {formData.contact_phone}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactStep;
