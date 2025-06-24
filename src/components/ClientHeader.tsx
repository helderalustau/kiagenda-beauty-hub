
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Settings } from "lucide-react";
import { Client } from '@/types/supabase-entities';
import ClientProfileModal from './ClientProfileModal';

interface ClientHeaderProps {
  client: Client;
  onUpdate: (updatedClient: Client) => void;
  onLogout: () => void;
}

const ClientHeader = ({ client, onUpdate, onLogout }: ClientHeaderProps) => {
  const [showProfileModal, setShowProfileModal] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfileUpdate = (updatedData: { name: string; email?: string; phone?: string }) => {
    const updatedClient = { ...client, ...updatedData };
    onUpdate(updatedClient);
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AgendaFácil
                </h1>
                <p className="text-sm text-gray-500">Sistema de Agendamentos</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div 
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={() => setShowProfileModal(true)}
              >
                <Avatar className="h-10 w-10 border-2 border-blue-200 hover:border-blue-300 transition-colors">
                  <AvatarImage src={client.email ? `https://api.dicebear.com/7.x/initials/svg?seed=${client.username || client.name}` : undefined} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                    {getInitials(client.username || client.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{client.username || client.name}</p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Settings className="h-3 w-3 mr-1" />
                    Editar perfil
                  </p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <ClientProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        clientData={{
          id: client.id,
          name: client.username || client.name,
          email: client.email || '',
          phone: client.phone || ''
        }}
        onSave={handleProfileUpdate}
      />
    </>
  );
};

export default ClientHeader;
