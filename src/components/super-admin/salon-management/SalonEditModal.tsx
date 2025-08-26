
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Trash2, AlertTriangle, Calendar, Loader2 } from "lucide-react";
import { Salon, useSupabaseData } from '@/hooks/useSupabaseData';
import { useSalonFinancialOperations } from '@/hooks/salon/useSalonFinancialOperations';

interface SalonEditModalProps {
  salon: Salon | null;
  isOpen: boolean;
  onClose: () => void;
  onSalonUpdated: () => void;
}

const SalonEditModal = ({ salon, isOpen, onClose, onSalonUpdated }: SalonEditModalProps) => {
  const { updateSalon } = useSupabaseData();
  const financialOps = useSalonFinancialOperations();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: salon?.name || '',
    plan: salon?.plan || 'bronze'
  });

  React.useEffect(() => {
    if (salon) {
      setFormData({
        name: salon.name,
        plan: salon.plan
      });
    }
  }, [salon]);

  if (!salon) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro de Validação",
        description: "Nome do estabelecimento é obrigatório",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const result = await updateSalon({
        id: salon.id,
        name: formData.name.trim(),
        plan: formData.plan as 'bronze' | 'prata' | 'gold'
      });
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Estabelecimento atualizado com sucesso!"
        });
        onSalonUpdated();
        onClose();
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao atualizar estabelecimento",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating salon:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao atualizar estabelecimento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearFinancialData = async () => {
    if (!salon) return;
    
    try {
      const result = await financialOps.clearSalonFinancialData(salon.id);
      
      if (result.success) {
        toast({
          title: "Dados Financeiros Limpos",
          description: result.message || "Todos os dados financeiros foram removidos com sucesso!",
        });
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao limpar dados financeiros",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error clearing financial data:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao limpar dados financeiros",
        variant: "destructive"
      });
    }
  };

  const handleClearAppointmentsHistory = async () => {
    if (!salon) return;
    
    try {
      const result = await financialOps.clearSalonAppointmentsHistory(salon.id);
      
      if (result.success) {
        toast({
          title: "Histórico de Atendimentos Limpo",
          description: result.message || "Todo o histórico de atendimentos foi removido com sucesso!",
        });
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao limpar histórico de atendimentos",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error clearing appointments history:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao limpar histórico de atendimentos",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5" />
            Editar Estabelecimento
          </DialogTitle>
          <DialogDescription>
            Edite as informações do estabelecimento
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Estabelecimento *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Digite o nome do estabelecimento"
              required
            />
          </div>

          <div>
            <Label htmlFor="plan">Plano *</Label>
            <Select
              value={formData.plan}
              onValueChange={(value) => handleInputChange('plan', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="prata">Prata</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="text-lg font-semibold text-destructive">Área de Risco</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Ações irreversíveis que afetam permanentemente os dados do estabelecimento.
            </p>
            
            <div className="space-y-3">
              {/* Limpar Dados Financeiros */}
              <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                <h4 className="font-medium text-destructive mb-2">Limpar Dados Financeiros</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Remove permanentemente todas as transações financeiras do estabelecimento.
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-destructive border-destructive/50 hover:bg-destructive/10"
                      disabled={financialOps.loading}
                    >
                      {financialOps.loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Limpar Dados Financeiros
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Limpeza de Dados Financeiros</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação irá remover PERMANENTEMENTE todas as transações financeiras do estabelecimento "{salon?.name}". 
                        Esta operação não pode ser desfeita.
                        
                        Tem certeza de que deseja continuar?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleClearFinancialData}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Sim, Limpar Dados
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Limpar Histórico de Atendimentos */}
              <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                <h4 className="font-medium text-destructive mb-2">Limpar Histórico de Atendimentos</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Remove permanentemente todos os agendamentos e atendimentos do estabelecimento.
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-destructive border-destructive/50 hover:bg-destructive/10"
                      disabled={financialOps.loading}
                    >
                      {financialOps.loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Calendar className="mr-2 h-4 w-4" />
                          Limpar Histórico de Atendimentos
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Limpeza de Histórico de Atendimentos</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação irá remover PERMANENTEMENTE todos os atendimentos (agendamentos) do estabelecimento "{salon?.name}". 
                        Isso inclui todo o histórico de clientes, horários e status dos atendimentos.
                        Esta operação não pode ser desfeita.
                        
                        Tem certeza de que deseja continuar?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleClearAppointmentsHistory}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Sim, Limpar Histórico
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SalonEditModal;
