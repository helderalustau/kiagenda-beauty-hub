
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Calendar, Users, Settings } from "lucide-react";

const AdminDashboardTabs = () => {
  return (
    <>
      <div className="sm:hidden">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="text-xs">
            <BarChart3 className="h-3 w-3 mr-1" />
            Visão
          </TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            Agenda
          </TabsTrigger>
        </TabsList>
        <div className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="services" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Serviços
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Config
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      <div className="hidden sm:block">
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
      </div>
    </>
  );
};

export default AdminDashboardTabs;
