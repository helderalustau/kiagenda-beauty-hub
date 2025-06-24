
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, User, LogOut, RefreshCw, Search, X } from "lucide-react";

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
      {/* Header Compacto */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg p-2">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                  BeautyFlow
                </h1>
                <p className="text-xs text-gray-600">Olá, {user?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button 
                onClick={onRetry}
                variant="ghost" 
                size="sm"
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                onClick={onBackToHome}
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button 
                onClick={onLogout}
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Search Bar Compacta */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar estabelecimentos..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10 h-9 text-sm bg-gray-50 border-gray-200"
            />
            {searchTerm && (
              <button
                onClick={onClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientDashboardHeader;
