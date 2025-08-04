
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SalonAccountDeletion from './SalonAccountDeletion';

interface AdvancedSettingsCardProps {
  salon: any;
  onRefresh: () => Promise<void>;
}

const AdvancedSettingsCard = ({ salon, onRefresh }: AdvancedSettingsCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Configurações Avançadas
          </CardTitle>
          <p className="text-sm text-gray-600">
            Configurações que podem afetar o funcionamento do sistema. Use com cuidado.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seção de Exclusão de Conta */}
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Zona de Perigo
            </h3>
            <p className="text-sm text-red-600 mb-3">
              As ações abaixo são irreversíveis. Tenha certeza antes de continuar.
            </p>
            
            <Button
              onClick={() => setShowDeleteDialog(true)}
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Estabelecimento
            </Button>
          </div>

          {/* Informações Importantes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Informações Importantes</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Todos os dados são salvos automaticamente</li>
              <li>• O sistema mantém backups de segurança</li>
              <li>• Para suporte técnico, entre em contato via WhatsApp</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <SalonAccountDeletion
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        salon={salon}
      />
    </div>
  );
};

export default AdvancedSettingsCard;
