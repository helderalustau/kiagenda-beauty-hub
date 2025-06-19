
import React, { useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Category } from '@/hooks/useSupabaseData';

interface FormData {
  salon_name: string;
  category_id: string;
  street_number: string;
  city: string;
  state: string;
  contact_phone: string;
  opening_hours: any;
}

interface BasicSalonInfoStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  categories: Category[];
}

const BasicSalonInfoStep = ({ formData, updateFormData, categories }: BasicSalonInfoStepProps) => {
  const selectedCategory = categories.find(cat => cat.id === formData.category_id);

  // Auto-select first category if none is selected and categories are available
  useEffect(() => {
    if (!formData.category_id && categories.length > 0) {
      console.log('Auto-selecting first available category:', categories[0].id);
      updateFormData({ category_id: categories[0].id });
    }
  }, [categories, formData.category_id, updateFormData]);

  return (
    <div className="space-y-4">
      <div className="text-center py-4 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Informações do Estabelecimento
        </h3>
        <p className="text-gray-600">
          Agora vamos definir o nome e categoria do seu estabelecimento.
        </p>
      </div>

      <div>
        <Label htmlFor="salon_name">Nome do Estabelecimento *</Label>
        <Input
          id="salon_name"
          value={formData.salon_name}
          onChange={(e) => updateFormData({ salon_name: e.target.value })}
          placeholder="Digite o nome do seu estabelecimento"
          className={!formData.salon_name?.trim() ? "border-red-300" : ""}
        />
      </div>

      <div>
        <Label>Categoria *</Label>
        <Select
          value={formData.category_id}
          onValueChange={(value) => {
            console.log('Categoria selecionada:', value);
            updateFormData({ category_id: value });
          }}
          disabled={categories.length === 0}
        >
          <SelectTrigger className={!formData.category_id ? "border-red-300" : ""}>
            <SelectValue placeholder={categories.length === 0 ? "Carregando categorias..." : "Selecione a categoria..."} />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
            {categories.length === 0 ? (
              <div className="p-2 text-sm text-gray-500 text-center">
                Carregando categorias...
              </div>
            ) : (
              categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {categories.length === 0 && (
          <p className="text-sm text-orange-600 mt-1">
            Carregando categorias... Se o problema persistir, verifique o banco de dados.
          </p>
        )}
        {selectedCategory && (
          <p className="text-sm text-green-600 mt-1">
            Categoria selecionada: {selectedCategory.name}
          </p>
        )}
      </div>
    </div>
  );
};

export default BasicSalonInfoStep;
