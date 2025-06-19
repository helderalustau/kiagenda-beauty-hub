
import React from 'react';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface FormData {
  street_number: string;
  city: string;
  state: string;
  contact_phone: string;
  opening_hours: any;
}

interface HoursStepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

const HoursStep = ({ formData, setFormData }: HoursStepProps) => {
  const getDayName = (day: string) => {
    const names: { [key: string]: string } = {
      'monday': 'Segunda',
      'tuesday': 'Terça',
      'wednesday': 'Quarta',
      'thursday': 'Quinta',
      'friday': 'Sexta',
      'saturday': 'Sábado',
      'sunday': 'Domingo'
    };
    return names[day] || day;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Horários de Funcionamento</h3>
      {Object.entries(formData.opening_hours).map(([day, hours]: [string, any]) => (
        <div key={day} className="flex items-center space-x-4 p-3 border rounded-lg">
          <div className="w-20">
            <span className="font-medium capitalize">
              {getDayName(day)}
            </span>
          </div>
          <Checkbox
            checked={!hours.closed}
            onCheckedChange={(checked) => {
              setFormData({
                ...formData,
                opening_hours: {
                  ...formData.opening_hours,
                  [day]: { ...hours, closed: !checked }
                }
              });
            }}
          />
          <span className="text-sm">Aberto</span>
          {!hours.closed && (
            <>
              <Input
                type="time"
                value={hours.open}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    opening_hours: {
                      ...formData.opening_hours,
                      [day]: { ...hours, open: e.target.value }
                    }
                  });
                }}
                className="w-32"
              />
              <span>às</span>
              <Input
                type="time"
                value={hours.close}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    opening_hours: {
                      ...formData.opening_hours,
                      [day]: { ...hours, close: e.target.value }
                    }
                  });
                }}
                className="w-32"
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default HoursStep;
