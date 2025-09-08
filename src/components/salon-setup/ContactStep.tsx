
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

// Função para formatar telefone brasileiro
const formatBrazilianPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  const limitedNumbers = numbers.slice(0, 11);
  
  if (limitedNumbers.length === 0) return '';
  if (limitedNumbers.length <= 2) return `(${limitedNumbers}`;
  if (limitedNumbers.length <= 6) return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
  if (limitedNumbers.length <= 10) return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`;
  return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
};

const ContactStep = ({ formData, updateFormData }: ContactStepProps) => {
  const handlePhoneChange = (value: string) => {
    // Aplicar formatação brasileira automaticamente
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
              placeholder="(83) 99802-2115"
              value={formData.contact_phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="text-sm"
              maxLength={15}
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
