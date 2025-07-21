
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, Menu } from "lucide-react";
import { Salon } from '@/hooks/useSupabaseData';
import SalonStatusToggle from '@/components/SalonStatusToggle';
import ManualNotificationChecker from '@/components/admin/ManualNotificationChecker';

interface AdminDashboardHeaderProps {
  salon: Salon;
  mobileMenuOpen: boolean;
  pendingCount?: number;
  isCheckingManually?: boolean;
  onBackToHome: () => void;
  onLogout: () => void;
  onToggleMobileMenu: () => void;
  onStatusChange: (isOpen: boolean) => void;
  onCheckAppointments?: () => void;
}

const AdminDashboardHeader = ({
  salon,
  mobileMenuOpen,
  pendingCount = 0,
  isCheckingManually = false,
  onBackToHome,
  onLogout,
  onToggleMobileMenu,
  onStatusChange,
  onCheckAppointments
}: AdminDashboardHeaderProps) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate max-w-48 sm:max-w-none">{salon.name}</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:block">
              <SalonStatusToggle 
                salonId={salon.id}
                isOpen={salon.is_open}
                onStatusChange={onStatusChange}
              />
            </div>
            
            {/* Verificador Manual de Agendamentos */}
            {onCheckAppointments && (
              <div className="hidden lg:block">
                <ManualNotificationChecker
                  pendingCount={pendingCount}
                  isChecking={isCheckingManually}
                  onCheck={onCheckAppointments}
                />
              </div>
            )}
            <Button
              variant="outline"
              onClick={onLogout}
              className="flex items-center space-x-1 sm:space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm"
              size="sm"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMobileMenu}
              className="sm:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="mb-4">
              <SalonStatusToggle 
                salonId={salon.id}
                isOpen={salon.is_open}
                onStatusChange={onStatusChange}
              />
            </div>
            
            {/* Verificador Manual de Agendamentos no Mobile */}
            {onCheckAppointments && (
              <div className="mb-4">
                <ManualNotificationChecker
                  pendingCount={pendingCount}
                  isChecking={isCheckingManually}
                  onCheck={onCheckAppointments}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminDashboardHeader;
