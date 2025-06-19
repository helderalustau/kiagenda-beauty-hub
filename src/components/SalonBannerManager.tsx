
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Image as ImageIcon, Camera } from "lucide-react";
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
        title: "Sucesso",
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

  const getDefaultBanner = () => {
    return `https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=400&fit=crop&crop=center`;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="h-5 w-5" />
          <span>Banner do Estabelecimento</span>
        </CardTitle>
        <CardDescription>
          Gerencie a imagem que aparece como banner para os clientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview da imagem atual */}
        <div>
          <Label className="text-sm font-medium">Banner Atual</Label>
          <div className="mt-2 relative rounded-lg overflow-hidden bg-gray-100 aspect-[2/1]">
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
                  <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Banner Genérico</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview da nova imagem */}
        {previewUrl && (
          <div>
            <Label className="text-sm font-medium">Prévia da Nova Imagem</Label>
            <div className="mt-2 relative rounded-lg overflow-hidden bg-gray-100 aspect-[2/1]">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Upload de nova imagem */}
        <div className="space-y-2">
          <Label htmlFor="banner-upload" className="text-sm font-medium">
            Carregar Nova Imagem
          </Label>
          <Input
            id="banner-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            ref={fileInputRef}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500">
            Formatos aceitos: JPG, PNG, WebP. Tamanho máximo: 5MB
          </p>
        </div>

        {previewUrl && (
          <div className="flex space-x-2">
            <Button onClick={handleUpload} disabled={uploading}>
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
              onClick={() => {
                setPreviewUrl(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
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
