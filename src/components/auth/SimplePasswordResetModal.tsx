import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { CheckCircle, Phone, Mail, ArrowLeft } from 'lucide-react';
import { useSimplePasswordReset } from '@/hooks/useSimplePasswordReset';
import { useToast } from '@/hooks/use-toast';

interface SimplePasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'admin' | 'client';
}

type Step = 'method' | 'verify-code' | 'new-password' | 'success';

export const SimplePasswordResetModal: React.FC<SimplePasswordResetModalProps> = ({
  isOpen,
  onClose,
  userType
}) => {
  const [step, setStep] = useState<Step>('method');
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verifiedTokenId, setVerifiedTokenId] = useState('');
  
  const { loading, generatePhoneCode, verifyPhoneCode, sendEmailReset, resetPasswordWithToken } = useSimplePasswordReset();
  const { toast } = useToast();

  const handleClose = () => {
    setStep('method');
    setMethod('phone');
    setPhone('');
    setEmail('');
    setCode('');
    setGeneratedCode('');
    setNewPassword('');
    setConfirmPassword('');
    setVerifiedTokenId('');
    onClose();
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    const result = await generatePhoneCode(phone, userType);
    
    if (result.success && result.token) {
      setGeneratedCode(result.token);
      setStep('verify-code');
      toast({
        title: "Código gerado!",
        description: result.message,
      });
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const result = await sendEmailReset(email, userType);
    
    if (result.success) {
      setStep('success');
      toast({
        title: "Email enviado!",
        description: result.message,
      });
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleCodeVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const result = await verifyPhoneCode(phone, code, userType);
    
    if (result.success && result.token) {
      setVerifiedTokenId(result.token);
      setStep('new-password');
      toast({
        title: "Código verificado!",
        description: result.message,
      });
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    const result = await resetPasswordWithToken(verifiedTokenId, newPassword, userType);
    
    if (result.success) {
      setStep('success');
      toast({
        title: "Sucesso!",
        description: result.message,
      });
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const renderMethodSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Como deseja recuperar sua senha?</h3>
        <p className="text-muted-foreground">Escolha o método de recuperação</p>
      </div>

      <Tabs value={method} onValueChange={(value) => setMethod(value as 'phone' | 'email')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Telefone
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="phone">
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <Label htmlFor="phone">Telefone cadastrado</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(xx) xxxxx-xxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Um código de 6 dígitos será gerado para você
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Gerando código...' : 'Gerar código PIN'}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="email">
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email cadastrado</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Um link de recuperação será enviado para seu email
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderCodeVerification = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Código de verificação</h3>
        <p className="text-muted-foreground">
          Digite o código de 6 dígitos gerado
        </p>
      </div>

      <div className="bg-muted p-4 rounded-lg text-center">
        <p className="text-sm text-muted-foreground mb-2">Seu código de recuperação:</p>
        <p className="text-2xl font-mono font-bold text-primary">{generatedCode}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Este código expira em 10 minutos
        </p>
      </div>

      <form onSubmit={handleCodeVerification} className="space-y-4">
        <div>
          <Label htmlFor="code">Digite o código</Label>
          <Input
            id="code"
            type="text"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            required
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setStep('method')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button type="submit" className="flex-1" disabled={loading || code.length !== 6}>
            {loading ? 'Verificando...' : 'Verificar código'}
          </Button>
        </div>
      </form>
    </div>
  );

  const renderNewPassword = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Nova senha</h3>
        <p className="text-muted-foreground">
          Defina sua nova senha de acesso
        </p>
      </div>

      <form onSubmit={handlePasswordReset} className="space-y-4">
        <div>
          <Label htmlFor="newPassword">Nova senha</Label>
          <PasswordInput
            id="newPassword"
            placeholder="Mínimo 6 caracteres"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Digite a senha novamente"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setStep('verify-code')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Atualizando...' : 'Atualizar senha'}
          </Button>
        </div>
      </form>
    </div>
  );

  const renderSuccess = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-primary" />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {method === 'email' ? 'Email enviado!' : 'Senha atualizada!'}
        </h3>
        <p className="text-muted-foreground">
          {method === 'email' 
            ? 'Verifique sua caixa de entrada e clique no link de recuperação.'
            : 'Sua senha foi atualizada com sucesso. Você já pode fazer login.'
          }
        </p>
      </div>

      <Button onClick={handleClose} className="w-full">
        Fechar
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Recuperar senha - {userType === 'admin' ? 'Administrador' : 'Cliente'}
          </DialogTitle>
        </DialogHeader>

        {step === 'method' && renderMethodSelection()}
        {step === 'verify-code' && renderCodeVerification()}
        {step === 'new-password' && renderNewPassword()}
        {step === 'success' && renderSuccess()}
      </DialogContent>
    </Dialog>
  );
};