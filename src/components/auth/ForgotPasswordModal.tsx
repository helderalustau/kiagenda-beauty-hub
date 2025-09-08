import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, ArrowLeft, CheckCircle } from "lucide-react";
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
  const [phone, setPhone] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [activeTab, setActiveTab] = useState('email');
  
  const { 
    loading, 
    sendAdminPasswordResetEmail, 
    sendAdminPasswordResetSMS,
    sendClientPasswordResetEmail,
    sendClientPasswordResetSMS
  } = usePasswordReset();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      return;
    }

    let result;
    if (userType === 'admin') {
      result = await sendAdminPasswordResetEmail(email);
    } else {
      result = await sendClientPasswordResetEmail(email);
    }

    if (result.success) {
      setMessageSent(true);
    }
  };

  const handleSMSSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || phone.length < 10) {
      return;
    }

    let result;
    if (userType === 'admin') {
      result = await sendAdminPasswordResetSMS(phone);
    } else {
      result = await sendClientPasswordResetSMS(phone);
    }

    if (result.success) {
      setMessageSent(true);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPhone('');
    setMessageSent(false);
    setActiveTab('email');
    onClose();
  };

  const title = userType === 'admin' ? 'Recuperar Senha - Administrador' : 'Recuperar Senha - Cliente';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>

        {!messageSent ? (
          <div className="space-y-6">
            <div className="text-center text-muted-foreground">
              <p>
                Escolha como deseja recuperar sua senha:
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="sms" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  SMS
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                <div className="text-sm text-muted-foreground text-center">
                  Enviaremos um link de recuperação para seu e-mail cadastrado.
                </div>
                
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
              </TabsContent>

              <TabsContent value="sms" className="space-y-4">
                <div className="text-sm text-muted-foreground text-center">
                  Enviaremos um código de verificação para seu telefone cadastrado.
                </div>
                
                <form onSubmit={handleSMSSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(11) 99999-9999"
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
                      disabled={loading || !phone}
                    >
                      {loading ? 'Enviando...' : 'Enviar Código'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                {activeTab === 'email' ? 'E-mail Enviado!' : 'SMS Enviado!'}
              </h3>
              <p className="text-muted-foreground">
                {activeTab === 'email' 
                  ? `Enviamos um link de recuperação para ${email}. Verifique sua caixa de entrada e spam.`
                  : `Enviamos um código de verificação para ${phone}. Verifique suas mensagens.`
                }
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