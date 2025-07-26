
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthUser {
  id: string;
  name: string;
  email?: string;
  role?: string;
  salon_id?: string;
  isFirstAccess?: boolean;
  accessLevel?: string;
  loginTime?: string;
  sessionExpires?: string;
  isSecure?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (userData: AuthUser) => void;
  logout: () => void;
  isAdmin: boolean;
  isClient: boolean;
  isSuperAdmin: boolean;
  isAuthorizedSuperAdmin: boolean;
  markAsReturningUser: () => void;
  validateSession: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const AUTHORIZED_SUPER_ADMIN = 'Helder';

  // Session validation
  const validateSession = (): boolean => {
    if (!user) return false;
    
    // Check if session has expired
    if (user.sessionExpires && new Date() > new Date(user.sessionExpires)) {
      logout();
      return false;
    }
    
    // Additional security check for super admin
    if (user.role === 'super_admin') {
      if (user.name !== AUTHORIZED_SUPER_ADMIN) {
        console.error('Security violation: Invalid super admin session');
        logout();
        return false;
      }
      
      // Check if this is a secure session
      if (!user.isSecure) {
        console.warn('Super admin session not marked as secure');
        return false;
      }
    }
    
    return true;
  };

  useEffect(() => {
    const loadStoredAuth = () => {
      // Check for secure super admin auth first
      const secSuperAdminAuth = localStorage.getItem('secSuperAdminAuth');
      if (secSuperAdminAuth) {
        try {
          const userData = JSON.parse(secSuperAdminAuth);
          
          // Validate secure session
          if (userData.expires && Date.now() < userData.expires) {
            setUser({
              ...userData,
              sessionExpires: new Date(userData.expires).toISOString(),
              isSecure: true
            });
            return;
          } else {
            localStorage.removeItem('secSuperAdminAuth');
          }
        } catch (error) {
          console.error('Error parsing secure super admin auth:', error);
          localStorage.removeItem('secSuperAdminAuth');
        }
      }

      // Check for regular admin auth
      const adminAuth = localStorage.getItem('adminAuth');
      if (adminAuth) {
        try {
          const userData = JSON.parse(adminAuth);
          
          // Security check for super admin
          if (userData.role === 'super_admin' && userData.name !== AUTHORIZED_SUPER_ADMIN) {
            console.error('Security violation: Unauthorized super admin detected, clearing auth');
            localStorage.removeItem('adminAuth');
            localStorage.removeItem('selectedSalonId');
            return;
          }
          
          // Add session expiration if not present (24 hours for regular admins)
          if (!userData.sessionExpires) {
            userData.sessionExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
          }
          
          console.log('Auth: Loading admin user:', userData.name, userData.role);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing admin auth:', error);
          localStorage.removeItem('adminAuth');
        }
        return;
      }

      // Check for client auth
      const clientAuth = localStorage.getItem('clientAuth');
      if (clientAuth) {
        try {
          const userData = JSON.parse(clientAuth);
          
          // Add session expiration if not present (7 days for clients)
          if (!userData.sessionExpires) {
            userData.sessionExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          }
          
          console.log('Auth: Loading client user:', userData.name, userData.id);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing client auth:', error);
          localStorage.removeItem('clientAuth');
        }
      }
    };

    loadStoredAuth();

    // Validate session periodically
    const sessionCheckInterval = setInterval(() => {
      validateSession();
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(sessionCheckInterval);
  }, []);

  const login = (userData: AuthUser) => {
    // Security validation
    if (userData.role === 'super_admin' && userData.name !== AUTHORIZED_SUPER_ADMIN) {
      console.error('Security violation: Attempt to login as unauthorized super admin');
      return;
    }

    // Add session expiration based on user type
    const sessionDuration = userData.role === 'super_admin' ? 2 * 60 * 60 * 1000 : // 2 hours
                           userData.role ? 24 * 60 * 60 * 1000 : // 24 hours for admins
                           7 * 24 * 60 * 60 * 1000; // 7 days for clients

    const userWithSession = {
      ...userData,
      sessionExpires: new Date(Date.now() + sessionDuration).toISOString(),
      loginTime: new Date().toISOString()
    };

    console.log('Auth: Logging in user:', userWithSession.name, userWithSession.role || 'client');
    setUser(userWithSession);
    
    // Store in appropriate localStorage
    if (userWithSession.role) {
      localStorage.setItem('adminAuth', JSON.stringify(userWithSession));
    } else {
      localStorage.setItem('clientAuth', JSON.stringify(userWithSession));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('clientAuth');
    localStorage.removeItem('selectedSalonId');
    localStorage.removeItem('secSuperAdminAuth');
  };

  const markAsReturningUser = () => {
    if (user) {
      const updatedUser = { ...user, isFirstAccess: false };
      setUser(updatedUser);
      
      if (updatedUser.role) {
        localStorage.setItem('adminAuth', JSON.stringify(updatedUser));
      } else {
        localStorage.setItem('clientAuth', JSON.stringify(updatedUser));
      }
    }
  };

  const isAuthenticated = !!user && validateSession();
  const isAdmin = user?.role && ['admin', 'manager', 'collaborator'].includes(user.role);
  const isClient = !user?.role;
  const isSuperAdmin = user?.role === 'super_admin';
  const isAuthorizedSuperAdmin = user?.role === 'super_admin' && user?.name === AUTHORIZED_SUPER_ADMIN && user?.isSecure;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      logout,
      isAdmin,
      isClient,
      isSuperAdmin,
      isAuthorizedSuperAdmin,
      markAsReturningUser,
      validateSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
