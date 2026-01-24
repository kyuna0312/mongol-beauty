import { useState, useEffect, createContext, useContext, ReactNode, JSX } from 'react';
import { useApolloClient } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { ADMIN_LOGIN, GET_ADMIN_ME } from '../graphql/queries';
import { ADMIN_LOGIN as ADMIN_LOGIN_MUTATION } from '../graphql/mutations';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const client = useApolloClient();
  const navigate = useNavigate();

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token');
    if (storedToken) {
      setToken(storedToken);
      verifyToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const { data } = await client.query({
        query: GET_ADMIN_ME,
        context: {
          headers: {
            authorization: `Bearer ${tokenToVerify}`,
          },
        },
        fetchPolicy: 'network-only',
      });

      if (data?.adminMe) {
        setUser(data.adminMe);
      } else {
        // Token invalid, clear it
        localStorage.removeItem('admin_token');
        setToken(null);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('admin_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, errors } = await client.mutate({
        mutation: ADMIN_LOGIN_MUTATION,
        variables: { email, password },
        errorPolicy: 'all', // Get both data and errors
      });

      // Check for GraphQL errors first
      if (errors && errors.length > 0) {
        const errorMessage = errors[0]?.message || 'Нэвтрэхэд алдаа гарлаа';
        console.error('GraphQL error:', errors);
        setLoading(false);
        throw new Error(errorMessage);
      }

      if (data?.adminLogin) {
        const { access_token, user: adminUser } = data.adminLogin;
        // Update state and localStorage
        localStorage.setItem('admin_token', access_token);
        setToken(access_token);
        setUser(adminUser);
        setLoading(false);
      } else {
        setLoading(false);
        throw new Error('Нэвтрэхэд алдаа гарлаа');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      setLoading(false);
      
      // Extract error message from various error formats
      let errorMessage = 'Нэвтрэхэд алдаа гарлаа';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        errorMessage = error.graphQLErrors[0].message;
      } else if (error.networkError) {
        errorMessage = 'Сүлжээний алдаа. Дахин оролдоно уу.';
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('admin_token');
    client.clearStore();
    navigate('/admin/login');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
