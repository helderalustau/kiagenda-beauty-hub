
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Scissors, TrendingUp, Users, DollarSign, RefreshCw } from "lucide-react";
import { Service, useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";
import ServiceCreationModal from './service-management/ServiceCreationModal';
import ServiceCard from './service-management/ServiceCard';

interface ServiceManagerProps {
  salonId: string;
  services?: Service[];
  onRefresh?: () => void;
}

const ServiceManager = ({ salonId, services: propServices = [], onRefresh }: ServiceManagerProps) => {
  const { 
    services: hookServices, 
    fetchSalonServices, 
    updateService, 
    deleteService, 
    toggleServiceStatus,
    loading
  } = useSupabaseData();
  const { toast } = useToast();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use hook services if available, otherwise use props
  const currentServices = hookServices.length > 0 ? hookServices : propServices;

  // Load services on mount and when salonId changes
  useEffect(() => {
    if (salonId) {
      console.log('ServiceManager - Loading services for salon:', salonId);
      loadServices();
    }
  }, [salonId]);

  const loadServices = async () => {
    try {
      setIsRefreshing(true);
      await fetchSalonServices(salonId);
      console.log('ServiceManager - Services loaded successfully');
    } catch (error) {
      console.error('ServiceManager - Error loading services:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar serviços. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await loadServices();
    if (onRefresh) {
      onRefresh();
    }
  };

  const filteredServices = currentServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && service.active;
    if (activeTab === 'inactive') return matchesSearch && !service.active;
    
    return matchesSearch;
  });

  const serviceStats = {
    total: currentServices.length,
    active: currentServices.filter(s => s.active).length,
    inactive: currentServices.filter(s => !s.active).length,
    averagePrice: currentServices.length > 0 
      ? currentServices.reduce((sum, s) => sum + Number(s.price), 0) / currentServices.length 
      : 0,
    totalRevenuePotential: currentServices
      .filter(s => s.active)
      .reduce((sum, s) => sum + Number(s.price), 0)
  };

  const handleEdit = (service: Service) => {
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de edição será implementada em breve.",
    });
  };

  const handleDelete = async (service: Service) => {
    if (!confirm(`Tem certeza que deseja excluir o serviço "${service.name}"?`)) {
      return;
    }

    const result = await deleteService(service.id);
    
    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Serviço excluído com sucesso!",
      });
      await handleRefresh();
    } else {
      toast({
        title: "Erro",
        description: result.message || "Erro ao excluir serviço",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (service: Service) => {
    const result = await toggleServiceStatus(service.id, service.active);
    
    if (result.success) {
      toast({
        title: "Sucesso",
        description: `Serviço ${service.active ? 'desativado' : 'ativado'} com sucesso!`,
      });
      await handleRefresh();
    } else {
      toast({
        title: "Erro",
        description: result.message || "Erro ao alterar status do serviço",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleServiceCreated = async () => {
    console.log('ServiceManager - Service created, refreshing...');
    await handleRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total de Serviços</p>
                <p className="text-2xl font-bold">{serviceStats.total}</p>
              </div>
              <Scissors className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Serviços Ativos</p>
                <p className="text-2xl font-bold">{serviceStats.active}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Preço Médio</p>
                <p className="text-2xl font-bold">{formatCurrency(serviceStats.averagePrice)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Potencial de Receita</p>
                <p className="text-2xl font-bold">{formatCurrency(serviceStats.totalRevenuePotential)}</p>
              </div>
              <Users className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                <Scissors className="h-6 w-6 mr-2 text-blue-600" />
                Gerenciar Serviços
              </CardTitle>
              <CardDescription className="text-gray-600">
                Gerencie todos os serviços do seu estabelecimento
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing || loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Serviço
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all" className="flex items-center">
                Todos ({serviceStats.total})
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center">
                Ativos ({serviceStats.active})
              </TabsTrigger>
              <TabsTrigger value="inactive" className="flex items-center">
                Inativos ({serviceStats.inactive})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {loading || isRefreshing ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando serviços...</p>
                </div>
              ) : filteredServices.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Card className="bg-gray-50 border-dashed border-2 border-gray-300">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Scissors className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm ? 'Nenhum serviço encontrado' : 'Nenhum serviço cadastrado'}
                      </h3>
                      <p className="text-gray-600 text-center mb-4 max-w-md">
                        {searchTerm 
                          ? `Não encontramos serviços com o termo "${searchTerm}". Tente outro termo de busca.`
                          : 'Adicione serviços para que os clientes possam fazer agendamentos'
                        }
                      </p>
                      {!searchTerm && (
                        <Button 
                          onClick={() => setShowCreateDialog(true)}
                          className="bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Primeiro Serviço
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Service Creation Modal */}
      <ServiceCreationModal
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        salonId={salonId}
        onSuccess={handleServiceCreated}
      />
    </div>
  );
};

export default ServiceManager;
