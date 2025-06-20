
import React, { useEffect } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import SalonList from '@/components/SalonList';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, LogOut } from "lucide-react";

const ClientDashboard = () => {
  const { 
    salons, 
    loading, 
    fetchAllSalons 
  } = useSupabaseData();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/client-login');
      return;
    }

    fetchAllSalons();
  }, [user, fetchAllSalons, navigate]);

  const handleBookService = async (salon: any) => {
    // Armazenar dados do estabelecimento selecionado para uso no agendamento
    localStorage.setItem('selectedSalonForBooking', JSON.stringify(salon));
    navigate(`/booking/${salon.unique_slug || salon.id}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Carregando estabelecimentos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
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
                onClick={handleBackToHome}
                variant="outline" 
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Início
              </Button>
              <Button 
                onClick={handleLogout}
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

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Estabelecimentos Disponíveis
          </h2>
          <p className="text-gray-600">
            Escolha um estabelecimento para agendar seus serviços
          </p>
        </div>
        
        {salons.length > 0 ? (
          <SalonList 
            salons={salons} 
            onBookService={handleBookService}
          />
        ) : (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum estabelecimento disponível
              </h3>
              <p className="text-gray-600">
                Não há estabelecimentos cadastrados no momento. Volte mais tarde para ver as opções disponíveis.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
