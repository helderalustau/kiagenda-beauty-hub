import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface PlanUpgradeRequest {
  id: string;
  salon_id: string;
  salon_name: string;
  current_plan: string;
  requested_plan: string;
  status: string;
  created_at: string;
}

const PlanUpgradeRequestsList = () => {
  const [requests, setRequests] = useState<PlanUpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('plan_upgrade_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as solicitações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (request: PlanUpgradeRequest) => {
    setProcessing(request.id);
    
    try {
      // 1. Atualizar o plano do salão (e garantir que fique aberto)
      const { error: salonError } = await supabase
        .from('salons')
        .update({ 
          plan: request.requested_plan,
          is_open: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.salon_id);

      if (salonError) throw salonError;

      // 2. Atualizar todas as tabelas relacionadas com o plano (se existirem)
      // Verificar se existem outras tabelas que armazenam informações do plano
      const { error: adminError } = await supabase
        .from('admin_auth')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('salon_id', request.salon_id);

      // Não falha se não conseguir atualizar admin_auth (pode não existir)
      if (adminError) {
        console.warn('Aviso ao atualizar admin_auth:', adminError);
      }

      // 3. Marcar solicitação como aprovada
      const { error: requestError } = await supabase
        .from('plan_upgrade_requests')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          admin_notes: `Upgrade aprovado automaticamente. Plano alterado de ${request.current_plan} para ${request.requested_plan}.`
        })
        .eq('id', request.id);

      if (requestError) throw requestError;

      toast({
        title: "Solicitação Aprovada",
        description: `Plano do ${request.salon_name} atualizado para ${request.requested_plan.toUpperCase()}.`,
      });

      // Remover da lista
      setRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aprovar a solicitação.",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectRequest = async (request: PlanUpgradeRequest) => {
    setProcessing(request.id);
    
    try {
      const { error } = await supabase
        .from('plan_upgrade_requests')
        .update({ 
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          admin_notes: 'Solicitação rejeitada pelo super administrador.'
        })
        .eq('id', request.id);

      if (error) throw error;

      toast({
        title: "Solicitação Rejeitada",
        description: `Solicitação do ${request.salon_name} foi rejeitada. O estabelecimento continua com o plano ${request.current_plan.toUpperCase()}.`,
      });

      // Remover da lista
      setRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar a solicitação.",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando solicitações...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhuma solicitação de upgrade pendente.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Solicitações de Upgrade de Plano</h3>
      
      {requests.map((request) => (
        <Card key={request.id} className="border-l-4 border-l-orange-400">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{request.salon_name}</CardTitle>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Pendente
              </Badge>
            </div>
            <CardDescription>
              Solicitado em {new Date(request.created_at).toLocaleDateString('pt-BR')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Plano Atual</p>
                  <p className="font-medium">{request.current_plan.toUpperCase()}</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl">→</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plano Solicitado</p>
                  <p className="font-medium text-blue-600">{request.requested_plan.toUpperCase()}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleApproveRequest(request)}
                  disabled={processing === request.id}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {processing === request.id ? 'Aprovando...' : 'Aprovar'}
                </Button>
                <Button
                  onClick={() => handleRejectRequest(request)}
                  disabled={processing === request.id}
                  variant="destructive"
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  {processing === request.id ? 'Rejeitando...' : 'Rejeitar'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PlanUpgradeRequestsList;