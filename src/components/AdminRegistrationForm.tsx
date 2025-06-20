
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuthData } from '@/hooks/useAuthData';
import { Eye, EyeOff, User, Mail, Phone, Shield, Calendar } from "lucide-react";

interface AdminFormData {
  name: string;
  password: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'collaborator';
  setDateadm: string;
}

interface AdminRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AdminRegistrationForm = ({ 
  onSuccess, 
  onCancel
}: AdminRegistrationFormProps) => {
  const { toast } = useToast();
  const { registerAdmin, loading } = useAuthData();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<AdminFormData>({
    name: '',
    password: '',
    email: '',
    phone: '',
    role: 'admin',
    setDateadm: new Date().toISOString()
  });

  const [errors, setErrors] = useState<Partial<AdminFormData>>({});

  useEffect(() => {
    // Atualizar data sempre que o componente renderizar
    setFormData(prev => ({
      ...prev,
      setDateadm: new Date().toISOString()
    }));
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<AdminFormData> = {};

    // Validar nome
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validar senha
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido';
    }

    // Validar telefone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Telefone deve ter pelo menos 10 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const handleInputChange = (field: keyof AdminFormData, value: string) => {
    if (field === 'phone') {
      value = formatPhone(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
      setDateadm: new Date().toISOString() // Atualizar data sempre que houver mudança
    }));

    // Limpar erro do campo quando começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      console.log('Criando administrador sem estabelecimento inicial...');

      // Criar administrador sem estabelecimento - será vinculado após seleção de plano
      const result = await registerAdmin(
        null, // Sem salon_id inicial
        formData.name.trim(),
        formData.password,
        formData.email.trim(),
        formData.phone.replace(/\D/g, ''),
        formData.role
      );

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Administrador criado com sucesso! Redirecionando para seleção de plano..."
        });
        
        // Armazenar dados do administrador para uso posterior
        localStorage.setItem('pendingAdminData', JSON.stringify({
          ...result.admin,
          createdAt: new Date().toISOString()
        }));
        
        // Reset form
        setFormData({
          name: '',
          password: '',
          email: '',
          phone: '',
          role: 'admin',
          setDateadm: new Date().toISOString()
        });
        
        // Redirecionar para seleção de plano
        setTimeout(() => {
          window.location.href = '/plan-selection';
        }, 2000);
        
        onSuccess?.();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Erro ao criar administrador:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar administrador",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getCurrentDateTime = () => {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date());
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Criar Novo Administrador
        </CardTitle>
        <CardDescription>
          Preencha os dados do novo administrador. Após a criação, você será direcionado para seleção de plano e configuração do estabelecimento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Data de Criação (Read-only) */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <Label className="text-sm font-medium text-gray-600">
                Data de Criação
              </Label>
            </div>
            <p className="text-sm text-gray-800 font-mono">
              {getCurrentDateTime()}
            </p>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nome Completo *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Digite o nome completo"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
              disabled={submitting}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'border-red-500' : ''}
              disabled={submitting}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Senha *
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                disabled={submitting}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Telefone *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={errors.phone ? 'border-red-500' : ''}
              disabled={submitting}
              maxLength={15}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Função/Cargo */}
          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Função/Cargo
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value as 'admin' | 'manager' | 'collaborator')}
              disabled={submitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="manager">Gerente</SelectItem>
                <SelectItem value="collaborator">Colaborador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitting}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={submitting || loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600"
            >
              {submitting ? "Criando..." : "Criar Administrador"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminRegistrationForm;
