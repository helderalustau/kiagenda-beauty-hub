
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Phone, Calendar, Crown } from "lucide-react";
import { Salon, Category } from '@/hooks/useSupabaseData';

interface SalonListProps {
  salons: Salon[];
  categories: Category[];
  onBookService: (salon: Salon) => void;
}

const SalonList = ({ salons, categories, onBookService }: SalonListProps) => {
  const [filteredSalons, setFilteredSalons] = useState<Salon[]>(salons);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    let filtered = salons;

    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(salon => salon.category_id === selectedCategory);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(salon =>
        salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salon.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salon.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSalons(filtered);
  }, [salons, searchTerm, selectedCategory]);

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'bronze': return 'bg-amber-100 text-amber-800';
      case 'prata': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'bronze': return 'Bronze';
      case 'prata': return 'Prata';
      case 'gold': return 'Gold';
      default: return 'Bronze';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Estabelecimentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, endereço ou proprietário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            {filteredSalons.length} estabelecimento(s) encontrado(s)
          </div>
        </CardContent>
      </Card>

      {/* Lista de estabelecimentos */}
      <div className="grid gap-6">
        {filteredSalons.map((salon) => (
          <Card key={salon.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{salon.name}</CardTitle>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">
                      {salon.category?.name || 'Categoria não definida'}
                    </Badge>
                    <Badge className={`${getPlanColor(salon.plan)} flex items-center`}>
                      <Crown className="h-3 w-3 mr-1" />
                      {getPlanName(salon.plan)}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    salon.is_open 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {salon.is_open ? 'Aberto' : 'Fechado'}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">{salon.address}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="text-sm">{salon.phone}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Responsável:</strong> {salon.owner_name}
                  </p>
                  {salon.contact_phone && (
                    <p className="text-sm text-gray-600">
                      <strong>Contato:</strong> {salon.contact_phone}
                    </p>
                  )}
                </div>
              </div>
              
              {salon.banner_image_url && (
                <div className="rounded-lg overflow-hidden bg-gray-100 aspect-[2/1]">
                  <img
                    src={salon.banner_image_url}
                    alt={`Banner do ${salon.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => onBookService(salon)}
                  disabled={!salon.is_open}
                  className="bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {salon.is_open ? 'Agendar Serviço' : 'Fechado'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredSalons.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">
                Nenhum estabelecimento encontrado com os filtros aplicados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SalonList;
