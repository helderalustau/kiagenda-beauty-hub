
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, User, LogOut, RefreshCw, Search } from "lucide-react";

interface ClientDashboardHeaderProps {
  user: any;
  searchTerm: string;
  isRefreshing: boolean;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onRetry: () => void;
  onBackToHome: () => void;
  onLogout: () => void;
}

const ClientDashboardHeader = ({
  user,
  searchTerm,
  isRefreshing,
  onSearchChange,
  onClearSearch,
  onRetry,
  onBackToHome,
  onLogout
}: ClientDashboardHeaderProps) => {
  return (
    <>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg p-2">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                  BeautyFlow
                </h1>
                <p className="text-sm text-gray-600">Bem-vindo(a), {user?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                onClick={onRetry}
                variant="outline" 
                size="sm"
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button 
                onClick={onBackToHome}
                variant="outline" 
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Início
              </Button>
              <Button 
                onClick={onLogout}
                variant="outline" 
                size="sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Header with Search */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard do Cliente
          </h2>
          <p className="text-gray-600 mb-6">
            Gerencie seus agendamentos e encontre novos estabelecimentos
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Pesquisar estabelecimentos..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
              {searchTerm && (
                <button
                  onClick={onClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientDashboardHeader;
