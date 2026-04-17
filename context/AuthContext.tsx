import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { storageService } from '../services/storageService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check local storage for demo session
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      setUser(JSON.parse(demoUser));
    }
    setIsInitialized(true);
  }, []);

  const login = async () => {
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockUser: User = {
        id: 'demo-user-123',
        name: 'デモ ユーザー',
        email: 'demo@example.com',
        role: UserRole.ADMIN,
      };
      
      setUser(mockUser);
      localStorage.setItem('demo_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem('demo_user');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></span>
          <span className="font-bold text-slate-600">起動中...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
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
