
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Check, X, Clock, Crown, User, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface PlanUpgradeRequest {
  id: string;
  client_id: string;
  client_name: string;
  current_plan: string;
  requested_plan: string;
  justification: string;
  status: 'pending' | 'approved' | 'rejected';
  request_date: string;
  response_date?: string;
}

const PlanUpgradeRequestsManager = () => {
  const [requests, setRequests] = useState<PlanUpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('plan_upgrade_requests')
        .select('*')
        .order('request_date', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching upgrade requests:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar solicitações de upgrade",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRequestAction = async (requestId: string, action: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('plan_upgrade_requests')
        .update({
          status: action,
          response_date: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      // If approved, update the salon plan
      if (action === 'approved') {
        const request = requests.find(r => r.id === requestId);
        if (request) {
          // Here you would update the salon plan in the salons table
          // This would need to be implemented based on your database structure
        }
      }

      toast({
        title: action === 'approved' ? "Solicitação Aprovada" : "Solicitação Rejeitada",
        description: `A solicitação foi ${action === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso.`
      });

      fetchRequests();
    } catch (error) {
      console.error(`Error ${action} request:`, error);
      toast({
        title: "Erro",
        description: `Erro ao ${action === 'approved' ? 'aprovar' : 'rejeitar'} solicitação`,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'approved': return 'Aprovada';
      case 'rejected': return 'Rejeitada';
      default: return status;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'bronze': return 'bg-amber-100 text-amber-800';
      case 'prata': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'bronze': return 'Bronze';
      case 'prata': return 'Prata';
      case 'gold': return 'Gold';
      default: return plan;
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0">
        <CardHeader>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-blue-600" />
          Solicitações de Upgrade de Plano
        </CardTitle>
        <p className="text-gray-600">
          Gerencie as solicitações de upgrade dos clientes
        </p>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <Crown className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma solicitação de upgrade encontrada</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Plano Atual</TableHead>
                  <TableHead>Plano Solicitado</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{request.client_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPlanColor(request.current_plan)}>
                        {getPlanName(request.current_plan)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPlanColor(request.requested_plan)}>
                        {getPlanName(request.requested_plan)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {request.status === 'approved' && <Check className="h-3 w-3 mr-1" />}
                        {request.status === 'rejected' && <X className="h-3 w-3 mr-1" />}
                        {getStatusLabel(request.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {new Date(request.request_date).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' ? (
                        <div className="flex gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <Check className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Aprovar Solicitação</AlertDialogTitle>
                                <AlertDialogDescription className="space-y-2">
                                  <p>Aprovar upgrade de <strong>{request.client_name}</strong>?</p>
                                  <p><strong>De:</strong> {getPlanName(request.current_plan)} → <strong>Para:</strong> {getPlanName(request.requested_plan)}</p>
                                  <p><strong>Justificativa:</strong> {request.justification}</p>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRequestAction(request.id, 'approved')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Aprovar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                <X className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Rejeitar Solicitação</AlertDialogTitle>
                                <AlertDialogDescription className="space-y-2">
                                  <p>Rejeitar upgrade de <strong>{request.client_name}</strong>?</p>
                                  <p><strong>Justificativa:</strong> {request.justification}</p>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRequestAction(request.id, 'rejected')}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Rejeitar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {request.response_date && new Date(request.response_date).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanUpgradeRequestsManager;
