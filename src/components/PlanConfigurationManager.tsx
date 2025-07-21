
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Save, AlertCircle } from "lucide-react";
import { useSupabaseData, PlanConfiguration } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";

type Props = {
  configurations: PlanConfiguration[];
  onRefresh: () => Promise<void>;
};

const PlanConfigurationManager: React.FC<Props> = ({ configurations, onRefresh }) => {
  const { updatePlanConfiguration } = useSupabaseData();
  const { toast } = useToast();
  const [editingPlan, setEditingPlan] = useState<PlanConfiguration | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSavePlan = async () => {
    if (!editingPlan) return;

    setIsUpdating(true);
    
    try {
      const result = await updatePlanConfiguration({
        planData: {
          id: editingPlan.id,
          name: editingPlan.name,
          plan_type: editingPlan.plan_type,
          price: editingPlan.price,
          max_attendants: editingPlan.max_attendants || 1,
          max_appointments: editingPlan.max_appointments || 50,
          description: editingPlan.description
        }
      });

      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Configuração do plano atualizada com sucesso!"
        });
        setEditingPlan(null);
        await onRefresh();
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao atualizar configuração",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar plano",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditChange = (field: keyof PlanConfiguration, value: any) => {
    if (!editingPlan) return;
    
    setEditingPlan({
      ...editingPlan,
      [field]: value
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gerenciar Preços dos Planos</h1>
        <p className="text-gray-600 mb-4">Configure os valores dos planos de assinatura do sistema</p>
        
        <div className="space-y-3">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-800 mb-1">Atenção - Impacto Global</h3>
                <p className="text-sm text-amber-700">
                  Alterações nos preços dos planos serão aplicadas automaticamente para todos os estabelecimentos que utilizam esses planos. Esta ação afetará a cobrança de todos os clientes.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-1">Como Funciona</h3>
                <p className="text-sm text-blue-700">
                  Os valores alterados aqui serão utilizados como referência para novos contratos e renovações. Estabelecimentos existentes manterão seu plano atual até a próxima renovação, quando o novo valor entrará em vigor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {configurations?.map(plan => (
        <Card key={plan.id} className="border-2 hover:border-primary/20 transition-colors">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-3">
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold">{plan.name}</span>
                    <Badge variant="secondary" className="text-xs">{plan.plan_type}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 font-normal">{plan.description}</p>
                </div>
              </CardTitle>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(Number(plan.price))}
                </div>
                <div className="text-xs text-gray-500">por mês</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Preço Mensal (R$)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-8 text-lg font-semibold"
                    value={editingPlan?.id === plan.id ? editingPlan.price : plan.price}
                    onChange={(e) => handleEditChange('price', parseFloat(e.target.value) || 0)}
                    disabled={editingPlan?.id !== plan.id || isUpdating}
                  />
                </div>
                {editingPlan?.id === plan.id && (
                  <p className="text-xs text-gray-500">
                    Novo valor: <span className="font-semibold text-primary">
                      {formatCurrency(editingPlan.price || 0)}
                    </span>
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Máximo de Usuários</Label>
                <Input
                  type="number"
                  min="1"
                  value={editingPlan?.id === plan.id ? editingPlan.max_users : plan.max_users || 1}
                  onChange={(e) => handleEditChange('max_users', parseInt(e.target.value) || 1)}
                  disabled={editingPlan?.id !== plan.id || isUpdating}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">Descrição do Plano</Label>
              <Input
                value={editingPlan?.id === plan.id ? editingPlan.description || '' : plan.description || ''}
                onChange={(e) => handleEditChange('description', e.target.value)}
                disabled={editingPlan?.id !== plan.id || isUpdating}
                placeholder="Descrição do plano..."
              />
            </div>
            
            {editingPlan?.id === plan.id && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Aviso:</strong> As alterações serão aplicadas imediatamente para todos os estabelecimentos que utilizam este plano.
                </p>
              </div>
            )}
            
            <Separator />
            <div className="flex justify-end space-x-2">
              {editingPlan?.id === plan.id ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingPlan(null)}
                    disabled={isUpdating}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSavePlan}
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => setEditingPlan(plan)}
                  disabled={isUpdating}
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Editar Plano
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {(!configurations || configurations.length === 0) && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Nenhum plano configurado encontrado.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlanConfigurationManager;
