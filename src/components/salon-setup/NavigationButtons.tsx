
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, Home } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { setupSteps } from './SetupSteps';

interface NavigationButtonsProps {
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
  isFinishing?: boolean;
}

const NavigationButtons = ({ currentStep, onPrevious, onNext, onFinish, isFinishing = false }: NavigationButtonsProps) => {
  const navigate = useNavigate();

  const handleBackButton = () => {
    if (currentStep === 0) {
      // Se estiver no primeiro passo, verificar se é primeiro acesso
      const adminAuth = localStorage.getItem('adminAuth');
      if (adminAuth) {
        try {
          const admin = JSON.parse(adminAuth);
          if (admin.isFirstAccess) {
            // Se for primeiro acesso, voltar para homepage
            navigate('/');
          } else {
            // Se for configuração posterior, voltar para dashboard
            navigate('/admin-dashboard');
          }
        } catch (error) {
          // Em caso de erro, voltar para homepage
          navigate('/');
        }
      } else {
        navigate('/');
      }
    } else {
      // Se não estiver no primeiro passo, usar navegação normal entre steps
      onPrevious();
    }
  };

  return (
    <div className="flex justify-between pt-6">
      <Button
        variant="outline"
        onClick={handleBackButton}
        disabled={isFinishing}
      >
        {currentStep === 0 ? (
          <>
            <Home className="h-4 w-4 mr-2" />
            Voltar
          </>
        ) : (
          <>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </>
        )}
      </Button>

      {currentStep < setupSteps.length - 1 ? (
        <Button onClick={onNext} disabled={isFinishing}>
          Próximo
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      ) : (
        <Button onClick={onFinish} disabled={isFinishing}>
          {isFinishing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Finalizando...
            </>
          ) : (
            <>
              Finalizar Configuração
              <CheckCircle className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
