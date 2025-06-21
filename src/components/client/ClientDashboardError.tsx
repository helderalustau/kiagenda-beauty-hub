
import React from 'react';
import { Button } from "@/components/ui/button";

interface ClientDashboardErrorProps {
  onRetry: () => void;
  onBackToHome: () => void;
}

const ClientDashboardError = ({ onRetry, onBackToHome }: ClientDashboardErrorProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <div className="text-red-500 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L4.064 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Erro ao carregar dados
            </h3>
            <p className="text-gray-600 mb-4">
              Não foi possível carregar os dados. Verifique sua conexão e tente novamente.
            </p>
            <div className="space-y-2">
              <Button onClick={onRetry} className="w-full">
                Tentar Novamente
              </Button>
              <Button onClick={onBackToHome} variant="outline" className="w-full">
                Voltar ao Início
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboardError;
