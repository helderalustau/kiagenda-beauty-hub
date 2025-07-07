
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, DollarSign, Clock, Crown, ArrowUp } from "lucide-react";
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
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Coluna Esquerda - Uso do Plano e Indicadores */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Uso do Plano */}
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

          {/* Indicadores - Coluna Única */}
          <div className="space-y-3">
            {/* Hoje */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Hoje</p>
                      <p className="text-2xl font-bold text-gray-900">{todayAppointments}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">confirmados</p>
                </div>
              </CardContent>
            </Card>

            {/* Pendentes */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pendentes</p>
                      <p className="text-2xl font-bold text-yellow-600">{pendingAppointments}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">aguardando</p>
                </div>
              </CardContent>
            </Card>

            {/* Receita Mensal */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(monthlyRevenue)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{monthlyAppointments.length} serviços</p>
                </div>
              </CardContent>
            </Card>

            {/* Serviços */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Serviços</p>
                      <p className="text-2xl font-bold text-gray-900">{services.filter(s => s.active).length}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">ativos</p>
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
              // Aqui você pode implementar a abertura do modal de detalhes
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
