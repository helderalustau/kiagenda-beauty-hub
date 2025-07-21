
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Eye, EyeOff, Loader2, RefreshCw, TrendingUp, Trash2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ClientFilters from './client-management/ClientFilters';
import ClientExportButton from './client-management/ClientExportButton';

interface Client {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  created_at: string;
  password: string;
}

const SuperAdminClientsTab = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [showPasswords, setShowPasswords] = useState(false);
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      setLoading(true);
      console.log('Fetching all clients...');
      
      const { data, error } = await supabase
        .from('client_auth')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }

      console.log('Clients fetched successfully:', data?.length || 0);
      setClients(data || []);
    } catch (error) {
      console.error('Error in fetchClients:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Memoized values for performance
  const availableStates = useMemo(() => {
    const states = [...new Set(clients.map(client => client.state).filter(Boolean))];
    return states.sort();
  }, [clients]);

  const availableCities = useMemo(() => {
    const cities = [...new Set(
      clients
        .filter(client => stateFilter === 'all' || client.state === stateFilter)
        .map(client => client.city)
        .filter(Boolean)
    )];
    return cities.sort();
  }, [clients, stateFilter]);

  const clientStats = useMemo(() => {
    const total = clients.length;
    const withEmail = clients.filter(c => c.email).length;
    const withPhone = clients.filter(c => c.phone).length;
    
    // Calcular crescimento dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentClients = clients.filter(c => new Date(c.created_at) >= thirtyDaysAgo).length;
    
    const stateDistribution = availableStates.map(state => ({
      state,
      count: clients.filter(c => c.state === state).length
    })).sort((a, b) => b.count - a.count);

    return {
      total,
      withEmail,
      withPhone,
      recentClients,
      topStates: stateDistribution.slice(0, 3)
    };
  }, [clients, availableStates]);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    let filtered = clients;

    // Filtro por termo de busca
    if (searchTerm.trim()) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm) ||
        client.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (stateFilter !== 'all') {
      filtered = filtered.filter(client => client.state === stateFilter);
    }

    // Filtro por cidade
    if (cityFilter !== 'all') {
      filtered = filtered.filter(client => client.city === cityFilter);
    }

    setFilteredClients(filtered);
  }, [searchTerm, stateFilter, cityFilter, clients]);

  // Reset city filter when state changes
  useEffect(() => {
    setCityFilter('all');
  }, [stateFilter]);

  const handleRefresh = () => {
    fetchClients();
  };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    try {
      const { error } = await supabase
        .from('client_auth')
        .delete()
        .eq('id', clientId);

      if (error) {
        console.error('Error deleting client:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir cliente",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: `Cliente ${clientName} excluído com sucesso`
      });

      // Refresh the clients list
      fetchClients();
    } catch (error) {
      console.error('Error in handleDeleteClient:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao excluir cliente",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const maskPassword = (password: string) => {
    return '*'.repeat(password.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Clientes</h2>
          <p className="text-gray-600">
            Gerencie todos os clientes cadastrados no sistema
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ClientExportButton clients={clients} filteredClients={filteredClients} />
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{clientStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {clientStats.recentClients} novos nos últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com E-mail</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{clientStats.withEmail}</div>
            <p className="text-xs text-muted-foreground">
              {clientStats.total > 0 ? Math.round((clientStats.withEmail / clientStats.total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Telefone</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{clientStats.withPhone}</div>
            <p className="text-xs text-muted-foreground">
              {clientStats.total > 0 ? Math.round((clientStats.withPhone / clientStats.total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado Líder</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-orange-600">
              {clientStats.topStates[0]?.state || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {clientStats.topStates[0]?.count || 0} clientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <ClientFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        stateFilter={stateFilter}
        setStateFilter={setStateFilter}
        cityFilter={cityFilter}
        setCityFilter={setCityFilter}
        availableStates={availableStates}
        availableCities={availableCities}
      />

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {filteredClients.length} de {clients.length} clientes
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPasswords(!showPasswords)}
              className="flex items-center space-x-2"
            >
              {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showPasswords ? 'Ocultar' : 'Mostrar'} Senhas</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Lista de Clientes ({filteredClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || stateFilter !== 'all' || cityFilter !== 'all' 
                  ? 'Nenhum cliente encontrado' 
                  : 'Nenhum cliente cadastrado'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || stateFilter !== 'all' || cityFilter !== 'all'
                  ? 'Tente ajustar os filtros de pesquisa' 
                  : 'Aguarde o primeiro cadastro de cliente'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome/Usuário</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Senha</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-gray-500">@{client.username}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {client.email && (
                            <div className="text-sm">{client.email}</div>
                          )}
                          {client.phone && (
                            <div className="text-sm text-gray-600">{client.phone}</div>
                          )}
                          {!client.email && !client.phone && (
                            <div className="text-sm text-gray-400">Sem contato</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {(client.city || client.state) && (
                            <div className="font-medium">
                              {client.city}{client.city && client.state && ', '}{client.state}
                            </div>
                          )}
                          {client.address && (
                            <div className="text-gray-600 text-xs mt-1">{client.address}</div>
                          )}
                          {!client.address && !client.city && !client.state && (
                            <div className="text-gray-400">Não informado</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {showPasswords ? client.password : maskPassword(client.password)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(client.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Ativo
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o cliente <strong>{client.name}</strong>? 
                                Esta ação não pode ser desfeita e todos os dados do cliente serão perdidos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteClient(client.id, client.name)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir Cliente
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminClientsTab;
