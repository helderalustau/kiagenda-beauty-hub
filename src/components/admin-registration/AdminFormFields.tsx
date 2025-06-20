
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, Shield, Eye, EyeOff } from "lucide-react";

interface AdminFormData {
  name: string;
  password: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'collaborator';
}

interface AdminFormFieldsProps {
  formData: AdminFormData;
  errors: Partial<AdminFormData>;
  showPassword: boolean;
  submitting: boolean;
  onInputChange: (field: keyof AdminFormData, value: string) => void;
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
  return (
    <div className="space-y-6">
      {/* Usuário */}
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Usuário *
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Digite o nome de usuário"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          className={errors.name ? 'border-red-500' : ''}
          disabled={submitting}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name}</p>
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
            onChange={(e) => onInputChange('password', e.target.value)}
            className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
            disabled={submitting}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={onTogglePassword}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password}</p>
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
          onChange={(e) => onInputChange('email', e.target.value)}
          className={errors.email ? 'border-red-500' : ''}
          disabled={submitting}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
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
          onChange={(e) => onInputChange('phone', e.target.value)}
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
          onValueChange={(value) => onInputChange('role', value as 'admin' | 'manager' | 'collaborator')}
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
    </div>
  );
};

export default AdminFormFields;
