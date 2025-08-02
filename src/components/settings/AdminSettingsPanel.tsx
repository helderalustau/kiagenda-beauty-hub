
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Clock, Users, Bell, Palette, Shield, Upload, Settings } from "lucide-react";
import { Salon } from '@/types/supabase-entities';
import SalonInfoCard from './SalonInfoCard';
import OpeningHoursCard from './OpeningHoursCard';
import SalonUsersCard from './SalonUsersCard';
import BannerUploadCard from './BannerUploadCard';
import NotificationSettingsCard from './NotificationSettingsCard';
import ThemeSettingsCard from './ThemeSettingsCard';
import AdvancedSettingsCard from './AdvancedSettingsCard';

interface AdminSettingsPanelProps {
  salon: Salon;
  onRefresh: () => Promise<void>;
}

type SettingsSection = 
  | 'establishment' 
  | 'hours' 
  | 'users' 
  | 'banner'
  | 'notifications' 
  | 'theme' 
  | 'advanced';

const AdminSettingsPanel = ({ salon, onRefresh }: AdminSettingsPanelProps) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('establishment');

  const settingsMenuItems = [
    {
      id: 'establishment' as SettingsSection,
      title: 'Estabelecimento',
      description: 'Informações básicas do seu estabelecimento',
      icon: Home,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      id: 'hours' as SettingsSection,
      title: 'Horários',
      description: 'Horários de funcionamento',
      icon: Clock,
      color: 'text-green-600 bg-green-100',
    },
    {
      id: 'users' as SettingsSection,
      title: 'Usuários',
      description: 'Gerenciar equipe e permissões',
      icon: Users,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      id: 'banner' as SettingsSection,
      title: 'Banner Principal',
      description: 'Upload da imagem do banner',
      icon: Upload,
      color: 'text-orange-600 bg-orange-100',
    },
    {
      id: 'notifications' as SettingsSection,
      title: 'Notificações',
      description: 'Configurações de alertas',
      icon: Bell,
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      id: 'theme' as SettingsSection,
      title: 'Aparência',
      description: 'Personalizar tema e cores',
      icon: Palette,
      color: 'text-pink-600 bg-pink-100',
    },
    {
      id: 'advanced' as SettingsSection,
      title: 'Avançado',
      description: 'Configurações avançadas',
      icon: Shield,
      color: 'text-red-600 bg-red-100',
    }
  ];

  const renderSettingsContent = () => {
    switch (activeSection) {
      case 'establishment':
        return <SalonInfoCard salon={salon} onUpdate={onRefresh} />;
      case 'hours':
        return <OpeningHoursCard salonId={salon.id} initialHours={salon.opening_hours} />;
      case 'users':
        return <SalonUsersCard salonId={salon.id} maxUsers={5} />;
      case 'banner':
        return <BannerUploadCard salon={salon} onUpdate={onRefresh} />;
      case 'notifications':
        return <NotificationSettingsCard salon={salon} />;
      case 'theme':
        return <ThemeSettingsCard salon={salon} />;
      case 'advanced':
        return <AdvancedSettingsCard salon={salon} onRefresh={onRefresh} />;
      default:
        return <SalonInfoCard salon={salon} onUpdate={onRefresh} />;
    }
  };

  const activeItem = settingsMenuItems.find(item => item.id === activeSection);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-full p-3">
            <Settings className="h-8 w-8" />
          </div>
          <div>
            <h1 className="font-bold text-2xl">Configurações</h1>
            <p className="text-blue-100">Gerencie as configurações do seu estabelecimento</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Menu Lateral */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Menu de Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {settingsMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start h-auto p-4 ${
                      isActive 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveSection(item.id)}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className={`rounded-lg p-2 ${
                        isActive ? 'bg-white/20' : item.color
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          isActive ? 'text-white' : item.color.split(' ')[0]
                        }`} />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm">{item.title}</div>
                        <div className={`text-xs ${
                          isActive ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo Principal */}
        <div className="lg:col-span-3">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="flex items-center space-x-3">
                {activeItem && (
                  <>
                    <div className={`rounded-lg p-2 ${activeItem.color}`}>
                      <activeItem.icon className={`h-6 w-6 ${activeItem.color.split(' ')[0]}`} />
                    </div>
                    <div>
                      <span className="text-xl">{activeItem.title}</span>
                      <p className="text-sm text-gray-600 font-normal mt-1">
                        {activeItem.description}
                      </p>
                    </div>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {renderSettingsContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPanel;
