
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, ExternalLink, Instagram } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SalonLinkManagerProps {
  salon: {
    id: string;
    name: string;
    unique_slug?: string;
  };
}

const SalonLinkManager = ({ salon }: SalonLinkManagerProps) => {
  const { toast } = useToast();

  const salonLink = salon.unique_slug 
    ? `${window.location.origin}/salon/${salon.unique_slug}`
    : '';

  const copyToClipboard = async () => {
    if (!salonLink) return;
    
    try {
      await navigator.clipboard.writeText(salonLink);
      toast({
        title: "Link copiado!",
        description: "O link do seu estabelecimento foi copiado para a área de transferência."
      });
    } catch (err) {
      console.error('Erro ao copiar link:', err);
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link. Tente selecionar e copiar manualmente.",
        variant: "destructive"
      });
    }
  };

  const openLink = () => {
    if (salonLink) {
      window.open(salonLink, '_blank');
    }
  };

  if (!salon.unique_slug) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ExternalLink className="h-5 w-5" />
            <span>Link do Estabelecimento</span>
          </CardTitle>
          <CardDescription>
            Gerando link único para seu estabelecimento...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            O link único do seu estabelecimento está sendo gerado. Atualize a página em alguns segundos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ExternalLink className="h-5 w-5" />
          <span>Link do Estabelecimento</span>
        </CardTitle>
        <CardDescription>
          Compartilhe este link para que seus clientes acessem diretamente seu estabelecimento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="salon-link">Link único do estabelecimento</Label>
          <div className="flex space-x-2 mt-2">
            <Input
              id="salon-link"
              value={salonLink}
              readOnly
              className="flex-1"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="icon"
              title="Copiar link"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              onClick={openLink}
              variant="outline"
              size="icon"
              title="Abrir link"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <Instagram className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                Dica para Instagram
              </h4>
              <p className="text-blue-800 text-sm mb-2">
                Cole este link na sua bio do Instagram para que seus seguidores possam agendar diretamente!
              </p>
              <p className="text-blue-700 text-xs">
                Quando alguém clicar no link, será direcionado para uma página personalizada do seu estabelecimento onde poderá fazer login ou se cadastrar e agendar automaticamente.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">
            Como funciona?
          </h4>
          <ul className="text-green-800 text-sm space-y-1">
            <li>• Clientes clicam no link e veem as informações do seu estabelecimento</li>
            <li>• Podem fazer login ou se cadastrar diretamente na página</li>
            <li>• Após o login/cadastro, são direcionados automaticamente para agendar com você</li>
            <li>• O link é único e permanente para seu estabelecimento</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalonLinkManager;
