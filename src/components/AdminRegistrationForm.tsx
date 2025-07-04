
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useAdminRegistrationForm } from '@/hooks/admin/useAdminRegistrationForm';
import AdminRegistrationHeader from './admin-registration/AdminRegistrationHeader';
import AdminCreationInfo from './admin-registration/AdminCreationInfo';
import AdminFormFields from './admin-registration/AdminFormFields';
import AdminFormActions from './admin-registration/AdminFormActions';

interface AdminRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AdminRegistrationForm = ({ 
  onSuccess, 
  onCancel
}: AdminRegistrationFormProps) => {
  const {
    formData,
    errors,
    showPassword,
    submitting,
    loading,
    handleInputChange,
    handleSubmit,
    handleCancel,
    setShowPassword
  } = useAdminRegistrationForm({ onSuccess, onCancel });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <AdminRegistrationHeader />
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <AdminCreationInfo />
          
          <AdminFormFields
            formData={formData}
            errors={errors}
            showPassword={showPassword}
            submitting={submitting}
            onInputChange={handleInputChange}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          <AdminFormActions
            onCancel={handleCancel}
            submitting={submitting}
            loading={loading}
          />
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminRegistrationForm;
