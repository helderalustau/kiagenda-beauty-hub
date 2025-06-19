
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BarChart3, Calendar, Users, Settings, LogOut, AlertTriangle } from "lucide-react";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";
import DashboardStats from '@/components/DashboardStats';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import ServicesPage from '@/pages/ServicesPage';
import SettingsPage from '@/pages/SettingsPage';
import SalonStatusToggle from '@/components/SalonStatusToggle';

const AdminDashboard = () => {
  const { 
    salon, 
    appointments, 
    services, 
    adminUsers, 
    refreshData, 
    loading 
  } = useSupabaseData();
  const { toast } = useToast();

  useEffect(() => {
    // Buscar dados ao carregar
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      const admin = JSON.parse(adminData);
      if (admin.salon_id) {
        refreshData(admin.salon_id);
      }
    }
  }, []);

  // Verificar se a configuração foi concluída
  useEffect(() => {
    if (salon && !salon.setup_completed) {
      // Redirecionar para tela de configuração
      window.location.href = '/salon-setup';
    }
  }, [salon]);

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('adminData');
    window.location.href = '/';
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  const handleStatusChange = (isOpen: boolean) => {
    // Atualizar status localmente para feedback imediato
    if (salon) {
      // Função já é chamada no componente SalonStatusToggle
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <span>Estabelecimento não encontrado</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Não foi possível encontrar os dados do seu estabelecimento.
            </p>
            <Button onClick={handleBackToHome} className="w-full">
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleBackToHome}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar ao Login</span>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{salon.name}</h1>
                <p className="text-sm text-gray-600">Dashboard Administrativo</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <SalonStatusToggle 
                salonId={salon.id}
                isOpen={salon.is_open}
                onStatusChange={handleStatusChange}
              />
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Serviços</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Visão Geral
              </h2>
              <p className="text-gray-600">
                Acompanhe as métricas do seu estabelecimento
              </p>
            </div>
            <DashboardStats 
              appointments={appointments}
              services={services}
              salon={salon}
              adminUsers={adminUsers}
            />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Agenda
              </h2>
              <p className="text-gray-600">
                Gerencie os agendamentos do seu estabelecimento
              </p>
            </div>
            <WeeklyCalendar 
              appointments={appointments}
              onRefresh={() => refreshData(salon.id)}
            />
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <ServicesPage 
              services={services}
              onRefresh={() => refreshData(salon.id)}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsPage 
              salon={salon}
              onRefresh={() => refreshData(salon.id)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
