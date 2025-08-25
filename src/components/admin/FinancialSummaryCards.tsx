import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Calendar, BarChart3 } from "lucide-react";
import { useFinancialData } from '@/hooks/useFinancialData';

interface FinancialSummaryCardsProps {
  salonId: string;
}

const FinancialSummaryCards = ({ salonId }: FinancialSummaryCardsProps) => {
  const { metrics, loading } = useFinancialData(salonId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Receita de Hoje */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-green-800 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Receita de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-green-900">
            {formatCurrency(metrics.todayRevenue)}
          </div>
          <p className="text-xs text-green-700 mt-1">
            {metrics.totalTransactions} transações hoje
          </p>
        </CardContent>
      </Card>

      {/* Receita do Mês */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-800 flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Receita do Mês
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-blue-900">
            {formatCurrency(metrics.monthRevenue)}
          </div>
          <p className="text-xs text-blue-700 mt-1">
            {metrics.totalTransactions} transações este mês
          </p>
        </CardContent>
      </Card>

      {/* Receita Total */}
      <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-purple-800 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Receita Total
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-purple-900">
            {formatCurrency(metrics.totalRevenue)}
          </div>
          <p className="text-xs text-purple-700 mt-1">
            {metrics.totalTransactions} transações total
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSummaryCards;