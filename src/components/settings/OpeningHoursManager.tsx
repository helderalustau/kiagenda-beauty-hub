
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useOpeningHours } from '@/hooks/useOpeningHours';
import { Loader2, Save, RotateCcw, Clock, Plus, X, Calendar, Coffee } from 'lucide-react';

interface OpeningHoursManagerProps {
  salonId: string;
  initialHours: any;
}

const OpeningHoursManager = ({ salonId, initialHours }: OpeningHoursManagerProps) => {
  const {
    openingHours,
    specialDates,
    hasChanges,
    saving,
    updateDaySchedule,
    addSpecialDate,
    updateSpecialDate,
    removeSpecialDate,
    saveOpeningHours,
    resetChanges
  } = useOpeningHours(salonId, initialHours);

  const [showSpecialDates, setShowSpecialDates] = useState(false);
  const [newSpecialDate, setNewSpecialDate] = useState({
    date: '',
    reason: '',
    closed: true,
    customHours: { open: '08:00', close: '18:00' }
  });
  const [applyToAllDays, setApplyToAllDays] = useState(false);

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

  const handleAddSpecialDate = () => {
    if (newSpecialDate.date && newSpecialDate.reason) {
      addSpecialDate(newSpecialDate);
      setNewSpecialDate({
        date: '',
        reason: '',
        closed: true,
        customHours: { open: '08:00', close: '18:00' }
      });
    }
  };

  const handleApplyToAllDays = (checked: boolean) => {
    setApplyToAllDays(checked);
    if (checked) {
      const mondayHours = openingHours.monday;
      const otherDays = ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      otherDays.forEach(day => {
        updateDaySchedule(day as keyof typeof openingHours, 'open', mondayHours.open);
        updateDaySchedule(day as keyof typeof openingHours, 'close', mondayHours.close);
        updateDaySchedule(day as keyof typeof openingHours, 'closed', mondayHours.closed);
        updateDaySchedule(day as keyof typeof openingHours, 'lunchBreak', mondayHours.lunchBreak);
      });
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-6 w-6 text-blue-600" />
          <span>Horário de Funcionamento</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Horários Regulares */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Horários Regulares
            </h3>
            
            {dayOrder.map((day, index) => {
              const hours = openingHours[day as keyof typeof openingHours];
              const isMonday = day === 'monday';
              return (
                <div key={day} className="border rounded-lg bg-white shadow-sm">
                  <div className="flex items-center space-x-4 p-4">
                    <div className="w-32 flex-shrink-0">
                      <span className="font-medium text-gray-700">
                        {getDayName(day)}
                      </span>
                      {isMonday && (
                        <div className="mt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={applyToAllDays}
                              onCheckedChange={handleApplyToAllDays}
                            />
                            <span className="text-xs text-gray-500">
                              Aplicar para todos os dias
                            </span>
                          </div>
                        </div>
                      )}
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

          {/* Datas Especiais */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Datas Especiais (Feriados/Exceções)
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSpecialDates(!showSpecialDates)}
              >
                {showSpecialDates ? 'Ocultar' : 'Gerenciar'}
              </Button>
            </div>

            {/* Lista de Datas Especiais */}
            {specialDates.length > 0 && (
              <div className="space-y-2">
                {specialDates.map((specialDate, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">
                          {new Date(specialDate.date).toLocaleDateString('pt-BR')}
                        </span>
                        <Badge variant={specialDate.closed ? 'destructive' : 'secondary'}>
                          {specialDate.closed ? 'Fechado' : 'Horário Especial'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{specialDate.reason}</p>
                      {!specialDate.closed && specialDate.customHours && (
                        <p className="text-xs text-gray-500">
                          {specialDate.customHours.open} às {specialDate.customHours.close}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSpecialDate(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Formulário para Nova Data Especial */}
            {showSpecialDates && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-3">Adicionar Data Especial</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Data</label>
                    <Input
                      type="date"
                      value={newSpecialDate.date}
                      onChange={(e) => setNewSpecialDate(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Motivo</label>
                    <Input
                      placeholder="Ex: Feriado Nacional, Evento Especial..."
                      value={newSpecialDate.reason}
                      onChange={(e) => setNewSpecialDate(prev => ({ ...prev, reason: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={newSpecialDate.closed}
                      onCheckedChange={(checked) => setNewSpecialDate(prev => ({ ...prev, closed: !!checked }))}
                    />
                    <span className="text-sm">Estabelecimento fechado nesta data</span>
                  </div>

                  {!newSpecialDate.closed && (
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">Horário especial:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Das:</span>
                        <Input
                          type="time"
                          value={newSpecialDate.customHours.open}
                          onChange={(e) => setNewSpecialDate(prev => ({
                            ...prev,
                            customHours: { ...prev.customHours, open: e.target.value }
                          }))}
                          className="w-24"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Às:</span>
                        <Input
                          type="time"
                          value={newSpecialDate.customHours.close}
                          onChange={(e) => setNewSpecialDate(prev => ({
                            ...prev,
                            customHours: { ...prev.customHours, close: e.target.value }
                          }))}
                          className="w-24"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <Button onClick={handleAddSpecialDate} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Adicionar Data Especial</span>
                  </Button>
                </div>
              </div>
            )}
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
        </div>
      </CardContent>
    </Card>
  );
};

export default OpeningHoursManager;
