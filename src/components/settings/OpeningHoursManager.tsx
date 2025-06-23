
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useOpeningHours } from '@/hooks/useOpeningHours';
import { Loader2, Save, RotateCcw, Clock } from 'lucide-react';

interface OpeningHoursManagerProps {
  salonId: string;
  initialHours: any;
}

const OpeningHoursManager = ({ salonId, initialHours }: OpeningHoursManagerProps) => {
  const {
    openingHours,
    hasChanges,
    saving,
    updateDaySchedule,
    saveOpeningHours,
    resetChanges
  } = useOpeningHours(salonId, initialHours);

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

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-6 w-6 text-blue-600" />
          <span>Horário de Funcionamento</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {dayOrder.map((day) => {
            const hours = openingHours[day as keyof typeof openingHours];
            return (
              <div key={day} className="flex items-center space-x-4 p-4 border rounded-lg bg-white shadow-sm">
                <div className="w-32 flex-shrink-0">
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
            );
          })}
        </div>

        {/* Botões de ação */}
        <div className="flex justify-between items-center pt-6 border-t mt-6">
          <div className="flex space-x-2">
            {hasChanges && (
              <Button
                variant="outline"
                onClick={resetChanges}
                disabled={saving}
                className="flex items-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Cancelar Alterações</span>
              </Button>
            )}
          </div>

          <Button
            onClick={saveOpeningHours}
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Você possui alterações não salvas nos horários de funcionamento.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OpeningHoursManager;
