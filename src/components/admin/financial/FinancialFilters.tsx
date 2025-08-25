
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Filter, Download, RefreshCw } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import FinancialSyncButton from './FinancialSyncButton';

interface FinancialFiltersProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  selectedService: string;
  onServiceChange: (service: string) => void;
  services: Array<{ id: string; name: string }>;
  onRefresh: () => void;
  onExport: () => void;
  salonId?: string;
  onSyncComplete?: () => void;
}

const FinancialFilters = ({
  selectedPeriod,
  onPeriodChange,
  selectedService,
  onServiceChange,
  services,
  onRefresh,
  onExport,
  salonId,
  onSyncComplete
}: FinancialFiltersProps) => {
  const getPeriodLabel = (period: string) => {
    const now = new Date();
    switch (period) {
      case 'current-month':
        return `Este mês (${format(now, 'MMMM/yyyy', { locale: ptBR })})`;
      case 'last-month':
        return `Mês passado (${format(subMonths(now, 1), 'MMMM/yyyy', { locale: ptBR })})`;
      case 'last-3-months':
        return 'Últimos 3 meses';
      case 'last-6-months':
        return 'Últimos 6 meses';
      case 'year':
        return `Este ano (${format(now, 'yyyy')})`;
      default:
        return 'Todos os períodos';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Filter className="h-5 w-5 mr-2" />
          Filtros e Controles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Período</label>
            <Select value={selectedPeriod} onValueChange={onPeriodChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                <SelectItem value="current-month">Este mês</SelectItem>
                <SelectItem value="last-month">Mês passado</SelectItem>
                <SelectItem value="last-3-months">Últimos 3 meses</SelectItem>
                <SelectItem value="last-6-months">Últimos 6 meses</SelectItem>
                <SelectItem value="year">Este ano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Serviço</label>
            <Select value={selectedService} onValueChange={onServiceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os serviços" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os serviços</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            {salonId && (
              <FinancialSyncButton 
                salonId={salonId} 
                onSyncComplete={onSyncComplete}
              />
            )}
          </div>

          <div className="flex items-center">
            <Badge variant="secondary" className="text-sm">
              {getPeriodLabel(selectedPeriod)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialFilters;
