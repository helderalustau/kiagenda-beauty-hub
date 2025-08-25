import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Lock, CheckCircle, AlertTriangle } from "lucide-react";
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { AdminLoginHeader } from '@/components/admin-login/AdminLoginHeader';

const AdminResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const { loading, updateAdminPassword } = usePasswordReset();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Verificar se há parâmetros de reset na URL
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    
    if (!token || type !== 'recovery') {
      setError('Link de recuperação inválido ou expirado');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    const token = searchParams.get('token');
    const result = await updateAdminPassword(newPassword, token || undefined);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/admin-login');
      }, 3000);
    } else {
      setError(result.message);
    }
  };

  const handleBackToLogin = () => {
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <AdminLoginHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                <Lock className="h-6 w-6" />
                Nova Senha
              </CardTitle>
              <p className="text-gray-600">
                Digite sua nova senha para o painel administrativo
              </p>
            </CardHeader>
            
            <CardContent>
              {!isSuccess ? (
                <>
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-red-700 text-sm">{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <PasswordInput
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Digite sua nova senha"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <PasswordInput
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme sua nova senha"
                        required
                        disabled={loading}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
                      disabled={loading}
                    >
                      {loading ? 'Atualizando...' : 'Atualizar Senha'}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Senha Atualizada!
                    </h3>
                    <p className="text-gray-600">
                      Sua senha foi atualizada com sucesso. Redirecionando para o login...
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={handleBackToLogin}
                  className="text-sm"
                >
                  Voltar para o Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminResetPassword;