
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, Settings, Bell, TrendingUp, Clock, Scissors, Crown } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AdminDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentPlan, setCurrentPlan] = useState('bronze');
  const [monthlyUsage, setMonthlyUsage] = useState(35);
  const [showNotification, setShowNotification] = useState(false);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);

  // Mock data - em produção viria do backend
  const appointments = [
    {
      id: 1,
      client: 'Maria Santos',
      service: 'Corte + Escova',
      time: '09:00',
      date: '2024-01-20',
      status: 'confirmed',
      price: 'R$ 80,00'
    },
    {
      id: 2,
      client: 'Ana Silva',
      service: 'Coloração',
      time: '14:00',
      date: '2024-01-20',
      status: 'pending',
      price: 'R$ 120,00'
    },
    {
      id: 3,
      client: 'Carla Costa',
      service: 'Manicure',
      time: '16:30',
      date: '2024-01-20',
      status: 'confirmed',
      price: 'R$ 45,00'
    }
  ];

  const planLimits = {
    bronze: { appointments: 50, services: 4, staff: 1 },
    prata: { appointments: 300, services: 10, staff: 2 },
    gold: { appointments: 'ilimitado', services: 'ilimitado', staff: 50 }
  };

  // Simular popup de upgrade para plano Bronze
  useEffect(() => {
    if (currentPlan === 'bronze') {
      const lastPopup = localStorage.getItem('lastUpgradePopup');
      const today = new Date().toDateString();
      
      if (!lastPopup || new Date(lastPopup).toDateString() !== today) {
        const showPopup = Math.random() > 0.7; // 30% chance
        if (showPopup) {
          setTimeout(() => {
            setShowUpgradePopup(true);
            localStorage.setItem('lastUpgradePopup', today);
          }, 3000);
        }
      }
    }
  }, [currentPlan]);

  const handleAcceptAppointment = (appointmentId: number) => {
    // Em produção, atualizaria o status no backend
    console.log(`Agendamento ${appointmentId} aceito`);
    
    // Simular notificação sonora
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Novo agendamento aceito');
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    }
  };

  const getDaysInWeek = (date: Date) => {
    const week = [];
    const startDate = new Date(date);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day;
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate.setDate(diff + i));
      week.push(day);
    }
    return week;
  };

  const weekDays = getDaysInWeek(selectedDate);
  const currentLimit = planLimits[currentPlan as keyof typeof planLimits];
  const usagePercentage = currentPlan === 'bronze' ? (monthlyUsage / 50) * 100 : (monthlyUsage / 300) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-pink-500 p-2 rounded-lg">
                <Scissors className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
                  Painel Administrativo
                </h1>
                <p className="text-sm text-gray-600">Salão Bella Vista</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge 
                variant={currentPlan === 'bronze' ? 'secondary' : 'default'}
                className="flex items-center space-x-1"
              >
                <Crown className="h-3 w-3" />
                <span>Plano {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</span>
              </Badge>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Usage Progress Bar (Bronze/Prata) */}
        {currentPlan !== 'gold' && (
          <Card className="mb-8 border-amber-200 bg-amber-50/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Uso Mensal - Plano {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</h3>
                  <p className="text-sm text-gray-600">
                    {monthlyUsage} de {currentLimit.appointments} atendimentos utilizados
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowUpgradePopup(true)}
                >
                  Fazer Upgrade
                </Button>
              </div>
              <Progress value={usagePercentage} className="h-3" />
              {usagePercentage > 80 && (
                <p className="text-amber-600 text-sm mt-2 font-medium">
                  ⚠️ Você está próximo do limite mensal. Considere fazer upgrade do plano.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Hoje</p>
                  <p className="text-2xl font-bold text-blue-600">{appointments.length}</p>
                  <p className="text-xs text-gray-500">agendamentos</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Este Mês</p>
                  <p className="text-2xl font-bold text-green-600">{monthlyUsage}</p>
                  <p className="text-xs text-gray-500">atendimentos</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Atendentes</p>
                  <p className="text-2xl font-bold text-purple-600">1</p>
                  <p className="text-xs text-gray-500">de {currentLimit.staff}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Serviços</p>
                  <p className="text-2xl font-bold text-pink-600">4</p>
                  <p className="text-xs text-gray-500">de {currentLimit.services}</p>
                </div>
                <Scissors className="h-8 w-8 text-pink-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Calendário Semanal</span>
            </CardTitle>
            <CardDescription>
              Visualize seus agendamentos da semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-6">
              {weekDays.map((day, index) => {
                const hasAppointments = appointments.some(apt => 
                  new Date(apt.date).toDateString() === day.toDateString()
                );
                
                return (
                  <div 
                    key={index}
                    className={`p-4 text-center rounded-lg border-2 cursor-pointer transition-colors ${
                      hasAppointments 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="text-xs text-gray-500">
                      {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </div>
                    <div className="text-lg font-semibold">
                      {day.getDate()}
                    </div>
                    {hasAppointments && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Agendamentos de Hoje</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div 
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{appointment.client}</h4>
                      <p className="text-gray-600">{appointment.service}</p>
                      <p className="text-sm text-gray-500">{appointment.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{appointment.price}</p>
                      <Badge 
                        variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}
                      >
                        {appointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                      </Badge>
                    </div>
                    {appointment.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleAcceptAppointment(appointment.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Aceitar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {appointments.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum agendamento para hoje
                </h3>
                <p className="text-gray-600">
                  Os novos agendamentos aparecerão aqui
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Popup */}
      <Dialog open={showUpgradePopup} onOpenChange={setShowUpgradePopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🚀 Que tal fazer um upgrade?</DialogTitle>
            <DialogDescription>
              Desbloqueie mais recursos e aumente sua capacidade de atendimento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Plano Prata - R$ 50/mês</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Até 300 atendimentos/mês</li>
                <li>• Até 10 serviços diferentes</li>
                <li>• Até 2 atendentes</li>
                <li>• Relatórios detalhados</li>
              </ul>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowUpgradePopup(false)}
                className="flex-1"
              >
                Lembrar depois
              </Button>
              <Button 
                onClick={() => window.location.href = '/plan-selection'}
                className="flex-1 bg-gradient-to-r from-blue-600 to-pink-500"
              >
                Fazer Upgrade
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
