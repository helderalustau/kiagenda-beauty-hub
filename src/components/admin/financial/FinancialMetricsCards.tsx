
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-primary/10 hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-semibold text-foreground">Receita Total</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-lg font-bold text-foreground">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {completedAppointments} atendimentos
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-accent bg-gradient-to-r from-accent/5 to-accent/10 hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-semibold text-foreground">Receita do Mês</CardTitle>
          <Calendar className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-lg font-bold text-foreground">
            {formatCurrency(currentMonthRevenue)}
          </div>
          <div className="flex items-center mt-0.5">
            {growthPercentage >= 0 ? (
              <ArrowUp className="h-2.5 w-2.5 text-green-600 mr-1" />
            ) : (
              <ArrowDown className="h-2.5 w-2.5 text-red-500 mr-1" />
            )}
            <span className={`text-[10px] ${growthPercentage >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {Math.abs(growthPercentage).toFixed(1)}% vs anterior
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-secondary bg-gradient-to-r from-secondary/5 to-secondary/10 hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-semibold text-foreground">Ticket Médio</CardTitle>
          <Target className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-lg font-bold text-foreground">
            {formatCurrency(averageTicket)}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Por atendimento
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-warning bg-gradient-to-r from-warning/5 to-warning/10 hover:shadow-md transition-all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-xs font-semibold text-foreground">Receita Pendente</CardTitle>
          <TrendingUp className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-lg font-bold text-foreground">
            {formatCurrency(pendingRevenue)}
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Agendamentos confirmados
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialMetricsCards;
