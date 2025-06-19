
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormData {
  street_number: string;
  city: string;
  state: string;
  contact_phone: string;
  opening_hours: any;
}

interface ContactStepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

const ContactStep = ({ formData, setFormData }: ContactStepProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="contact_phone">Telefone para Contato</Label>
        <Input
          id="contact_phone"
          value={formData.contact_phone}
          onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
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
