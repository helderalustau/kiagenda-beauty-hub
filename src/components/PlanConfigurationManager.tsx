import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Save, Plus, Trash2 } from "lucide-react";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";

const PlanConfigurationManager = () => {
  const { planConfigurations, fetchPlanConfigurations, updatePlanConfiguration } = useSupabaseData();
  const { toast } = useToast();
  const [editingPlan, setEditingPlan] = useState<any>(null);

  useEffect(() => {
    fetchPlanConfigurations();
  }, []);

  const handleSavePlan = async () => {
    if (!editingPlan) return;

    const result = await updatePlanConfiguration({
      planData: editingPlan
    });

    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Configuração do plano atualizada com sucesso!"
      });
      setEditingPlan(null);
      fetchPlanConfigurations();
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Planos</h1>
        <p className="text-gray-600">Configure os diferentes planos de assinatura</p>
      </div>

      {planConfigurations?.map(plan => (
        <Card key={plan.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{plan.name}</CardTitle>
              <div>
                <Badge variant="secondary">{plan.price} / mês</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Máximo de Atendentes</Label>
                <Input
                  type="number"
                  value={editingPlan?.id === plan.id ? editingPlan.max_attendants : plan.max_attendants}
                  onChange={(e) => setEditingPlan({ ...plan, max_attendants: parseInt(e.target.value) })}
                  disabled={editingPlan?.id !== plan.id}
                />
              </div>
              <div>
                <Label>Máximo de Agendamentos</Label>
                <Input
                  type="number"
                  value={editingPlan?.id === plan.id ? editingPlan.max_appointments : plan.max_appointments}
                  onChange={(e) => setEditingPlan({ ...plan, max_appointments: parseInt(e.target.value) })}
                  disabled={editingPlan?.id !== plan.id}
                />
              </div>
            </div>
            <Separator />
            <div className="flex justify-end space-x-2">
              {editingPlan?.id === plan.id ? (
                <>
                  <Button variant="outline" onClick={() => setEditingPlan(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSavePlan}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setEditingPlan(plan)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Novo Plano</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">Em breve...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanConfigurationManager;
