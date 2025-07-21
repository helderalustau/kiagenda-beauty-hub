
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, ChartBar, Calendar, Scissors } from "lucide-react";
import { DashboardStats } from '@/hooks/useSupabaseData';
import { usePlanConfigurations } from '@/hooks/usePlanConfigurations';

interface SuperAdminStatsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

const SuperAdminStats = ({ stats, loading }: SuperAdminStatsProps) => {
  const { getAllPlansInfo } = usePlanConfigurations();
  const plansInfo = getAllPlansInfo();

  if (loading || !stats) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm border-0">
            <CardHeader className="pb-3">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Provide default values for optional properties
  const totalSalons = stats.totalSalons || 0;
  const totalServices = stats.totalServices || 0;
  const salonsByPlan = stats.salonsByPlan || { bronze: 0, prata: 0, gold: 0 };

  // Calculate expected revenue using dynamic plan prices
  const calculateExpectedRevenue = () => {
    let total = 0;
    const revenueByPlan: Record<string, number> = {};

    plansInfo.forEach(plan => {
      const salonCount = salonsByPlan[plan.plan_type as keyof typeof salonsByPlan] || 0;
      const planRevenue = salonCount * plan.priceNumber;
      revenueByPlan[plan.plan_type] = planRevenue;
      total += planRevenue;
    });

    return { total, ...revenueByPlan };
  };

  const expectedRevenue = calculateExpectedRevenue();

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {/* Total de Estabelecimentos */}
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm text-gray-600">
                Total de Estabelecimentos
              </CardDescription>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {totalSalons}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Receita Total */}
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm text-gray-600">
                Receita Mensal Prevista
              </CardDescription>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">
              {formatCurrency(expectedRevenue.total)}
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 mt-1">
              Baseado nos preços configurados
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Total de Agendamentos */}
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm text-gray-600">
                Total de Agendamentos
              </CardDescription>
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {stats.totalAppointments}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Total de Serviços */}
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm text-gray-600">
                Total de Serviços
              </CardDescription>
              <Scissors className="h-5 w-5 text-pink-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {totalServices}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Planos Ativos */}
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm text-gray-600">
                Planos Ativos
              </CardDescription>
              <ChartBar className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="space-y-2">
              {plansInfo.map((plan) => (
                <div key={plan.plan_type} className="flex justify-between items-center">
                  <Badge className={plan.color}>{plan.name}</Badge>
                  <span className="text-sm font-semibold">
                    {salonsByPlan[plan.plan_type as keyof typeof salonsByPlan] || 0}
                  </span>
                </div>
              ))}
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Detalhamento da Receita por Plano */}
      <div className="grid md:grid-cols-3 gap-6">
        {plansInfo.map((plan) => {
          const salonCount = salonsByPlan[plan.plan_type as keyof typeof salonsByPlan] || 0;
          const planRevenue = expectedRevenue[plan.plan_type] || 0;
          
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
                    <Badge className={plan.color}>{plan.name}</Badge>
                    <span className="text-sm">{plan.price}</span>
                  </div>
                </CardTitle>
                <CardDescription className={
                  plan.plan_type === 'bronze' ? 'text-amber-700' :
                  plan.plan_type === 'prata' ? 'text-gray-700' :
                  'text-yellow-700'
                }>
                  {salonCount} estabelecimentos
                </CardDescription>
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
                <p className={`text-xs mt-1 ${
                  plan.plan_type === 'bronze' ? 'text-amber-500' :
                  plan.plan_type === 'prata' ? 'text-gray-500' :
                  'text-yellow-500'
                }`}>
                  {plan.price} × {salonCount} salões
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SuperAdminStats;
