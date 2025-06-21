
import React from 'react';
import { AdminLoginHeader } from '@/components/admin-login/AdminLoginHeader';
import { AdminLoginForm } from '@/components/admin-login/AdminLoginForm';
import { useAdminLoginLogic } from '@/hooks/useAdminLoginLogic';

const AdminLogin = () => {
  const { handleLogin, handleCreateAccount, loading } = useAdminLoginLogic();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <AdminLoginHeader />
      <AdminLoginForm 
        onSubmit={handleLogin}
        loading={loading}
        onCreateAccount={handleCreateAccount}
      />
    </div>
  );
};

export default AdminLogin;
