import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io } from 'socket.io-client';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const socket = io('http://localhost:3000');

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with server
      socket.emit('verifyToken', token, (response: { valid: boolean; user?: User }) => {
        if (response.valid && response.user) {
          setUser(response.user);
        } else {
          localStorage.removeItem('token');
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    // Listen for auth state changes
    socket.on('authStateChange', (userData: User | null) => {
      setUser(userData);
    });

    return () => {
      socket.off('authStateChange');
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      socket.emit('signIn', { email, password }, (response: { token: string; user: User }) => {
        if (response.token && response.user) {
          localStorage.setItem('token', response.token);
          setUser(response.user);
        } else {
          throw new Error('Invalid credentials');
        }
      });
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('token');
      setUser(null);
      socket.emit('signOut');
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
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