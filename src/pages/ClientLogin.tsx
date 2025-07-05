
import React from 'react';
import { ClientLoginHeader } from '@/components/client-auth/ClientLoginHeader';
import ClientAuthForm from '@/components/client-auth/ClientAuthForm';
import { useClientLoginLogic } from '@/hooks/useClientLoginLogic';

const ClientLogin = () => {
  const { handleBackToHome } = useClientLoginLogic();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <ClientLoginHeader onBackToHome={handleBackToHome} />
      <ClientAuthForm />
    </div>
  );
};

export default ClientLogin;
