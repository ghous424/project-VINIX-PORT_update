
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // Cek status login saat aplikasi dimuat (untuk menangani refresh)
  useEffect(() => {
    const checkSession = async () => {
      const storedUser = localStorage.getItem('vinix_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setUserId(parsedUser.id || null); // Ambil ID dari user yang tersimpan
          setIsAuthenticated(true);
        } catch (e) {
          console.error("Failed to parse stored session");
        }
      }
    };
    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
        const response = await api.login(email, password);
        setUser(response.user);
        setUserId((response.user as any).id || 1);
        // Simpan user ke localStorage agar bisa diakses oleh api.ts
        localStorage.setItem('vinix_user', JSON.stringify(response.user));
        setIsAuthenticated(true);
    } catch (error: any) {
        throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string, role: string): Promise<void> => {
     try {
         const response: any = await api.register(name, email, password, role);
         // Gunakan data lengkap dari response backend
         const newUser: User = {
             id: response.id,
             name: response.name,
             email: response.email,
             title: response.title,
             bio: response.bio,
             avatarUrl: response.avatarUrl,
             role: response.role
         };
         localStorage.setItem('vinix_user', JSON.stringify(newUser));
         setUser(newUser);
         setUserId(newUser.id);
         setIsAuthenticated(true);
     } catch (error: any) {
         throw new Error(error.message || 'Registration failed');
     }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setUserId(null);
    // Clear persisted session on logout (client-side only)
    try {
      localStorage.removeItem('vinix_user');
    } catch (e) {
      console.warn('Failed to clear localStorage on logout', e);
    }
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedData };

      // Simpan perubahan ke localStorage
      localStorage.setItem('vinix_user', JSON.stringify(newUser));

      // Sync dengan Backend/Storage
      if (userId) {
          api.updateProfile(userId, updatedData).catch(err => console.error("Failed to sync profile update", err));
      }

      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, register, updateUser }}>
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
