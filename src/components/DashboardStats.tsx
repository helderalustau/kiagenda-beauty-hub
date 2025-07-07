
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, DollarSign, Clock, Crown, ArrowUp, TrendingUp } from "lucide-react";
import { Appointment, Service, Salon, AdminUser } from '@/hooks/useSupabaseData';
import AdminPlanUpgradeModal from './admin/AdminPlanUpgradeModal';
import CompactAppointmentsTable from './admin/CompactAppointmentsTable';

interface DashboardStatsProps {
  appointments: Appointment[];
  services: Service[];
  salon: Salon;
  adminUsers: AdminUser[];
}

const DashboardStats = ({ appointments, services, salon, adminUsers }: DashboardStatsProps) => {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  
  // Calcular estatísticas
  const today = new Date();
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();

  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    return aptDate.toDateString() === today.toDateString() && 
           ['confirmed', 'pending'].includes(apt.status);
  }).length;

  const monthlyAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    return aptDate.getMonth() === thisMonth && 
           aptDate.getFullYear() === thisYear &&
           apt.status === 'completed';
  });

  const monthlyRevenue = monthlyAppointments.reduce((total, apt) => {
    const service = services.find(s => s.id === apt.service_id);
    return total + (service ? Number(service.price) : 0);
  }, 0);

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length;

  // Calculate plan usage
  const maxAttendants = salon.max_attendants || 1;
  const currentAttendants = adminUsers.length;
  const usagePercentage = Math.round((currentAttendants / maxAttendants) * 100);

  const getPlanInfo = (plan: string) => {
    switch (plan) {
      case 'bronze': return { name: 'Bronze', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'prata': return { name: 'Prata', color: 'bg-slate-50 text-slate-700 border-slate-200' };
      case 'gold': return { name: 'Gold', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
      default: return { name: 'Bronze', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
  };

  const planInfo = getPlanInfo(salon.plan);
  const canUpgrade = salon.plan !== 'gold';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Filtrar agendamentos recentes (últimos 7 dias)
  const recentAppointments = appointments
    .filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return aptDate >= weekAgo && ['confirmed', 'pending', 'completed'].includes(apt.status);
    })
    .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())
    .slice(0, 10);

  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        {/* Coluna Esquerda - Plano e Indicadores */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Uso do Plano */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Crown className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900">Plano Atual</CardTitle>
                    <Badge className={`${planInfo.color} text-xs px-2 py-1 border`}>
                      {planInfo.name}
                    </Badge>
                  </div>
                </div>
                {canUpgrade && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUpgradeModalOpen(true)}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs px-3"
                  >
                    <ArrowUp className="h-3 w-3 mr-1" />
                    Upgrade
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2 text-slate-700">
                  <span>Atendentes</span>
                  <span className="font-medium">{currentAttendants} de {maxAttendants}</span>
                </div>
                <Progress 
                  value={usagePercentage} 
                  className={`h-2 ${usagePercentage >= 90 ? 'bg-red-50' : usagePercentage >= 70 ? 'bg-yellow-50' : 'bg-green-50'}`}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {usagePercentage >= 90 ? 'Limite quase atingido!' : 
                   usagePercentage >= 70 ? 'Considere fazer upgrade' : 
                   'Uso dentro do limite'}
                </p>
              </div>

              {usagePercentage >= 90 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    ⚠️ Você está próximo do limite do seu plano.
                    {canUpgrade && ' Considere fazer upgrade para continuar adicionando atendentes.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Indicadores em Coluna Única */}
          <div className="space-y-4">
            {/* Hoje */}
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Agendamentos Hoje</p>
                      <p className="text-3xl font-bold text-slate-900">{todayAppointments}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">confirmados</p>
                    <TrendingUp className="h-4 w-4 text-green-500 ml-auto mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pendentes */}
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-yellow-100 rounded-xl">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Pendentes</p>
                      <p className="text-3xl font-bold text-yellow-600">{pendingAppointments}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">aguardando</p>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full ml-auto mt-1"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Receita Mensal */}
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Receita Mensal</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(monthlyRevenue)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">{monthlyAppointments.length} serviços</p>
                    <TrendingUp className="h-4 w-4 text-green-500 ml-auto mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Serviços */}
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Serviços Ativos</p>
                      <p className="text-3xl font-bold text-slate-900">{services.filter(s => s.active).length}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">disponíveis</p>
                    <div className="w-2 h-2 bg-purple-500 rounded-full ml-auto mt-1"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Coluna Direita - Tabela de Agendamentos */}
        <div className="col-span-12 lg:col-span-8">
          <CompactAppointmentsTable
            appointments={recentAppointments}
            onAppointmentClick={(appointment) => {
              console.log('Appointment clicked:', appointment);
            }}
          />
        </div>
      </div>

      <AdminPlanUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        currentPlan={salon.plan as 'bronze' | 'prata' | 'gold'}
        salonName={salon.name}
        onUpgrade={(newPlan) => {
          console.log(`Upgrade requested from ${salon.plan} to ${newPlan}`);
        }}
      />
    </>
  );
};

export default DashboardStats;
