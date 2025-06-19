
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

interface ContactStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

const ContactStep = ({ formData, updateFormData }: ContactStepProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center py-4 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Contato do Estabelecimento
        </h3>
        <p className="text-gray-600">
          Forneça informações de contato para que os clientes possam entrar em contato.
        </p>
      </div>

      <div>
        <Label htmlFor="contact_phone">Telefone para Contato *</Label>
        <Input
          id="contact_phone"
          value={formData.contact_phone}
          onChange={(e) => updateFormData({ contact_phone: e.target.value })}
          placeholder="(11) 99999-9999"
        />
        <p className="text-sm text-gray-500 mt-1">
          Este telefone será exibido para os clientes entrarem em contato
        </p>
      </div>
    </div>
  );
};

export default ContactStep;
