import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useSalonData } from '@/hooks/useSalonData';
import { Salon } from '@/types/supabase-entities';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SalonAccountDeletionProps {
  salon: Salon;
}

const SalonAccountDeletion = ({ salon }: SalonAccountDeletionProps) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);
  const { deleteSalon } = useSalonData();
  const { toast } = useToast();
  const navigate = useNavigate();

  const expectedText = `EXCLUIR ${salon.name.toUpperCase()}`;
  const isConfirmationValid = confirmationText === expectedText;

  const handleDeleteSalon = async () => {
    if (!isConfirmationValid) {
      toast({
        title: "Erro de Confirmação",
        description: "Texto de confirmação não confere",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const result = await deleteSalon(salon.id);
      
      if (result.success) {
        toast({
          title: "Conta Excluída",
          description: "Estabelecimento excluído com sucesso"
        });
        
        // Redirecionar para página inicial
        navigate('/');
      } else {
        toast({
          title: "Erro na Exclusão",
          description: result.message || "Erro ao excluir estabelecimento",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting salon:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao excluir estabelecimento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-destructive bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span>Zona de Perigo</span>
        </CardTitle>
        <CardDescription>
          Ações irreversíveis que afetam permanentemente sua conta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h4 className="font-semibold text-destructive mb-2">Excluir Estabelecimento</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Esta ação irá excluir permanentemente:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 mb-4">
            <li>• Todos os dados do estabelecimento</li>
            <li>• Histórico de agendamentos</li>
            <li>• Configurações e usuários</li>
            <li>• Serviços cadastrados</li>
            <li>• Banners e imagens</li>
          </ul>
          <p className="text-sm font-medium text-destructive">
            ⚠️ Esta ação não pode ser desfeita!
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Estabelecimento
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center space-x-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <span>Confirmar Exclusão</span>
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p>
                  Você está prestes a excluir permanentemente o estabelecimento 
                  <strong className="text-foreground"> {salon.name}</strong>.
                </p>
                <p className="text-destructive font-medium">
                  Esta ação não pode ser desfeita e todos os dados serão perdidos permanentemente.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="confirmation">
                    Para confirmar, digite: <code className="bg-muted px-1 rounded text-xs">{expectedText}</code>
                  </Label>
                  <Input
                    id="confirmation"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder={expectedText}
                    className="font-mono"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSalon}
                disabled={!isConfirmationValid || loading}
                className="bg-destructive hover:bg-destructive/90"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Permanentemente
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default SalonAccountDeletion;