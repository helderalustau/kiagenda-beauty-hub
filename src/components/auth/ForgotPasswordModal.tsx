import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import { usePasswordReset } from '@/hooks/usePasswordReset';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'admin' | 'client';
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  userType
}) => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const { loading, sendAdminPasswordReset, sendClientPasswordReset } = usePasswordReset();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      return;
    }

    let result;
    if (userType === 'admin') {
      result = await sendAdminPasswordReset(email);
    } else {
      result = await sendClientPasswordReset(email);
    }

    if (result.success) {
      setEmailSent(true);
    }
  };

  const handleClose = () => {
    setEmail('');
    setEmailSent(false);
    onClose();
  };

  const title = userType === 'admin' ? 'Recuperar Senha - Administrador' : 'Recuperar Senha - Cliente';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold text-gray-800">
            {title}
          </DialogTitle>
        </DialogHeader>

        {!emailSent ? (
          <div className="space-y-6">
            <div className="text-center text-gray-600">
              <p>
                Digite seu e-mail cadastrado e enviaremos um link para recuperação da senha.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading || !email}
                >
                  {loading ? 'Enviando...' : 'Enviar Link'}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">
                E-mail Enviado!
              </h3>
              <p className="text-gray-600">
                Enviamos um link de recuperação para <strong>{email}</strong>.
                Verifique sua caixa de entrada e spam.
              </p>
            </div>

            <Button onClick={handleClose} className="w-full">
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};