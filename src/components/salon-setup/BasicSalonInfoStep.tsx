
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
  setFormData: (updates: Partial<FormData>) => void;
  categories: Category[];
}

const BasicSalonInfoStep = ({ formData, setFormData, categories }: BasicSalonInfoStepProps) => {
  const [categoryComboboxOpen, setCategoryComboboxOpen] = React.useState(false);
  const selectedCategory = categories.find(cat => cat.id === formData.category_id);

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
          onChange={(e) => setFormData({ salon_name: e.target.value })}
          placeholder="Digite o nome do seu estabelecimento"
          className={!formData.salon_name?.trim() ? "border-red-300" : ""}
        />
      </div>

      <div>
        <Label>Categoria *</Label>
        <Popover open={categoryComboboxOpen} onOpenChange={setCategoryComboboxOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={categoryComboboxOpen}
              className={cn(
                "w-full justify-between",
                !formData.category_id && "text-muted-foreground border-red-300"
              )}
            >
              {selectedCategory ? selectedCategory.name : "Selecione a categoria..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar categoria..." />
              <CommandList>
                <CommandEmpty>
                  {categories.length === 0 ? "Carregando categorias..." : "Nenhuma categoria encontrada."}
                </CommandEmpty>
                <CommandGroup>
                  {categories.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.name}
                      onSelect={() => {
                        console.log('Categoria selecionada:', category.id, category.name);
                        setFormData({ category_id: category.id });
                        setCategoryComboboxOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          formData.category_id === category.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {category.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {categories.length === 0 && (
          <p className="text-sm text-orange-600 mt-1">
            Carregando categorias... Se o problema persistir, verifique o banco de dados.
          </p>
        )}
      </div>
    </div>
  );
};

export default BasicSalonInfoStep;
