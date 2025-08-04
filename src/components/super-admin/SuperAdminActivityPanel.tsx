
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Activity, User, Calendar, CheckCircle, LogIn, Loader2, Search } from "lucide-react";
import { useSystemActivityLogs } from '@/hooks/useSystemActivityLogs';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SystemActivityLog } from '@/types/supabase-entities';

const SuperAdminActivityPanel = () => {
  const { activityLogs, loading, fetchActivityLogs } = useSystemActivityLogs();
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'client_registration': return <User className="h-4 w-4" />;
      case 'appointment_created': return <Calendar className="h-4 w-4" />;
      case 'appointment_completed': return <CheckCircle className="h-4 w-4" />;
      case 'admin_login': return <LogIn className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'client_registration': return 'bg-blue-100 text-blue-800';
      case 'appointment_created': return 'bg-green-100 text-green-800';
      case 'appointment_completed': return 'bg-purple-100 text-purple-800';
      case 'admin_login': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityLabel = (activityType: string) => {
    switch (activityType) {
      case 'client_registration': return 'Cadastro de Cliente';
      case 'appointment_created': return 'Novo Agendamento';
      case 'appointment_completed': return 'Serviço Concluído';
      case 'admin_login': return 'Login Admin';
      default: return activityType;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = activityFilter === 'all' || log.activity_type === activityFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getActivityStats = () => {
    const today = new Date().toDateString();
    const todayLogs = activityLogs.filter(log => 
      new Date(log.created_at).toDateString() === today
    );

    return {
      total: activityLogs.length,
      today: todayLogs.length,
      clientRegistrations: todayLogs.filter(log => log.activity_type === 'client_registration').length,
      appointments: todayLogs.filter(log => log.activity_type === 'appointment_created').length,
      completedServices: todayLogs.filter(log => log.activity_type === 'appointment_completed').length,
      adminLogins: todayLogs.filter(log => log.activity_type === 'admin_login').length
    };
  };

  const stats = getActivityStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando atividades do sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monitor de Atividades</h2>
          <p className="text-gray-600">
            Acompanhe em tempo real tudo que acontece no sistema
          </p>
        </div>
        <Button onClick={fetchActivityLogs} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividades Hoje</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
            <p className="text-xs text-muted-foreground">
              Total: {stats.total} atividades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.clientRegistrations}</div>
            <p className="text-xs text-muted-foreground">Hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.appointments}</div>
            <p className="text-xs text-muted-foreground">Hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serviços Concluídos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.completedServices}</div>
            <p className="text-xs text-muted-foreground">Hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por título ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as atividades</SelectItem>
                  <SelectItem value="client_registration">Cadastros de Cliente</SelectItem>
                  <SelectItem value="appointment_created">Novos Agendamentos</SelectItem>
                  <SelectItem value="appointment_completed">Serviços Concluídos</SelectItem>
                  <SelectItem value="admin_login">Logins Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>
            Feed de Atividades ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma atividade encontrada
              </h3>
              <p className="text-gray-500">
                Tente ajustar os filtros de pesquisa
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                      {getActivityIcon(log.activity_type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {log.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={getActivityColor(log.activity_type)}>
                          {getActivityLabel(log.activity_type)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                    </div>
                    {log.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {log.description}
                      </p>
                    )}
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-2">
                        <details className="text-xs text-gray-500">
                          <summary className="cursor-pointer hover:text-gray-700">
                            Ver detalhes
                          </summary>
                          <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminActivityPanel;
