
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Info } from "lucide-react";

interface ClientLoginHeaderProps {
  onBackToHome: () => void;
}

export const ClientLoginHeader = ({ onBackToHome }: ClientLoginHeaderProps) => {
  // Verificar se existe uma URL de retorno para mostrar mensagem contextual
  const returnUrl = localStorage.getItem('returnUrl');
  const isFromBooking = returnUrl && returnUrl.includes('/booking/');
  const selectedSalon = localStorage.getItem('selectedSalonForBooking');
  let salonName = '';
  
  if (selectedSalon) {
    try {
      const salon = JSON.parse(selectedSalon);
      salonName = salon.name || '';
    } catch (e) {
      console.warn('Error parsing salon data:', e);
    }
  }

  return (
    <header className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-6 shadow-lg">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={onBackToHome}
            variant="ghost"
            className="text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 mr-3" />
            <h1 className="text-3xl font-bold">
              {isFromBooking ? 'Login para Agendamento' : 'Área do Cliente'}
            </h1>
          </div>
          
          <p className="text-blue-100 text-lg max-w-md mx-auto">
            {isFromBooking 
              ? 'Para continuar com seu agendamento, faça login ou crie uma nova conta'
            }
          </p>

          {/* Mostrar informação do salão se estiver vindo do agendamento */}
          {isFromBooking && salonName && (
            <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm max-w-md mx-auto">
              <div className="flex items-center justify-center text-white/90">
                <Info className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  Agendamento em: <strong>{salonName}</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
