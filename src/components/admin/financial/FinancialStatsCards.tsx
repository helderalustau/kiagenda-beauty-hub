import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface FinancialMetrics {
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  pendingRevenue: number;
  totalExpenses: number;
  monthExpenses: number;
  netProfit: number;
  monthNetProfit: number;
  totalTransactions: number;
  completedAppointments: number;
  pendingAppointments: number;
  averageTicket: number;
  dailyAverageRevenue: number;
  monthlyGrowth: number;
}

interface FinancialStatsCardsProps {
  metrics: FinancialMetrics;
  isLoading: boolean;
}

const FinancialStatsCards = ({ metrics, isLoading }: FinancialStatsCardsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Receita Total",
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      subtitle: `${metrics.completedAppointments} atendimentos`,
      trend: null
    },
    {
      title: "Receita de Hoje",
      value: formatCurrency(metrics.todayRevenue),
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      subtitle: "Faturamento diário",
      trend: null
    },
    {
      title: "Receita do Mês",
      value: formatCurrency(metrics.monthRevenue),
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      subtitle: formatPercentage(metrics.monthlyGrowth),
      trend: metrics.monthlyGrowth >= 0 ? 'up' : 'down'
    },
    {
      title: "Receita Pendente",
      value: formatCurrency(metrics.pendingRevenue),
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      subtitle: `${metrics.pendingAppointments} confirmados`,
      trend: null
    },
    {
      title: "Despesas Totais",
      value: formatCurrency(metrics.totalExpenses),
      icon: CreditCard,
      color: "text-red-600",
      bgColor: "bg-red-100",
      subtitle: "Gastos operacionais",
      trend: null
    },
    {
      title: "Lucro Líquido",
      value: formatCurrency(metrics.netProfit),
      icon: Target,
      color: metrics.netProfit >= 0 ? "text-green-600" : "text-red-600",
      bgColor: metrics.netProfit >= 0 ? "bg-green-100" : "bg-red-100",
      subtitle: `Margem: ${metrics.totalRevenue > 0 ? ((metrics.netProfit / metrics.totalRevenue) * 100).toFixed(1) : 0}%`,
      trend: null
    },
    {
      title: "Ticket Médio",
      value: formatCurrency(metrics.averageTicket),
      icon: CheckCircle,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      subtitle: "Por atendimento",
      trend: null
    },
    {
      title: "Média Diária",
      value: formatCurrency(metrics.dailyAverageRevenue),
      icon: TrendingUp,
      color: "text-teal-600",
      bgColor: "bg-teal-100",
      subtitle: "Receita média/dia",
      trend: null
    }
  ];

  return (
    <div className="space-y-6">
      {/* Resumo Executivo */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <DollarSign className="h-6 w-6 mr-2" />
            Resumo Financeiro Executivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(metrics.totalRevenue)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Receita Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {formatCurrency(metrics.totalExpenses)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Despesas Totais</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${metrics.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(metrics.netProfit)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Lucro Líquido</div>
            </div>
          </div>
          
          {/* Indicadores de Performance */}
          <div className="flex justify-center mt-6 space-x-4">
            <Badge 
              variant={metrics.monthlyGrowth >= 0 ? "default" : "destructive"}
              className="text-sm py-1 px-3"
            >
              {metrics.monthlyGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {formatPercentage(metrics.monthlyGrowth)} este mês
            </Badge>
            
            <Badge variant="outline" className="text-sm py-1 px-3">
              {metrics.totalTransactions} transações
            </Badge>
            
            <Badge variant="outline" className="text-sm py-1 px-3">
              {metrics.completedAppointments} atendimentos
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                    </div>
                    
                    <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                      {stat.value}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      {stat.trend && (
                        <>
                          {stat.trend === 'up' ? (
                            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                          )}
                        </>
                      )}
                      {stat.subtitle}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alertas e Insights */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6">
          <h4 className="font-semibold text-orange-900 mb-3">💡 Insights Financeiros</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {metrics.pendingRevenue > 0 && (
              <div className="flex items-center text-orange-700">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Você tem {formatCurrency(metrics.pendingRevenue)} em receita pendente
              </div>
            )}
            
            {metrics.monthlyGrowth > 20 && (
              <div className="flex items-center text-green-700">
                <TrendingUp className="h-4 w-4 mr-2" />
                Excelente crescimento de {formatPercentage(metrics.monthlyGrowth)} este mês!
              </div>
            )}
            
            {metrics.monthlyGrowth < -10 && (
              <div className="flex items-center text-red-700">
                <TrendingDown className="h-4 w-4 mr-2" />
                Atenção: queda de {formatPercentage(Math.abs(metrics.monthlyGrowth))} na receita
              </div>
            )}
            
            {metrics.averageTicket > 100 && (
              <div className="flex items-center text-blue-700">
                <Target className="h-4 w-4 mr-2" />
                Ótimo ticket médio de {formatCurrency(metrics.averageTicket)}
              </div>
            )}
            
            {metrics.netProfit < 0 && (
              <div className="flex items-center text-red-700">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Operação no prejuízo - revisar custos operacionais
              </div>
            )}

            {metrics.totalRevenue > 0 && ((metrics.netProfit / metrics.totalRevenue) * 100) > 30 && (
              <div className="flex items-center text-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Excelente margem de lucro ({((metrics.netProfit / metrics.totalRevenue) * 100).toFixed(1)}%)
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialStatsCards;