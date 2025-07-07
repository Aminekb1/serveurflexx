import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: { _id: string; name: string; username: string; role: string; email?: string; age?: number; phone?: number; address?: string } | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ _id: string; name: string; username: string; role: string; email?: string; age?: number; phone?: number; address?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          console.log('Decoded User:', decoded);
          setUser({
            _id: decoded.id, // Changed from decoded._id to decoded.id
            name: decoded.name || 'Unknown',
            username: decoded.sub || 'Unknown',
            role: decoded.role || 'client',
            email: decoded.email,
            age: decoded.age,
            phone: decoded.phone,
            address: decoded.address,
          });
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (err) {
          console.error('Token Decode Error:', err);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    const decoded: any = jwtDecode(token);
    console.log('Login Decoded User:', decoded);
    setUser({
      _id: decoded.id, // Changed from decoded._id to decoded.id
      name: decoded.name || 'Unknown',
      username: decoded.sub || 'Unknown',
      role: decoded.role || 'client',
      email: decoded.email,
      age: decoded.age,
      phone: decoded.phone,
      address: decoded.address,
    });
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    navigate('/auth/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};