
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, Bell, Palette, Shield, Info } from "lucide-react";
import SalonConfigurationForm from '@/components/settings/SalonConfigurationForm';
import SalonUsersManager from '@/components/settings/SalonUsersManager';
import { Salon } from '@/hooks/useSupabaseData';

interface SettingsPageProps {
  salon: Salon;
  onRefresh: () => Promise<void>;
}

const SettingsPage = ({ salon, onRefresh }: SettingsPageProps) => {
  const [activeTab, setActiveTab] = useState('general');

  // Handle salon changes and refresh
  const handleSalonChange = async (updatedSalon: Salon) => {
    // Here you would typically update the salon data
    // For now, we'll just trigger a refresh
    await onRefresh();
  };

  // Handle plan upgrade
  const handleUpgrade = () => {
    console.log('Upgrade plan requested');
    // Add upgrade logic here
  };

  // Get max users based on plan
  const getMaxUsers = () => {
    const planLimits = {
      bronze: 3,
      silver: 10,
      gold: 25
    };
    return planLimits[salon.plan as keyof typeof planLimits] || 3;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-full p-3">
            <Settings className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Configurações</h1>
            <p className="text-blue-100 text-lg">Gerencie as configurações do seu estabelecimento</p>
          </div>
        </div>
      </div>

      {/* Tabs de Configuração */}
      <Card className="shadow-xl border-0">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl h-auto">
              <TabsTrigger 
                value="general" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 py-3"
              >
                <div className="flex flex-col items-center space-y-1">
                  <Settings className="h-5 w-5" />
                  <span className="text-sm font-medium">Geral</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="users"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 py-3"
              >
                <div className="flex flex-col items-center space-y-1">
                  <Users className="h-5 w-5" />
                  <span className="text-sm font-medium">Usuários</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="notifications"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 py-3"
              >
                <div className="flex flex-col items-center space-y-1">
                  <Bell className="h-5 w-5" />
                  <span className="text-sm font-medium">Notificações</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="appearance"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 py-3"
              >
                <div className="flex flex-col items-center space-y-1">
                  <Palette className="h-5 w-5" />
                  <span className="text-sm font-medium">Aparência</span>
                </div>
              </TabsTrigger>
            </TabsList>

            {/* Tab: Configurações Gerais */}
            <TabsContent value="general" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-6 w-6 text-blue-600" />
                    <span>Informações do Estabelecimento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <SalonConfigurationForm salon={salon} onSalonChange={handleSalonChange} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Usuários */}
            <TabsContent value="users" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-6 w-6 text-green-600" />
                    <span>Gerenciar Usuários</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <SalonUsersManager 
                    salonId={salon.id} 
                    maxUsers={getMaxUsers()} 
                    onUpgrade={handleUpgrade} 
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Notificações */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-6 w-6 text-orange-600" />
                    <span>Configurações de Notificação</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Info className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-800">Notificações em Tempo Real</h3>
                      </div>
                      <p className="text-blue-700 text-sm">
                        As notificações são enviadas automaticamente quando um novo agendamento é solicitado.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Som Atual</h4>
                        <div className="flex items-center space-x-2">
                          <div className="bg-blue-100 rounded-full p-2">
                            <Bell className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="text-gray-700 capitalize">{salon.notification_sound || 'Padrão'}</span>
                        </div>
                      </div>
                      
                      <div className="bg-white border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                        <div className="flex items-center space-x-2">
                          <div className="bg-green-100 rounded-full p-2">
                            <Shield className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="text-green-700">Ativo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Aparência */}
            <TabsContent value="appearance" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="h-6 w-6 text-purple-600" />
                    <span>Personalização Visual</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Info className="h-5 w-5 text-purple-600" />
                        <h3 className="font-semibold text-purple-800">Tema Personalizado</h3>
                      </div>
                      <p className="text-purple-700 text-sm">
                        Personalize a aparência do seu painel administrativo.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                        <h4 className="font-medium mb-2">Tema Azul</h4>
                        <p className="text-blue-100 text-sm">Tema padrão profissional</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                        <h4 className="font-medium mb-2">Tema Roxo</h4>
                        <p className="text-purple-100 text-sm">Tema elegante</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
                        <h4 className="font-medium mb-2">Tema Verde</h4>
                        <p className="text-green-100 text-sm">Tema natural</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
