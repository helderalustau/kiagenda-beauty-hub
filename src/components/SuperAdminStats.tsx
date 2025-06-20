
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, ChartBar, Calendar, Scissors } from "lucide-react";
import { DashboardStats } from '@/hooks/useSupabaseData';

interface SuperAdminStatsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

const SuperAdminStats = ({ stats, loading }: SuperAdminStatsProps) => {
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

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'bronze': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'prata': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Provide default values for optional properties
  const totalSalons = stats.totalSalons || 0;
  const totalServices = stats.totalServices || 0;
  const salonsByPlan = stats.salonsByPlan || { bronze: 0, prata: 0, gold: 0 };
  const expectedRevenue = stats.expectedRevenue || { total: 0, bronze: 0, prata: 0, gold: 0 };

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
              <div className="flex justify-between items-center">
                <Badge className={getPlanColor('bronze')}>Bronze</Badge>
                <span className="text-sm font-semibold">{salonsByPlan.bronze}</span>
              </div>
              <div className="flex justify-between items-center">
                <Badge className={getPlanColor('prata')}>Prata</Badge>
                <span className="text-sm font-semibold">{salonsByPlan.prata}</span>
              </div>
              <div className="flex justify-between items-center">
                <Badge className={getPlanColor('gold')}>Gold</Badge>
                <span className="text-sm font-semibold">{salonsByPlan.gold}</span>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Detalhamento da Receita por Plano */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-800 flex items-center space-x-2">
              <Badge className={getPlanColor('bronze')}>Bronze</Badge>
              <span>R$ 29,90/mês</span>
            </CardTitle>
            <CardDescription className="text-amber-700">
              {salonsByPlan.bronze} estabelecimentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800">
              {formatCurrency(expectedRevenue.bronze)}
            </div>
            <p className="text-sm text-amber-600 mt-1">
              Receita mensal do plano Bronze
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-800 flex items-center space-x-2">
              <Badge className={getPlanColor('prata')}>Prata</Badge>
              <span>R$ 59,90/mês</span>
            </CardTitle>
            <CardDescription className="text-gray-700">
              {salonsByPlan.prata} estabelecimentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {formatCurrency(expectedRevenue.prata)}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Receita mensal do plano Prata
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center space-x-2">
              <Badge className={getPlanColor('gold')}>Gold</Badge>
              <span>R$ 99,90/mês</span>
            </CardTitle>
            <CardDescription className="text-yellow-700">
              {salonsByPlan.gold} estabelecimentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">
              {formatCurrency(expectedRevenue.gold)}
            </div>
            <p className="text-sm text-yellow-600 mt-1">
              Receita mensal do plano Gold
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminStats;
