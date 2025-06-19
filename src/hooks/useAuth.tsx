
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthUser {
  id: string;
  name: string;
  role?: string;
  salon_id?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (userData: AuthUser) => void;
  logout: () => void;
  isAdmin: boolean;
  isClient: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Check for stored admin auth
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      try {
        const userData = JSON.parse(adminAuth);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing admin auth:', error);
        localStorage.removeItem('adminAuth');
      }
      return;
    }

    // Check for stored client auth
    const clientAuth = localStorage.getItem('clientAuth');
    if (clientAuth) {
      try {
        const userData = JSON.parse(clientAuth);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing client auth:', error);
        localStorage.removeItem('clientAuth');
      }
    }
  }, []);

  const login = (userData: AuthUser) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('clientAuth');
    localStorage.removeItem('selectedSalonId');
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role && ['admin', 'manager', 'collaborator'].includes(user.role);
  const isClient = !user?.role; // Clients don't have roles
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      logout,
      isAdmin,
      isClient,
      isSuperAdmin
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
