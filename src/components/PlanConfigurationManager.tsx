
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
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Planos</h1>
        <p className="text-gray-600">Configure os diferentes planos de assinatura</p>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-blue-600 mr-2" />
            <p className="text-sm text-blue-800">
              Alterações nos planos afetarão todos os estabelecimentos que utilizam esses planos.
            </p>
          </div>
        </div>
      </div>

      {configurations?.map(plan => (
        <Card key={plan.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <span>{plan.name}</span>
                <Badge variant="secondary">{plan.plan_type}</Badge>
              </CardTitle>
              <div>
                <Badge variant="outline">
                  {formatCurrency(Number(plan.price))} / mês
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Preço Mensal (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingPlan?.id === plan.id ? editingPlan.price : plan.price}
                  onChange={(e) => handleEditChange('price', parseFloat(e.target.value) || 0)}
                  disabled={editingPlan?.id !== plan.id || isUpdating}
                />
              </div>
              <div>
                <Label>Máximo de Atendentes</Label>
                <Input
                  type="number"
                  min="1"
                  value={editingPlan?.id === plan.id ? editingPlan.max_attendants : plan.max_attendants || 1}
                  onChange={(e) => handleEditChange('max_attendants', parseInt(e.target.value) || 1)}
                  disabled={editingPlan?.id !== plan.id || isUpdating}
                />
              </div>
              <div>
                <Label>Máximo de Agendamentos/Mês</Label>
                <Input
                  type="number"
                  min="1"
                  value={editingPlan?.id === plan.id ? editingPlan.max_appointments : plan.max_appointments || 50}
                  onChange={(e) => handleEditChange('max_appointments', parseInt(e.target.value) || 50)}
                  disabled={editingPlan?.id !== plan.id || isUpdating}
                />
              </div>
            </div>
            
            <div>
              <Label>Descrição</Label>
              <Input
                value={editingPlan?.id === plan.id ? editingPlan.description || '' : plan.description || ''}
                onChange={(e) => handleEditChange('description', e.target.value)}
                disabled={editingPlan?.id !== plan.id || isUpdating}
                placeholder="Descrição do plano..."
              />
            </div>
            
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
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isUpdating ? 'Salvando...' : 'Salavar'}
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => setEditingPlan(plan)}
                  disabled={isUpdating}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Editar
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
