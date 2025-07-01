
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Phone, Save } from "lucide-react";
import { formatPhone } from '@/utils/phoneFormatter';

const SuperAdminSupportSettings = () => {
  const { toast } = useToast();
  const [supportPhone, setSupportPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load existing support phone from localStorage
    const savedPhone = localStorage.getItem('superAdminSupportPhone');
    if (savedPhone) {
      setSupportPhone(savedPhone);
    }
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Save to localStorage for now - in production this would be saved to database
      localStorage.setItem('superAdminSupportPhone', supportPhone);
      
      toast({
        title: "Sucesso",
        description: "Telefone de suporte salvo com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar telefone de suporte",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setSupportPhone(formatted);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Phone className="h-5 w-5" />
          <span>Configurações de Suporte</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="supportPhone">Telefone de Suporte WhatsApp</Label>
          <Input
            id="supportPhone"
            type="tel"
            value={supportPhone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="(11) 99999-9999"
            maxLength={15}
          />
          <p className="text-sm text-gray-500">
            Este número será usado no botão de suporte flutuante dos administradores
          </p>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isLoading || !supportPhone.trim()}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SuperAdminSupportSettings;
