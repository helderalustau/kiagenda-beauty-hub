
import React from 'react';
import AdminRegistrationForm from '@/components/AdminRegistrationForm';

const AdminRegistration = () => {
  const handleSuccess = () => {
    // Redirecionar para dashboard ou lista de administradores
    window.location.href = '/super-admin-dashboard';
  };

  const handleCancel = () => {
    // Voltar para dashboard
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
          </div>
        </div>

        {/* Formulário */}
        <AdminRegistrationForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default AdminRegistration;
