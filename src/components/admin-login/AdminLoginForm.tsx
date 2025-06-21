
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminLoginFormProps {
  onSubmit: (formData: { username: string; password: string }) => void;
  loading: boolean;
  onCreateAccount: () => void;
}

export const AdminLoginForm = ({ onSubmit, loading, onCreateAccount }: AdminLoginFormProps) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-gray-900">Login da Loja</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Acesse sua conta de administrador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu nome de usuário"
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

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <p className="text-gray-600">
                Não tem uma conta?{' '}
                <button
                  onClick={onCreateAccount}
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  Criar conta de administrador
                </button>
              </p>
              
              <p className="text-sm text-gray-500">
                Esqueceu sua senha? Entre em contato com o suporte.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
