
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Calendar, Wrench, Settings, DollarSign } from "lucide-react";

const AdminDashboardTabs = () => {
  return (
    <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm p-1 rounded-xl h-auto shadow-lg">
      <TabsTrigger 
        value="overview" 
        className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-3"
      >
        <div className="flex flex-col items-center space-y-1">
          <BarChart3 className="h-5 w-5" />
          <span className="text-sm font-medium hidden sm:inline">Visão Geral</span>
        </div>
      </TabsTrigger>
      
      <TabsTrigger 
        value="calendar" 
        className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-3"
      >
        <div className="flex flex-col items-center space-y-1">
          <Calendar className="h-5 w-5" />
          <span className="text-sm font-medium hidden sm:inline">Agenda</span>
        </div>
      </TabsTrigger>
      
      <TabsTrigger 
        value="financial" 
        className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-3"
      >
        <div className="flex flex-col items-center space-y-1">
          <DollarSign className="h-5 w-5" />
          <span className="text-sm font-medium hidden sm:inline">Financeiro</span>
        </div>
      </TabsTrigger>
      
      <TabsTrigger 
        value="services" 
        className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-3"
      >
        <div className="flex flex-col items-center space-y-1">
          <Wrench className="h-5 w-5" />
          <span className="text-sm font-medium hidden sm:inline">Serviços</span>
        </div>
      </TabsTrigger>
      
      <TabsTrigger 
        value="settings" 
        className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 py-3"
      >
        <div className="flex flex-col items-center space-y-1">
          <Settings className="h-5 w-5" />
          <span className="text-sm font-medium hidden sm:inline">Configurações</span>
        </div>
      </TabsTrigger>
    </TabsList>
  );
};

export default AdminDashboardTabs;
