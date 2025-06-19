
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Category } from '@/hooks/useSupabaseData';

interface SuperAdminCreateSalonDialogProps {
  categories: Category[];
  onCreateSalon: (salonData: any, bannerFile: File | null) => Promise<void>;
  isSubmitting: boolean;
}

const SuperAdminCreateSalonDialog = ({ categories, onCreateSalon, isSubmitting }: SuperAdminCreateSalonDialogProps) => {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSalon, setNewSalon] = useState({
    name: '',
    owner_name: '',
    phone: '',
    address: '',
    plan: 'bronze' as 'bronze' | 'prata' | 'gold',
    category_id: ''
  });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const handleBannerSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de imagem",
          variant: "destructive"
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive"
        });
        return;
      }

      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    await onCreateSalon(newSalon, bannerFile);
    // Reset form and close dialog
    setShowCreateDialog(false);
    setNewSalon({
      name: '',
      owner_name: '',
      phone: '',
      address: '',
      plan: 'bronze',
      category_id: ''
    });
    setBannerFile(null);
    setBannerPreview(null);
  };

  const resetForm = () => {
    setShowCreateDialog(false);
    setNewSalon({
      name: '',
      owner_name: '',
      phone: '',
      address: '',
      plan: 'bronze',
      category_id: ''
    });
    setBannerFile(null);
    setBannerPreview(null);
  };

  return (
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600">
          <Plus className="h-4 w-4 mr-2" />
          Novo Estabelecimento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar Novo Estabelecimento</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo estabelecimento. Todos os campos marcados com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="salon-name">Nome do Estabelecimento *</Label>
            <Input
              id="salon-name"
              value={newSalon.name}
              onChange={(e) => setNewSalon({...newSalon, name: e.target.value})}
              placeholder="Nome do salão"
              className={!newSalon.name.trim() ? "border-red-300" : ""}
            />
          </div>
          
          <div>
            <Label htmlFor="category">Categoria *</Label>
            <Select 
              value={newSalon.category_id} 
              onValueChange={(value) => {
                console.log('Categoria selecionada:', value);
                setNewSalon({...newSalon, category_id: value});
              }}
            >
              <SelectTrigger className={!newSalon.category_id ? "border-red-300" : ""}>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    Carregando categorias...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {categories.length === 0 && (
              <p className="text-sm text-orange-600 mt-1">
                Carregando categorias... Se o problema persistir, verifique o banco de dados.
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="owner-name">Nome do Responsável *</Label>
            <Input
              id="owner-name"
              value={newSalon.owner_name}
              onChange={(e) => setNewSalon({...newSalon, owner_name: e.target.value})}
              placeholder="Nome do proprietário"
              className={!newSalon.owner_name.trim() ? "border-red-300" : ""}
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              value={newSalon.phone}
              onChange={(e) => setNewSalon({...newSalon, phone: e.target.value})}
              placeholder="(11) 99999-9999"
              className={!newSalon.phone.trim() ? "border-red-300" : ""}
            />
          </div>
          <div>
            <Label htmlFor="address">Endereço *</Label>
            <Input
              id="address"
              value={newSalon.address}
              onChange={(e) => setNewSalon({...newSalon, address: e.target.value})}
              placeholder="Endereço completo"
              className={!newSalon.address.trim() ? "border-red-300" : ""}
            />
          </div>
          
          {/* Upload de Banner */}
          <div>
            <Label htmlFor="banner-upload">Banner do Estabelecimento</Label>
            <Input
              id="banner-upload"
              type="file"
              accept="image/*"
              onChange={handleBannerSelect}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Opcional. Máximo 5MB. Se não fornecido, será usado um banner genérico.
            </p>
            
            {bannerPreview && (
              <div className="mt-2 relative rounded-lg overflow-hidden bg-gray-100 aspect-[2/1] max-w-xs">
                <img
                  src={bannerPreview}
                  alt="Preview do banner"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-2 mt-6">
          <Button 
            variant="outline" 
            onClick={resetForm}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || categories.length === 0}
            className="min-w-[120px]"
          >
            {isSubmitting ? "Criando..." : "Criar Estabelecimento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuperAdminCreateSalonDialog;
