
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Users, Crown, Calendar } from "lucide-react";
import { Salon, DashboardStats } from '@/hooks/useSupabaseData';
import { usePlanConfigurations } from '@/hooks/usePlanConfigurations';

interface FinancialDashboardProps {
  salons: Salon[];
  dashboardStats: DashboardStats;
}

const FinancialDashboard = ({ salons, dashboardStats }: FinancialDashboardProps) => {
  const { getAllPlansInfo } = usePlanConfigurations();
  const plansInfo = getAllPlansInfo();

  const financialMetrics = useMemo(() => {
    // Obter preços dinâmicos dos planos configurados
    const getPlanPrice = (planType: string): number => {
      const plan = plansInfo.find(p => p.plan_type === planType);
      return plan ? plan.priceNumber : 0;
    };

    const monthlyRevenue = {
      bronze: (dashboardStats.salonsByPlan?.bronze || 0) * getPlanPrice('bronze'),
      prata: (dashboardStats.salonsByPlan?.prata || 0) * getPlanPrice('prata'),
      gold: (dashboardStats.salonsByPlan?.gold || 0) * getPlanPrice('gold')
    };

    const totalMonthlyRevenue = monthlyRevenue.bronze + monthlyRevenue.prata + monthlyRevenue.gold;
    const projectedAnnualRevenue = totalMonthlyRevenue * 12;

    // Simular dados de crescimento dos últimos 6 meses baseado nos valores atuais
    const growthData = [
      { month: 'Jan', revenue: totalMonthlyRevenue * 0.6, salons: Math.round(salons.length * 0.6) },
      { month: 'Fev', revenue: totalMonthlyRevenue * 0.7, salons: Math.round(salons.length * 0.7) },
      { month: 'Mar', revenue: totalMonthlyRevenue * 0.8, salons: Math.round(salons.length * 0.8) },
      { month: 'Abr', revenue: totalMonthlyRevenue * 0.85, salons: Math.round(salons.length * 0.85) },
      { month: 'Mai', revenue: totalMonthlyRevenue * 0.92, salons: Math.round(salons.length * 0.92) },
      { month: 'Jun', revenue: totalMonthlyRevenue, salons: salons.length }
    ];

    const planDistribution = plansInfo.map(plan => ({
      name: plan.name,
      value: dashboardStats.salonsByPlan?.[plan.plan_type as keyof typeof dashboardStats.salonsByPlan] || 0,
      color: plan.plan_type === 'bronze' ? '#CD7F32' : 
             plan.plan_type === 'prata' ? '#C0C0C0' : '#FFD700',
      revenue: (dashboardStats.salonsByPlan?.[plan.plan_type as keyof typeof dashboardStats.salonsByPlan] || 0) * plan.priceNumber
    }));

    return {
      monthlyRevenue: totalMonthlyRevenue,
      projectedAnnualRevenue,
      growthData,
      planDistribution,
      avgRevenuePerSalon: salons.length > 0 ? totalMonthlyRevenue / salons.length : 0,
      monthlyRevenueByPlan: monthlyRevenue
    };
  }, [salons, dashboardStats, plansInfo]);

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
              Baseado nos planos configurados
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

      {/* Cards de Receita por Plano */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plansInfo.map((plan) => {
          const salonCount = dashboardStats.salonsByPlan?.[plan.plan_type as keyof typeof dashboardStats.salonsByPlan] || 0;
          const planRevenue = salonCount * plan.priceNumber;
          
          return (
            <Card key={plan.plan_type} className={`bg-gradient-to-br ${
              plan.plan_type === 'bronze' ? 'from-amber-50 to-amber-100 border-amber-200' :
              plan.plan_type === 'prata' ? 'from-gray-50 to-gray-100 border-gray-200' :
              'from-yellow-50 to-yellow-100 border-yellow-200'
            }`}>
              <CardHeader>
                <CardTitle className={`${
                  plan.plan_type === 'bronze' ? 'text-amber-800' :
                  plan.plan_type === 'prata' ? 'text-gray-800' :
                  'text-yellow-800'
                } flex items-center justify-between`}>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${plan.color}`}>
                      {plan.name}
                    </span>
                    <span className="text-sm">{plan.price}</span>
                  </div>
                  <span className="text-sm font-normal">
                    {salonCount} salões
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  plan.plan_type === 'bronze' ? 'text-amber-800' :
                  plan.plan_type === 'prata' ? 'text-gray-800' :
                  'text-yellow-800'
                }`}>
                  {formatCurrency(planRevenue)}
                </div>
                <p className={`text-sm mt-1 ${
                  plan.plan_type === 'bronze' ? 'text-amber-600' :
                  plan.plan_type === 'prata' ? 'text-gray-600' :
                  'text-yellow-600'
                }`}>
                  Receita mensal do plano {plan.name}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Crescimento de Receita */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Receita</CardTitle>
            <p className="text-sm text-muted-foreground">
              Baseado nos preços configurados dos planos
            </p>
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
            <p className="text-sm text-muted-foreground">
              Quantidade de salões por plano
            </p>
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
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} salões`,
                    name,
                    `Receita: ${formatCurrency(props.payload.revenue)}`
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Crescimento de Estabelecimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Crescimento de Estabelecimentos</CardTitle>
          <p className="text-sm text-muted-foreground">
            Evolução da base de estabelecimentos nos últimos 6 meses
          </p>
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
