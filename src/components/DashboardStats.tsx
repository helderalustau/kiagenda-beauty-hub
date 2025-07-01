
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, DollarSign, Clock, Crown, ArrowUp } from "lucide-react";
import { Appointment, Service, Salon, AdminUser } from '@/hooks/useSupabaseData';
import AdminPlanUpgradeModal from './admin/AdminPlanUpgradeModal';

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
  const currentAttendants = adminUsers.filter(user => user.active).length;
  const usagePercentage = Math.round((currentAttendants / maxAttendants) * 100);

  const getPlanInfo = (plan: string) => {
    switch (plan) {
      case 'bronze': return { name: 'Bronze', color: 'bg-amber-100 text-amber-800' };
      case 'prata': return { name: 'Prata', color: 'bg-gray-100 text-gray-800' };
      case 'gold': return { name: 'Gold', color: 'bg-yellow-100 text-yellow-800' };
      default: return { name: 'Bronze', color: 'bg-amber-100 text-amber-800' };
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

  return (
    <>
      <div className="grid gap-4 md:gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments}</div>
              <p className="text-xs text-muted-foreground">
                agendamentos confirmados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingAppointments}</div>
              <p className="text-xs text-muted-foreground">
                aguardando confirmação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(monthlyRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {monthlyAppointments.length} agendamentos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Serviços</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services.filter(s => s.active).length}</div>
              <p className="text-xs text-muted-foreground">
                serviços ativos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Plan Usage Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5" />
                <CardTitle className="text-lg">Uso do Plano</CardTitle>
                <Badge className={planInfo.color}>
                  {planInfo.name}
                </Badge>
              </div>
              {canUpgrade && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUpgradeModalOpen(true)}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <ArrowUp className="h-4 w-4 mr-1" />
                  Upgrade
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Atendentes</span>
                <span>{currentAttendants} de {maxAttendants}</span>
              </div>
              <Progress 
                value={usagePercentage} 
                className={`h-2 ${usagePercentage >= 90 ? 'bg-red-100' : usagePercentage >= 70 ? 'bg-yellow-100' : 'bg-green-100'}`}
              />
              <p className="text-xs text-muted-foreground mt-1">
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
