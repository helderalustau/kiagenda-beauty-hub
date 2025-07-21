
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  RefreshCw, 
  LogOut, 
  Trash2, 
  Settings 
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

interface SuperAdminDashboardHeaderProps {
  onBackToHome: () => void;
  onCleanupSalons: () => void;
  onCleanupIncompleteSalons: () => void;
  onLogout: () => void;
}

const SuperAdminDashboardHeader = ({ 
  onBackToHome, 
  onCleanupSalons, 
  onCleanupIncompleteSalons,
  onLogout 
}: SuperAdminDashboardHeaderProps) => {
  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToHome}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-2xl font-bold text-gray-900">
              Painel Super Admin
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            {/* Cleanup Salons Without Admins */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Sem Admins
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Limpeza de Estabelecimentos</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá remover todos os estabelecimentos que não possuem administradores vinculados.
                    Esta ação não pode ser desfeita. Deseja continuar?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onCleanupSalons}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Confirmar Limpeza
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Cleanup Incomplete Salons */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Limpar Incompletos
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Limpeza de Estabelecimentos Incompletos</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá remover todos os estabelecimentos que não concluíram a configuração inicial.
                    Esta ação não pode ser desfeita. Deseja continuar?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onCleanupIncompleteSalons}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Confirmar Limpeza
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="text-gray-600 border-gray-200 hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboardHeader;
