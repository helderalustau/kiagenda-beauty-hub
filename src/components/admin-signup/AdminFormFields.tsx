
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, Shield, Camera, Eye, EyeOff } from "lucide-react";
import { AdminSignupData } from '@/utils/adminFormValidation';
import { usePhoneValidation } from '@/hooks/usePhoneValidation';

interface AdminFormFieldsProps {
  formData: AdminSignupData;
  errors: Partial<AdminSignupData>;
  showPassword: boolean;
  submitting: boolean;
  onInputChange: (field: keyof AdminSignupData, value: string) => void;
  onTogglePassword: () => void;
}

const AdminFormFields = ({
  formData,
  errors,
  showPassword,
  submitting,
  onInputChange,
  onTogglePassword
}: AdminFormFieldsProps) => {
  const { formatPhone } = usePhoneValidation();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhone(e.target.value);
    onInputChange('phone', formattedPhone);
  };

  return (
    <>
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
            onChange={(e) => onInputChange('name', e.target.value)}
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
            onChange={(e) => onInputChange('email', e.target.value)}
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
              onChange={(e) => onInputChange('password', e.target.value)}
              className={`pr-10 transition-all ${errors.password ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
              disabled={submitting}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={onTogglePassword}
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
            onChange={handlePhoneChange}
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

      {/* Função/Cargo */}
      <div className="space-y-2">
        <Label htmlFor="role" className="flex items-center gap-2 text-sm font-medium">
          <Shield className="h-4 w-4 text-blue-600" />
          Função/Cargo no Negócio
        </Label>
        <Select
          value={formData.role}
          onValueChange={(value) => onInputChange('role', value as 'admin' | 'manager' | 'collaborator')}
          disabled={submitting}
        >
          <SelectTrigger className="focus:border-blue-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
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
          onChange={(e) => onInputChange('avatar_url', e.target.value)}
          className="focus:border-blue-500"
          disabled={submitting}
        />
        <p className="text-xs text-gray-500">
          Adicione o link de uma foto para personalizar seu perfil
        </p>
      </div>
    </>
  );
};

export default AdminFormFields;
