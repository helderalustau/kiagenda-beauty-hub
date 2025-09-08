
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, User, Mail, Phone, Crown, Zap, Star } from "lucide-react";

interface AdminFormFieldsProps {
  formData: {
    name: string;
    password: string;
    email: string;
    phone: string;
    role: string;
    selectedPlan: string;
  };
  errors: Record<string, string>;
  showPassword: boolean;
  submitting: boolean;
  availablePlans: Array<{
    id: string;
    name: string;
    plan_type: string;
    price: string;
  }>;
  onInputChange: (field: string, value: string) => void;
  onTogglePassword: () => void;
}

const AdminFormFields = ({
  formData,
  errors,
  showPassword,
  submitting,
  availablePlans,
  onInputChange,
  onTogglePassword
}: AdminFormFieldsProps) => {
  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'bronze': return <Star className="h-4 w-4" />;
      case 'prata': return <Zap className="h-4 w-4" />;
      case 'gold': return <Crown className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'bronze': return 'text-amber-600';
      case 'prata': return 'text-gray-600';
      case 'gold': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Seleção de Plano */}
      <div className="space-y-2">
        <Label htmlFor="plan-select" className="flex items-center gap-2 text-sm font-medium">
          <Crown className="h-4 w-4 text-blue-600" />
          Selecionar Plano *
        </Label>
        <Select
          value={formData.selectedPlan}
          onValueChange={(value) => onInputChange('selectedPlan', value)}
          disabled={submitting}
        >
          <SelectTrigger className="focus:border-blue-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
            {availablePlans.map((plan) => (
              <SelectItem key={plan.plan_type} value={plan.plan_type}>
                <div className="flex items-center gap-3">
                  <span className={getPlanColor(plan.plan_type)}>
                    {getPlanIcon(plan.plan_type)}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium">{plan.name}</span>
                    <span className="text-xs text-gray-500">{plan.price}</span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Escolha o plano ideal para o estabelecimento
        </p>
      </div>

      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
          <User className="h-4 w-4 text-blue-600" />
          Login *
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Login"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          disabled={submitting}
          className={`focus:border-blue-500 ${errors.name ? 'border-red-500' : ''}`}
        />
        {errors.name && (
          <p className="text-red-500 text-xs">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
          <Mail className="h-4 w-4 text-blue-600" />
          Email *
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@exemplo.com"
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          disabled={submitting}
          className={`focus:border-blue-500 ${errors.email ? 'border-red-500' : ''}`}
        />
        {errors.email && (
          <p className="text-red-500 text-xs">{errors.email}</p>
        )}
      </div>

      {/* Telefone */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
          <Phone className="h-4 w-4 text-blue-600" />
          Telefone *
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(11) 99999-9999"
          value={formData.phone}
          onChange={(e) => onInputChange('phone', e.target.value)}
          disabled={submitting}
          className={`focus:border-blue-500 ${errors.phone ? 'border-red-500' : ''}`}
        />
        {errors.phone && (
          <p className="text-red-500 text-xs">{errors.phone}</p>
        )}
      </div>

      {/* Senha */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Senha *
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Digite uma senha segura"
            value={formData.password}
            onChange={(e) => onInputChange('password', e.target.value)}
            disabled={submitting}
            className={`focus:border-blue-500 pr-12 ${errors.password ? 'border-red-500' : ''}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={onTogglePassword}
            disabled={submitting}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs">{errors.password}</p>
        )}
      </div>
    </div>
  );
};

export default AdminFormFields;
