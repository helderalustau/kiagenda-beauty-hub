import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Store } from "lucide-react";

interface UserTypeSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserTypeSelectionModal: React.FC<UserTypeSelectionModalProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();

  const handleClientAccess = () => {
    onOpenChange(false);
    navigate('/client-login');
  };

  const handleAdminAccess = () => {
    onOpenChange(false);
    navigate('/admin-login');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Como você deseja acessar?
          </DialogTitle>
          <DialogDescription className="text-center">
            Escolha o tipo de acesso para continuar
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-600"
            onClick={handleClientAccess}
          >
            <CardContent className="flex items-center space-x-4 p-6">
              <div className="bg-blue-100 rounded-full p-3">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Cliente</h3>
                <p className="text-sm text-gray-600">
                  Agendar serviços e gerenciar meus agendamentos
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-pink-600"
            onClick={handleAdminAccess}
          >
            <CardContent className="flex items-center space-x-4 p-6">
              <div className="bg-pink-100 rounded-full p-3">
                <Store className="h-6 w-6 text-pink-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Administrador</h3>
                <p className="text-sm text-gray-600">
                  Gerenciar meu salão e atendimentos
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="px-8"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserTypeSelectionModal;