
import React from 'react';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useOpeningHours } from '@/hooks/useOpeningHours';
import { Loader2, Save, RotateCcw, Coffee } from 'lucide-react';

interface FormData {
  salon_name: string;
  street_number: string;
  city: string;
  state: string;
  contact_phone: string;
  opening_hours: any;
}

interface HoursStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  salonId?: string;
}

const HoursStep = ({ formData, updateFormData, salonId }: HoursStepProps) => {
  const {
    openingHours,
    hasChanges,
    saving,
    updateDaySchedule,
    saveOpeningHours,
    resetChanges
  } = useOpeningHours(salonId, formData.opening_hours);

  const getDayName = (day: string) => {
    const names: { [key: string]: string } = {
      'monday': 'Segunda-feira',
      'tuesday': 'Terça-feira',
      'wednesday': 'Quarta-feira',
      'thursday': 'Quinta-feira',
      'friday': 'Sexta-feira',
      'saturday': 'Sábado',
      'sunday': 'Domingo'
    };
    return names[day] || day;
  };

  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const handleSave = async () => {
    const result = await saveOpeningHours();
    if (result.success) {
      updateFormData({ opening_hours: openingHours });
    }
  };

  const handleReset = () => {
    resetChanges();
    updateFormData({ opening_hours: formData.opening_hours });
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-4 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Horários de Funcionamento
        </h3>
        <p className="text-gray-600">
          Defina os horários em que seu estabelecimento funciona, incluindo pausas.
        </p>
      </div>

      <div className="space-y-4">
        {dayOrder.map((day) => {
          const hours = openingHours[day as keyof typeof openingHours];
          return (
            <div key={day} className="border rounded-lg bg-white shadow-sm">
              <div className="flex items-center space-x-4 p-4">
                <div className="w-24 flex-shrink-0">
                  <span className="font-medium text-gray-700">
                    {getDayName(day)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={!hours.closed}
                    onCheckedChange={(checked) => {
                      updateDaySchedule(day as keyof typeof openingHours, 'closed', !checked);
                    }}
                  />
                  <span className="text-sm text-gray-600">Aberto</span>
                </div>
                
                {!hours.closed && (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Das:</span>
                      <Input
                        type="time"
                        value={hours.open}
                        onChange={(e) => {
                          updateDaySchedule(day as keyof typeof openingHours, 'open', e.target.value);
                        }}
                        className="w-24"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Às:</span>
                      <Input
                        type="time"
                        value={hours.close}
                        onChange={(e) => {
                          updateDaySchedule(day as keyof typeof openingHours, 'close', e.target.value);
                        }}
                        className="w-24"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Pausa para Almoço */}
              {!hours.closed && (
                <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center space-x-4 pt-3">
                    <Coffee className="h-4 w-4 text-orange-600" />
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={hours.lunchBreak?.enabled || false}
                        onCheckedChange={(checked) => {
                          updateDaySchedule(day as keyof typeof openingHours, 'lunchBreak', {
                            ...hours.lunchBreak,
                            enabled: checked
                          });
                        }}
                      />
                      <span className="text-sm text-gray-600">Pausa para almoço</span>
                    </div>

                    {hours.lunchBreak?.enabled && (
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Das:</span>
                          <Input
                            type="time"
                            value={hours.lunchBreak?.start || '12:00'}
                            onChange={(e) => {
                              updateDaySchedule(day as keyof typeof openingHours, 'lunchBreak', {
                                ...hours.lunchBreak,
                                start: e.target.value
                              });
                            }}
                            className="w-20 text-xs"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Às:</span>
                          <Input
                            type="time"
                            value={hours.lunchBreak?.end || '13:00'}
                            onChange={(e) => {
                              updateDaySchedule(day as keyof typeof openingHours, 'lunchBreak', {
                                ...hours.lunchBreak,
                                end: e.target.value
                              });
                            }}
                            className="w-20 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botões de ação */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex space-x-2">
          {hasChanges && (
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={saving}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Cancelar Alterações</span>
            </Button>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="flex items-center space-x-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Salvar Horários</span>
            </>
          )}
        </Button>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ Você possui alterações não salvas nos horários de funcionamento.
          </p>
        </div>
      )}
    </div>
  );
};

export default HoursStep;
