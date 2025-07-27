
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, LogOut, RefreshCw } from "lucide-react";
import ClientProfilePopup from './ClientProfilePopup';
import { useClientData } from '@/hooks/useClientData';

interface ClientDashboardHeaderProps {
  user: any;
  onLogout: () => void;
  onBackToHome: () => void;
  onUserUpdate?: (updatedUser: any) => void;
}

const ClientDashboardHeader = ({
  user,
  onLogout,
  onBackToHome,
  onUserUpdate
}: ClientDashboardHeaderProps) => {
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const { getClientProfile } = useClientData();

  const handleOpenProfile = async () => {
    // Buscar dados atualizados do perfil antes de abrir o popup
    if (user?.id) {
      const result = await getClientProfile(user.id);
      if (result.success) {
        setCurrentUser(result.client);
        // Atualizar localStorage com dados mais recentes
        localStorage.setItem('clientAuth', JSON.stringify(result.client));
        if (onUserUpdate) {
          onUserUpdate(result.client);
        }
      }
    }
    setShowProfilePopup(true);
  };

  const handleProfileUpdate = (updatedClient: any) => {
    // Update localStorage with new client data
    localStorage.setItem('clientAuth', JSON.stringify(updatedClient));
    setCurrentUser(updatedClient);
    
    // Update the user state in the parent component
    if (onUserUpdate) {
      onUserUpdate(updatedClient);
    }
  };

  // Garantir que sempre temos um nome para exibir
  const displayName = currentUser?.username || currentUser?.name || user?.username || user?.name || 'Usuário';

  return (
    <>
      {/* Header Compacto */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg p-2">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">Kiagenda</h1>
                <p className="text-xs text-gray-600">Olá, {displayName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button 
                onClick={handleOpenProfile} 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                title="Editar perfil"
              >
                <User className="h-4 w-4" />
              </Button>
              <Button onClick={onBackToHome} variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button onClick={onLogout} variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {(currentUser || user) && (
        <ClientProfilePopup
          isOpen={showProfilePopup}
          onClose={() => setShowProfilePopup(false)}
          client={currentUser || user}
          onUpdate={handleProfileUpdate}
        />
      )}
    </>
  );
};

export default ClientDashboardHeader;
