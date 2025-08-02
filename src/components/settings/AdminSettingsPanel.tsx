
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Clock, Users, Image, Bell, Palette, Settings } from "lucide-react";
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

const AdminSettingsPanel = ({ salon, onRefresh }: AdminSettingsPanelProps) => {
  const [activeTab, setActiveTab] = useState('establishment');

  const tabs = [
    {
      id: 'establishment',
      label: 'Estabelecimento',
      icon: Home,
      component: <SalonInfoCard salon={salon} onRefresh={onRefresh} />
    },
    {
      id: 'hours',
      label: 'Horários',
      icon: Clock,
      component: <OpeningHoursCard salon={salon} onRefresh={onRefresh} />
    },
    {
      id: 'users',
      label: 'Usuários',
      icon: Users,
      component: <SalonUsersCard salon={salon} onRefresh={onRefresh} />
    },
    {
      id: 'banner',
      label: 'Banner',
      icon: Image,
      component: <BannerUploadCard salon={salon} onRefresh={onRefresh} />
    },
    {
      id: 'notifications',
      label: 'Notificações',
      icon: Bell,
      component: <NotificationSettingsCard salon={salon} onRefresh={onRefresh} />
    },
    {
      id: 'theme',
      label: 'Aparência',
      icon: Palette,
      component: <ThemeSettingsCard salon={salon} onRefresh={onRefresh} />
    },
    {
      id: 'advanced',
      label: 'Avançado',
      icon: Settings,
      component: <AdvancedSettingsCard salon={salon} onRefresh={onRefresh} />
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
            Configurações do Estabelecimento
          </CardTitle>
          <p className="text-sm text-gray-600">
            Gerencie as configurações do seu estabelecimento
          </p>
        </CardHeader>
      </Card>

      {/* Horizontal Tab Navigation - Responsivo */}
      <Card>
        <CardContent className="p-2">
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`flex-1 min-w-0 flex items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 h-auto flex-col sm:flex-row text-xs sm:text-sm ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate text-center sm:text-left mt-1 sm:mt-0">
                    {tab.label}
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default AdminSettingsPanel;
