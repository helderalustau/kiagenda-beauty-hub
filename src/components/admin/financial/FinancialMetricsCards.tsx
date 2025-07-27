
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Target, Calendar, ArrowUp, ArrowDown } from "lucide-react";

interface FinancialMetricsCardsProps {
  totalRevenue: number;
  currentMonthRevenue: number;
  growthPercentage: number;
  averageTicket: number;
  completedAppointments: number;
  pendingRevenue: number;
}

const FinancialMetricsCards = ({
  totalRevenue,
  currentMonthRevenue,
  growthPercentage,
  averageTicket,
  completedAppointments,
  pendingRevenue
}: FinancialMetricsCardsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-green-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Receita Total</CardTitle>
          <DollarSign className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-xs text-green-600 mt-1">
            {completedAppointments} atendimentos concluídos
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-blue-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">Receita do Mês</CardTitle>
          <Calendar className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700">
            {formatCurrency(currentMonthRevenue)}
          </div>
          <div className="flex items-center mt-1">
            {growthPercentage >= 0 ? (
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={`text-xs ${growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(growthPercentage).toFixed(1)}% vs mês anterior
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-purple-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">Ticket Médio</CardTitle>
          <Target className="h-5 w-5 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-700">
            {formatCurrency(averageTicket)}
          </div>
          <p className="text-xs text-purple-600 mt-1">
            Por atendimento realizado
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-orange-100">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-800">Receita Pendente</CardTitle>
          <TrendingUp className="h-5 w-5 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-700">
            {formatCurrency(pendingRevenue)}
          </div>
          <p className="text-xs text-orange-600 mt-1">
            Agendamentos confirmados
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialMetricsCards;
