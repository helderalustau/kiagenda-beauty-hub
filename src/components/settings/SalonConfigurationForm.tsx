
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock, User } from "lucide-react";
import { Salon } from '@/hooks/useSupabaseData';

interface SalonConfigurationFormProps {
  salon: Salon;
  onSalonChange: (salon: Salon) => void;
}

const SalonConfigurationForm = ({ salon, onSalonChange }: SalonConfigurationFormProps) => {
  const [openingHours, setOpeningHours] = useState<any>({
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '09:00', close: '16:00', closed: false },
    sunday: { open: '09:00', close: '16:00', closed: true }
  });

  useEffect(() => {
    if (salon?.opening_hours) {
      setOpeningHours(salon.opening_hours);
    }
  }, [salon?.opening_hours]);

  const handleHourChange = (day: string, field: string, value: string | boolean) => {
    const newHours = {
      ...openingHours,
      [day]: {
        ...openingHours[day],
        [field]: value
      }
    };
    setOpeningHours(newHours);
    onSalonChange({
      ...salon,
      opening_hours: newHours
    });
  };

  const dayNames = {
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado',
    sunday: 'Domingo'
  };

  const planTypes = {
    bronze: { name: 'Bronze', color: 'bg-amber-600' },
    silver: { name: 'Prata', color: 'bg-gray-500' },
    gold: { name: 'Ouro', color: 'bg-yellow-500' }
  };

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Informações Básicas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salon-name">Nome do Estabelecimento</Label>
              <Input
                id="salon-name"
                value={salon?.name || ''}
                onChange={(e) => onSalonChange({ ...salon, name: e.target.value })}
                placeholder="Nome do seu estabelecimento"
              />
            </div>
            <div>
              <Label htmlFor="owner-name">Nome do Responsável</Label>
              <Input
                id="owner-name"
                value={salon?.owner_name || ''}
                onChange={(e) => onSalonChange({ ...salon, owner_name: e.target.value })}
                placeholder="Nome do responsável"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="salon-plan">Plano Atual</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={`${planTypes[salon?.plan as keyof typeof planTypes]?.color || 'bg-gray-500'} text-white`}>
                {planTypes[salon?.plan as keyof typeof planTypes]?.name || 'Bronze'}
              </Badge>
              <span className="text-sm text-gray-600">
                Plano ativo do estabelecimento
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações de Contato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <span>Informações de Contato</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salon-phone">Telefone Principal</Label>
              <Input
                id="salon-phone"
                value={salon?.phone || ''}
                onChange={(e) => onSalonChange({ ...salon, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label htmlFor="contact-phone">Telefone de Contato</Label>
              <Input
                id="contact-phone"
                value={salon?.contact_phone || ''}
                onChange={(e) => onSalonChange({ ...salon, contact_phone: e.target.value })}
                placeholder="(11) 88888-8888"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Endereço</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="salon-address">Endereço Completo</Label>
            <Textarea
              id="salon-address"
              value={salon?.address || ''}
              onChange={(e) => onSalonChange({ ...salon, address: e.target.value })}
              placeholder="Rua, número, bairro, cidade, estado"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Horário de Funcionamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Horário de Funcionamento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(dayNames).map(([day, dayName]) => (
              <div key={day} className="flex items-center space-x-4">
                <div className="w-32">
                  <span className="font-medium">{dayName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!openingHours[day]?.closed}
                    onChange={(e) => handleHourChange(day, 'closed', !e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Aberto</span>
                </div>
                {!openingHours[day]?.closed && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">Das:</Label>
                      <Input
                        type="time"
                        value={openingHours[day]?.open || '09:00'}
                        onChange={(e) => handleHourChange(day, 'open', e.target.value)}
                        className="w-24"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">Às:</Label>
                      <Input
                        type="time"
                        value={openingHours[day]?.close || '18:00'}
                        onChange={(e) => handleHourChange(day, 'close', e.target.value)}
                        className="w-24"
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalonConfigurationForm;
