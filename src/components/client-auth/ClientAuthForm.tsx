
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { usePhoneFormatter } from '@/hooks/usePhoneFormatter';

interface FormData {
  username: string;
  password: string;
  phone: string;
  email: string;
}

interface ClientAuthFormProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, password: string, phone: string, email: string) => Promise<void>;
  loading: boolean;
}

export const ClientAuthForm: React.FC<ClientAuthFormProps> = ({
  onLogin,
  onRegister,
  loading
}) => {
  const { toast } = useToast();
  const { formatPhoneNumber, extractPhoneNumbers, validatePhone } = usePhoneFormatter();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    phone: '',
    email: ''
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === 'phone') {
      // Format phone with mask for display
      const formattedPhone = formatPhoneNumber(value);
      setFormData(prev => ({
        ...prev,
        [field]: formattedPhone
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      toast({
        title: "Erro",
        description: "Nome de usuário é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!formData.password.trim()) {
      toast({
        title: "Erro",
        description: "Senha é obrigatória",
        variant: "destructive"
      });
      return;
    }

    await onLogin(formData.username, formData.password);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!formData.password.trim() || formData.password.length < 6) {
      toast({
        title: "Erro",
        description: "Senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    if (!formData.phone.trim()) {
      toast({
        title: "Erro",
        description: "Telefone é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!validatePhone(formData.phone)) {
      toast({
        title: "Erro",
        description: "Formato de telefone inválido. Use (XX) XXXXX-XXXX",
        variant: "destructive"
      });
      return;
    }

    // Extract only numbers from phone before sending to register
    const phoneNumbers = extractPhoneNumbers(formData.phone);
    await onRegister(formData.username, formData.password, phoneNumbers, formData.email);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-gray-900">
              {isRegistering ? 'Criar Conta' : 'Login do Cliente'}
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              {isRegistering ? 'Crie sua conta para agendar serviços' : 'Acesse sua conta para ver estabelecimentos disponíveis'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Nome {isRegistering ? 'Completo' : 'de Usuário'}</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={isRegistering ? "Digite seu nome completo" : "Digite seu nome de usuário"}
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
              </div>

              {isRegistering && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      maxLength={15}
                      required
                    />
                    <p className="text-sm text-gray-500">
                      Digite apenas números. Ex: 11999999999
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (opcional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                </>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
              >
                {loading ? 'Processando...' : (isRegistering ? 'Criar Conta' : 'Entrar')}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <p className="text-gray-600">
                {isRegistering ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
                <button
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  {isRegistering ? 'Fazer login' : 'Criar conta'}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
