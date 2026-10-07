'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { User } from '@/lib/types';

interface UserContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Al abrir la página, buscamos si había un usuario guardado
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      const savedUser = JSON.parse(saved);
      api.defaults.headers.common['x-user-id'] = savedUser.id;
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('user', JSON.stringify(res.data));
    api.defaults.headers.common['x-user-id'] = res.data.id;
    setUser(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('user');
    delete api.defaults.headers.common['x-user-id'];
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};