
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

const ContactStep = ({ formData, updateFormData }: ContactStepProps) => {
  const formatPhone = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Apply Brazilian phone format
    if (numbers.length <= 10) {
      // Format: (XX) XXXX-XXXX
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      // Format: (XX) XXXXX-XXXX
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const handlePhoneChange = (value: string) => {
    // Only allow numbers and formatting characters
    const numbersOnly = value.replace(/\D/g, '');
    if (numbersOnly.length <= 11) {
      const formatted = formatPhone(numbersOnly);
      updateFormData({ contact_phone: formatted });
    }
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
              Este será o telefone principal para contato dos clientes
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
