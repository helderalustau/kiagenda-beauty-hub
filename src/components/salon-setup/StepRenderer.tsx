
import React from 'react';
import BasicInfoStep from './BasicInfoStep';
import BasicSalonInfoStep from './BasicSalonInfoStep';
import AddressStep from './AddressStep';
import ContactStep from './ContactStep';
import HoursStep from './HoursStep';
import ServicesStep from './ServicesStep';
import { Salon, Category, PresetService } from '@/hooks/useSupabaseData';

interface FormData {
  salon_name: string;
  category_id: string;
  street_number: string;
  city: string;
  state: string;
  contact_phone: string;
  opening_hours: any;
}

interface StepRendererProps {
  currentStep: number;
  salon: Salon | null;
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  categories: Category[];
  presetServices: PresetService[];
  selectedServices: { [key: string]: { selected: boolean; price: number } };
  onServiceToggle: (serviceId: string) => void;
  onServicePriceChange: (serviceId: string, price: number) => void;
}

export const StepRenderer = ({
  currentStep,
  salon,
  formData,
  updateFormData,
  categories,
  presetServices,
  selectedServices,
  onServiceToggle,
  onServicePriceChange
}: StepRendererProps) => {
  switch (currentStep) {
    case 0:
      return <BasicInfoStep salon={salon} />;
    case 1:
      return (
        <BasicSalonInfoStep 
          formData={formData} 
          updateFormData={updateFormData} 
          categories={categories}
        />
      );
    case 2:
      return <AddressStep formData={formData} updateFormData={updateFormData} />;
    case 3:
      return <ContactStep formData={formData} updateFormData={updateFormData} />;
    case 4:
      return <HoursStep formData={formData} updateFormData={updateFormData} />;
    case 5:
      return (
        <ServicesStep
          presetServices={presetServices}
          selectedServices={selectedServices}
          onServiceToggle={onServiceToggle}
          onServicePriceChange={onServicePriceChange}
        />
      );
    default:
      return null;
  }
};
