
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuthData } from '@/hooks/useAuthData';
import { Eye, EyeOff, User, Mail, Phone, Building, Shield, Calendar, Camera, MapPin } from "lucide-react";

interface AdminSignupData {
  salon_id: string;
  name: string;
  password: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'collaborator';
  avatar_url?: string;
}

interface AdminSignupFormProps {
  onSuccess?: (adminData: any) => void;
  onCancel?: () => void;
}

const AdminSignupForm = ({ onSuccess, onCancel }: AdminSignupFormProps) => {
  const { toast } = useToast();
  const { salons, fetchAllSalons, categories, fetchCategories } = useSupabaseData();
  const { registerAdmin, loading } = useAuthData();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<AdminSignupData>({
    salon_id: '',
    name: '',
    password: '',
    email: '',
    phone: '',
    role: 'admin',
    avatar_url: ''
  });

  const [errors, setErrors] = useState<Partial<AdminSignupData>>({});

  useEffect(() => {
    fetchAllSalons();
    fetchCategories();
  }, [fetchAllSalons, fetchCategories]);

  const validateForm = (): boolean => {
    const newErrors: Partial<AdminSignupData> = {};

    // Validar nome
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido';
    }

    // Validar senha
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validar telefone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Telefone deve ter pelo menos 10 dígitos';
    }

    // Validar estabelecimento
    if (!formData.salon_id) {
      newErrors.salon_id = 'Estabelecimento é obrigatório';
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

  const handleInputChange = (field: keyof AdminSignupData, value: string) => {
    if (field === 'phone') {
      value = formatPhone(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
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
      console.log('Criando conta de administrador com dados:', formData);

      const result = await registerAdmin(
        formData.salon_id,
        formData.name.trim(),
        formData.password,
        formData.email.trim(),
        formData.phone.replace(/\D/g, ''),
        formData.role
      );

      if (result.success) {
        toast({
          title: "Conta Criada com Sucesso!",
          description: "Sua conta de administrador foi criada. Você pode fazer login agora."
        });
        
        // Limpar formulário
        setFormData({
          salon_id: '',
          name: '',
          password: '',
          email: '',
          phone: '',
          role: 'admin',
          avatar_url: ''
        });
        
        onSuccess?.(result.admin);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar conta de administrador",
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

  const getSalonInfo = (salonId: string) => {
    const salon = salons.find(s => s.id === salonId);
    if (!salon) return null;
    
    const category = categories.find(c => c.id === salon.category_id);
    return {
      ...salon,
      categoryName: category?.name || 'Categoria não encontrada'
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto bg-gradient-to-r from-blue-600 to-pink-500 p-3 rounded-full w-16 h-16 flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
              Criar Conta Administrativa
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Complete o cadastro para acessar o painel administrativo
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Data de Criação (Automática) */}
            <div className="bg-gradient-to-r from-blue-50 to-pink-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <Label className="text-sm font-semibold text-blue-800">
                  Data de Criação da Conta
                </Label>
              </div>
              <p className="text-blue-700 font-mono text-sm bg-white/60 px-3 py-2 rounded-lg">
                {getCurrentDateTime()}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Nome Completo */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4 text-blue-600" />
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`transition-all ${errors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                  disabled={submitting}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span className="h-1 w-1 bg-red-500 rounded-full"></span>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4 text-blue-600" />
                  Email Profissional *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`transition-all ${errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                  disabled={submitting}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span className="h-1 w-1 bg-red-500 rounded-full"></span>
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="h-4 w-4 text-blue-600" />
                  Senha de Acesso *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pr-10 transition-all ${errors.password ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                    disabled={submitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span className="h-1 w-1 bg-red-500 rounded-full"></span>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                  <Phone className="h-4 w-4 text-blue-600" />
                  Telefone de Contato *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`transition-all ${errors.phone ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                  disabled={submitting}
                  maxLength={15}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <span className="h-1 w-1 bg-red-500 rounded-full"></span>
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Estabelecimento */}
            <div className="space-y-2">
              <Label htmlFor="salon" className="flex items-center gap-2 text-sm font-medium">
                <Building className="h-4 w-4 text-blue-600" />
                Estabelecimento *
              </Label>
              <Select
                value={formData.salon_id}
                onValueChange={(value) => handleInputChange('salon_id', value)}
                disabled={submitting}
              >
                <SelectTrigger className={`transition-all ${errors.salon_id ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}>
                  <SelectValue placeholder="Selecione seu estabelecimento" />
                </SelectTrigger>
                <SelectContent>
                  {salons.map((salon) => {
                    const salonInfo = getSalonInfo(salon.id);
                    return (
                      <SelectItem key={salon.id} value={salon.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{salon.name}</span>
                          <span className="text-xs text-gray-500">
                            {salonInfo?.categoryName} • {salon.city || 'Localização não informada'}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.salon_id && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="h-1 w-1 bg-red-500 rounded-full"></span>
                  {errors.salon_id}
                </p>
              )}
            </div>

            {/* Função/Cargo */}
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2 text-sm font-medium">
                <Shield className="h-4 w-4 text-blue-600" />
                Função/Cargo no Estabelecimento
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange('role', value as 'admin' | 'manager' | 'collaborator')}
                disabled={submitting}
              >
                <SelectTrigger className="focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex flex-col">
                      <span className="font-medium">Administrador</span>
                      <span className="text-xs text-gray-500">Acesso completo ao sistema</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="manager">
                    <div className="flex flex-col">
                      <span className="font-medium">Gerente</span>
                      <span className="text-xs text-gray-500">Gerenciamento operacional</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="collaborator">
                    <div className="flex flex-col">
                      <span className="font-medium">Colaborador</span>
                      <span className="text-xs text-gray-500">Acesso básico ao sistema</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Avatar URL (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="avatar" className="flex items-center gap-2 text-sm font-medium">
                <Camera className="h-4 w-4 text-blue-600" />
                URL da Foto de Perfil (Opcional)
              </Label>
              <Input
                id="avatar"
                type="url"
                placeholder="https://exemplo.com/sua-foto.jpg"
                value={formData.avatar_url || ''}
                onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                className="focus:border-blue-500"
                disabled={submitting}
              />
              <p className="text-xs text-gray-500">
                Adicione o link de uma foto para personalizar seu perfil
              </p>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-4 pt-6">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={submitting}
                  className="flex-1 border-gray-300 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                disabled={submitting || loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 text-white font-medium py-3"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Criando Conta...
                  </div>
                ) : (
                  "Criar Conta Administrativa"
                )}
              </Button>
            </div>
          </form>

          {/* Informações Adicionais */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Informações da Conta
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Sua conta será vinculada ao estabelecimento selecionado</li>
              <li>• Você receberá acesso completo ao painel administrativo</li>
              <li>• A data de criação será registrada automaticamente</li>
              <li>• Todos os dados são protegidos e criptografados</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSignupForm;
