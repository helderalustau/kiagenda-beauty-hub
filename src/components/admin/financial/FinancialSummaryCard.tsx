import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Target, AlertCircle } from "lucide-react";

interface FinancialSummaryData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  pendingRevenue: number;
  monthlyGrowth: number;
  transactionsCount: number;
  averageTicket: number;
}

interface FinancialSummaryCardProps {
  data: FinancialSummaryData;
}

const FinancialSummaryCard = ({ data }: FinancialSummaryCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const profitMargin = data.totalRevenue > 0 ? ((data.netProfit / data.totalRevenue) * 100) : 0;

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center text-primary">
          <DollarSign className="h-6 w-6 mr-2" />
          📊 Resumo Executivo Financeiro
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Receita Total */}
          <div className="bg-white rounded-xl p-6 border border-green-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.totalRevenue)}
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-gray-500">
                {data.transactionsCount} transações
              </span>
            </div>
          </div>

          {/* Despesas */}
          <div className="bg-white rounded-xl p-6 border border-red-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Despesas</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(data.totalExpenses)}
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-gray-500">
                {((data.totalExpenses / (data.totalRevenue || 1)) * 100).toFixed(1)}% da receita
              </span>
            </div>
          </div>

          {/* Lucro Líquido */}
          <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Lucro Líquido</p>
                <p className={`text-2xl font-bold ${data.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(data.netProfit)}
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className={`${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Margem: {profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Receita Pendente */}
          <div className="bg-white rounded-xl p-6 border border-orange-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Receita Pendente</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(data.pendingRevenue)}
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-gray-500">
                A receber
              </span>
            </div>
          </div>
        </div>

        {/* Métricas Avançadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Crescimento Mensal */}
          <div className="bg-white rounded-xl p-6 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Crescimento Mensal</p>
                <p className={`text-xl font-bold flex items-center ${
                  data.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {data.monthlyGrowth >= 0 ? (
                    <TrendingUp className="h-5 w-5 mr-1" />
                  ) : (
                    <TrendingDown className="h-5 w-5 mr-1" />
                  )}
                  {formatPercentage(data.monthlyGrowth)}
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Médio */}
          <div className="bg-white rounded-xl p-6 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Ticket Médio</p>
                <p className="text-xl font-bold text-purple-600">
                  {formatCurrency(data.averageTicket)}
                </p>
              </div>
            </div>
          </div>

          {/* Taxa de Conversão */}
          <div className="bg-white rounded-xl p-6 border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Receita vs Pendente</p>
                <p className="text-xl font-bold text-indigo-600">
                  {data.totalRevenue > 0 ? 
                    `${((data.totalRevenue / (data.totalRevenue + data.pendingRevenue)) * 100).toFixed(1)}%` 
                    : '0%'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Financeiros */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Insights Financeiros</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {profitMargin > 20 && (
              <div className="text-green-700">
                ✅ Excelente margem de lucro ({profitMargin.toFixed(1)}%)
              </div>
            )}
            {profitMargin < 10 && profitMargin > 0 && (
              <div className="text-orange-700">
                ⚠️ Margem de lucro baixa ({profitMargin.toFixed(1)}%)
              </div>
            )}
            {data.netProfit < 0 && (
              <div className="text-red-700">
                🔴 Operação no prejuízo - revisar despesas
              </div>
            )}
            {data.pendingRevenue > data.totalRevenue * 0.1 && (
              <div className="text-orange-700">
                💰 Alta receita pendente - focar na conversão
              </div>
            )}
            {data.averageTicket > 100 && (
              <div className="text-green-700">
                🎯 Ótimo ticket médio ({formatCurrency(data.averageTicket)})
              </div>
            )}
            {data.monthlyGrowth > 10 && (
              <div className="text-green-700">
                📈 Crescimento acelerado ({formatPercentage(data.monthlyGrowth)})
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSummaryCard;