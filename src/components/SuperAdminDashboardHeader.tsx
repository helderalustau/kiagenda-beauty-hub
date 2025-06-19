
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Scissors, LogOut, Trash } from "lucide-react";

interface SuperAdminDashboardHeaderProps {
  onBackToHome: () => void;
  onCleanupSalons: () => void;
  onLogout: () => void;
}

const SuperAdminDashboardHeader = ({ onBackToHome, onCleanupSalons, onLogout }: SuperAdminDashboardHeaderProps) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={onBackToHome}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar ao Login</span>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-pink-500 p-2 rounded-lg">
                <Scissors className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
                Super Admin Dashboard
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={onCleanupSalons}
              className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <Trash className="h-4 w-4" />
              <span>Limpar Estabelecimentos</span>
            </Button>
            <Button
              variant="outline"
              onClick={onLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SuperAdminDashboardHeader;
