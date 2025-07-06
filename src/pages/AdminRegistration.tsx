
import React from 'react';
import AdminRegistrationForm from '@/components/AdminRegistrationForm';

const AdminRegistration = () => {
  const handleCancel = () => {
    // Voltar para dashboard do super admin
    window.location.href = '/super-admin-dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Criar Novo Administrador
            </h1>
            <p className="text-gray-600">
              Adicione um novo administrador ao sistema
            </p>
            <p className="text-sm text-blue-600 mt-2">
              Após o cadastro, o administrador será redirecionado para configurar sua loja
            </p>
          </div>
        </div>

        {/* Formulário */}
        <AdminRegistrationForm
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default AdminRegistration;
