
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Salon } from '@/types/supabase-entities';
import { Upload, Image, X, Save } from "lucide-react";

interface BannerUploadCardProps {
  salon: Salon;
  onUpdate: () => Promise<void>;
}

const BannerUploadCard = ({ salon, onUpdate }: BannerUploadCardProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(salon.banner_image_url || null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      // Upload para o Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${salon.id}/banner.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('salon-banners')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('salon-banners')
        .getPublicUrl(fileName);

      // Atualizar registro do salão
      const { error: updateError } = await supabase
        .from('salons')
        .update({
          banner_image_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', salon.id);

      if (updateError) throw updateError;

      toast({
        title: "✅ Banner atualizado!",
        description: "A imagem do banner foi carregada com sucesso."
      });

      onUpdate();
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao carregar a imagem.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBanner = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('salons')
        .update({
          banner_image_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', salon.id);

      if (error) throw error;

      toast({
        title: "Banner removido",
        description: "A imagem do banner foi removida com sucesso."
      });

      setPreviewUrl(null);
      setSelectedFile(null);
      onUpdate();
    } catch (error) {
      console.error('Error removing banner:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover o banner.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Image className="h-5 w-5 text-orange-600" />
        <h3 className="text-lg font-semibold">Banner Principal do Estabelecimento</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="banner-upload">Selecionar Nova Imagem</Label>
            <Input
              id="banner-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-2">
              Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB.
              <br />
              Dimensões recomendadas: 1200x400 pixels.
            </p>
          </div>

          {selectedFile && (
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Carregando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Fazer Upload
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(salon.banner_image_url || null);
                }}
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="space-y-4">
          <Label>Pré-visualização</Label>
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Banner do estabelecimento"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={handleRemoveBanner}
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500">
              <Upload className="h-12 w-12 mb-2" />
              <p className="text-sm">Nenhuma imagem selecionada</p>
              <p className="text-xs">Faça upload de uma imagem para o banner</p>
            </div>
          )}
        </div>
      </div>

      {/* Dicas */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Dicas para um banner atrativo:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use imagens de alta qualidade que representem seu estabelecimento</li>
          <li>• Evite texto muito pequeno na imagem</li>
          <li>• Mantenha o design limpo e profissional</li>
          <li>• Teste como fica em diferentes tamanhos de tela</li>
        </ul>
      </div>
    </div>
  );
};

export default BannerUploadCard;
