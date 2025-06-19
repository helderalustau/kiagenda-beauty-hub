
import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Home, 
  Calendar, 
  Scissors, 
  Settings, 
  LogOut,
  Crown
} from "lucide-react";

interface AdminSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  salonName: string;
  ownerName: string;
  plan: string;
}

const AdminSidebar = ({ currentPage, onPageChange, salonName, ownerName, plan }: AdminSidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'appointments', label: 'Agendamentos', icon: Calendar },
    { id: 'services', label: 'Serviços', icon: Scissors },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'bronze': return 'text-amber-600 bg-amber-100';
      case 'prata': return 'text-gray-600 bg-gray-100';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-pink-500 p-2 rounded-lg">
            <Scissors className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{salonName}</h2>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(plan)}`}>
              <Crown className="h-3 w-3 mr-1" />
              Plano {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onPageChange(item.id)}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar>
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {ownerName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{ownerName}</p>
            <p className="text-xs text-gray-500">Administrador</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => window.location.href = '/'}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
