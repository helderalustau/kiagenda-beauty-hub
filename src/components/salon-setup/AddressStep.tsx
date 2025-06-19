
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

interface AddressStepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

const AddressStep = ({ formData, setFormData }: AddressStepProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="street_number">Número da Rua</Label>
        <Input
          id="street_number"
          value={formData.street_number}
          onChange={(e) => setFormData({...formData, street_number: e.target.value})}
          placeholder="Ex: 123"
        />
      </div>
      <div>
        <Label htmlFor="city">Cidade</Label>
        <Input
          id="city"
          value={formData.city}
          onChange={(e) => setFormData({...formData, city: e.target.value})}
          placeholder="Ex: São Paulo"
        />
      </div>
      <div>
        <Label htmlFor="state">Estado</Label>
        <Input
          id="state"
          value={formData.state}
          onChange={(e) => setFormData({...formData, state: e.target.value})}
          placeholder="Ex: SP"
        />
      </div>
    </div>
  );
};

export default AddressStep;
