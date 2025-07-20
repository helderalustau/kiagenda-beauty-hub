
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Users, Crown, Calendar } from "lucide-react";
import { Salon, DashboardStats } from '@/hooks/useSupabaseData';

interface FinancialDashboardProps {
  salons: Salon[];
  dashboardStats: DashboardStats;
}

const FinancialDashboard = ({ salons, dashboardStats }: FinancialDashboardProps) => {
  const financialMetrics = useMemo(() => {
    const monthlyRevenue = {
      bronze: (dashboardStats.salonsByPlan?.bronze || 0) * 29.90,
      prata: (dashboardStats.salonsByPlan?.prata || 0) * 59.90,
      gold: (dashboardStats.salonsByPlan?.gold || 0) * 99.90
    };

    const totalMonthlyRevenue = monthlyRevenue.bronze + monthlyRevenue.prata + monthlyRevenue.gold;
    const projectedAnnualRevenue = totalMonthlyRevenue * 12;

    // Simular dados de crescimento dos últimos 6 meses
    const growthData = [
      { month: 'Jan', revenue: totalMonthlyRevenue * 0.6, salons: salons.length * 0.6 },
      { month: 'Fev', revenue: totalMonthlyRevenue * 0.7, salons: salons.length * 0.7 },
      { month: 'Mar', revenue: totalMonthlyRevenue * 0.8, salons: salons.length * 0.8 },
      { month: 'Abr', revenue: totalMonthlyRevenue * 0.85, salons: salons.length * 0.85 },
      { month: 'Mai', revenue: totalMonthlyRevenue * 0.92, salons: salons.length * 0.92 },
      { month: 'Jun', revenue: totalMonthlyRevenue, salons: salons.length }
    ];

    const planDistribution = [
      { name: 'Bronze', value: dashboardStats.salonsByPlan?.bronze || 0, color: '#CD7F32' },
      { name: 'Prata', value: dashboardStats.salonsByPlan?.prata || 0, color: '#C0C0C0' },
      { name: 'Gold', value: dashboardStats.salonsByPlan?.gold || 0, color: '#FFD700' }
    ];

    return {
      monthlyRevenue: totalMonthlyRevenue,
      projectedAnnualRevenue,
      growthData,
      planDistribution,
      avgRevenuePerSalon: salons.length > 0 ? totalMonthlyRevenue / salons.length : 0
    };
  }, [salons, dashboardStats]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(financialMetrics.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado nos planos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projeção Anual</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(financialMetrics.projectedAnnualRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Se mantiver o ritmo atual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita por Salão</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(financialMetrics.avgRevenuePerSalon)}
            </div>
            <p className="text-xs text-muted-foreground">
              Média mensal por estabelecimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              +15.2%
            </div>
            <p className="text-xs text-muted-foreground">
              Crescimento mensal médio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Crescimento de Receita */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={financialMetrics.growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Receita']} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Planos */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Planos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={financialMetrics.planDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                >
                  {financialMetrics.planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Crescimento de Estabelecimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Crescimento de Estabelecimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={financialMetrics.growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value, name) => [Math.round(Number(value)), 'Estabelecimentos']} />
              <Bar dataKey="salons" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialDashboard;
