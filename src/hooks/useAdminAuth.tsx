
import { useAdminAuthentication } from './admin/useAdminAuthentication';
import { useAdminRegistration } from './admin/useAdminRegistration';
import { useAdminManagement } from './admin/useAdminManagement';

export const useAdminAuth = () => {
  const authentication = useAdminAuthentication();
  const registration = useAdminRegistration();
  const management = useAdminManagement();

  const loading = authentication.loading || registration.loading || management.loading;

  return {
    loading,
    // Authentication methods
    authenticateAdmin: authentication.authenticateAdmin,
    // Registration methods
    registerAdmin: registration.registerAdmin,
    linkAdminToSalon: registration.linkAdminToSalon,
    // Management methods
    updateAdminUser: management.updateAdminUser,
    deleteAdminUser: management.deleteAdminUser
  };
};
