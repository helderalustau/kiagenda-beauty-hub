
import React, { useEffect, useState } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import SalonList from '@/components/SalonList';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, User, LogOut, RefreshCw, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ClientDashboard = () => {
  const { 
    salons, 
    loading, 
    fetchAllSalons 
  } = useSupabaseData();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [hasError, setHasError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSalons, setFilteredSalons] = useState(salons);

  useEffect(() => {
    if (!user) {
      navigate('/client-login');
      return;
    }

    loadSalons();
  }, [user, navigate]);

  // Filter salons based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSalons(salons);
    } else {
      const filtered = salons.filter(salon => 
        salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salon.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSalons(filtered);
    }
  }, [salons, searchTerm]);

  const loadSalons = async () => {
    try {
      console.log('ClientDashboard - Carregando estabelecimentos...');
      setHasError(false);
      setIsRefreshing(true);
      await fetchAllSalons();
      console.log('ClientDashboard - Estabelecimentos carregados:', salons.length);
    } catch (error) {
      console.error('ClientDashboard - Erro ao carregar estabelecimentos:', error);
      setHasError(true);
      toast({
        title: "Erro",
        description: "Erro ao carregar estabelecimentos. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBookService = async (salon: any) => {
    try {
      console.log('ClientDashboard - Selecionando estabelecimento para agendamento:', salon.id);
      localStorage.setItem('selectedSalonForBooking', JSON.stringify(salon));
      navigate(`/booking/${salon.unique_slug || salon.id}`);
    } catch (error) {
      console.error('ClientDashboard - Erro ao selecionar estabelecimento:', error);
      toast({
        title: "Erro",
        description: "Erro ao selecionar estabelecimento. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleRetry = () => {
    loadSalons();
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (loading && !isRefreshing) {
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

  if (hasError) {
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
                Não foi possível carregar os estabelecimentos. Verifique sua conexão e tente novamente.
              </p>
              <div className="space-y-2">
                <Button onClick={handleRetry} className="w-full">
                  Tentar Novamente
                </Button>
                <Button onClick={handleBackToHome} variant="outline" className="w-full">
                  Voltar ao Início
                </Button>
              </div>
            </div>
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
                onClick={handleRetry}
                variant="outline" 
                size="sm"
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
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
          <p className="text-gray-600 mb-6">
            Escolha um estabelecimento para agendar seus serviços
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Pesquisar por nome do estabelecimento ou responsável..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
        
        {isRefreshing ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Atualizando estabelecimentos...</p>
          </div>
        ) : filteredSalons.length > 0 ? (
          <>
            {searchTerm && (
              <div className="mb-4 text-center">
                <p className="text-gray-600">
                  {filteredSalons.length} estabelecimento{filteredSalons.length !== 1 ? 's' : ''} encontrado{filteredSalons.length !== 1 ? 's' : ''}
                  {searchTerm && ` para "${searchTerm}"`}
                </p>
              </div>
            )}
            <SalonList 
              salons={filteredSalons} 
              onBookService={handleBookService}
            />
          </>
        ) : searchTerm ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum estabelecimento encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                Não encontramos estabelecimentos com o termo "{searchTerm}". Tente pesquisar por outro nome.
              </p>
              <Button onClick={clearSearch} variant="outline">
                Limpar Pesquisa
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum estabelecimento disponível
              </h3>
              <p className="text-gray-600 mb-4">
                Não há estabelecimentos cadastrados no momento. Volte mais tarde para ver as opções disponíveis.
              </p>
              <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
