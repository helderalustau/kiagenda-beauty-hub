
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Image as ImageIcon, Camera, X } from "lucide-react";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";

interface SalonBannerManagerProps {
  salonId: string;
  currentBannerUrl?: string | null;
  onBannerUpdate: () => void;
}

const SalonBannerManager = ({ salonId, currentBannerUrl, onBannerUpdate }: SalonBannerManagerProps) => {
  const { uploadSalonBanner } = useSupabaseData();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de imagem",
          variant: "destructive"
        });
        return;
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive"
        });
        return;
      }

      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast({
        title: "Erro",
        description: "Selecione uma imagem primeiro",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    const result = await uploadSalonBanner(file, salonId);
    
    if (result.success) {
      toast({
        title: "✅ Sucesso!",
        description: "Banner atualizado com sucesso!"
      });
      setPreviewUrl(null);
      onBannerUpdate();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
    
    setUploading(false);
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getDefaultBanner = () => {
    return `https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=400&fit=crop&crop=center`;
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-800">
          <Camera className="h-6 w-6 text-blue-600" />
          <span>Banner do Estabelecimento</span>
        </CardTitle>
        <CardDescription className="text-gray-600">
          Carregue uma imagem atrativa que será exibida para os clientes na lista de estabelecimentos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview da imagem atual */}
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-3 block">Banner Atual</Label>
          <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-[2/1] shadow-md">
            <img
              src={currentBannerUrl || getDefaultBanner()}
              alt="Banner do estabelecimento"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getDefaultBanner();
              }}
            />
            {!currentBannerUrl && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-white text-center">
                  <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-80" />
                  <p className="text-lg font-medium">Banner Genérico</p>
                  <p className="text-sm opacity-80">Carregue sua própria imagem</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview da nova imagem */}
        {previewUrl && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-semibold text-gray-700">Prévia da Nova Imagem</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearPreview}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-[2/1] shadow-md border-2 border-blue-200">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Upload de nova imagem */}
        <div className="space-y-4">
          <Label htmlFor="banner-upload" className="text-sm font-semibold text-gray-700">
            Carregar Nova Imagem
          </Label>
          <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 bg-blue-50/50 hover:bg-blue-50 transition-colors">
            <Input
              id="banner-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              ref={fileInputRef}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 border-0 bg-transparent"
            />
            <div className="mt-2 text-center">
              <Upload className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <p className="text-sm text-gray-600">
                <span className="font-medium">Clique para carregar</span> ou arraste e solte
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, WEBP até 5MB • Recomendado: 800x400px
              </p>
            </div>
          </div>
        </div>

        {previewUrl && (
          <div className="flex space-x-3 pt-2">
            <Button 
              onClick={handleUpload} 
              disabled={uploading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Atualizar Banner
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={clearPreview}
              className="px-6"
            >
              Cancelar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalonBannerManager;
