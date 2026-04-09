import { useState, useEffect, createContext, useContext, ReactNode, JSX } from 'react';
import { useApolloClient } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_ADMIN_ME } from '../graphql/queries';
import { ADMIN_LOGIN as ADMIN_LOGIN_MUTATION, LOGOUT } from '../graphql/mutations';
import { clearSessionUser, setSessionUser } from '@/features/session/store';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const client = useApolloClient();
  const navigate = useNavigate();

  // Verify cookie-backed session on mount
  useEffect(() => {
    void verifyToken();
  }, []);

  const verifyToken = async () => {
    try {
      const { data } = await client.query({
        query: GET_ADMIN_ME,
        fetchPolicy: 'network-only',
      });

      if (data?.adminMe) {
        setUser(data.adminMe);
        setSessionUser({
          id: data.adminMe.id,
          email: data.adminMe.email,
          name: data.adminMe.name,
          isAdmin: true,
        });
      } else {
        setUser(null);
        clearSessionUser();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      setUser(null);
      clearSessionUser();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, errors } = await client.mutate({
        mutation: ADMIN_LOGIN_MUTATION,
        variables: { input: { email, password } },
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
        const { user: adminUser } = data.adminLogin;
        setUser(adminUser);
        setSessionUser({
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          isAdmin: true,
        });
        setLoading(false);
      } else {
        setLoading(false);
        throw new Error('Нэвтрэхэд алдаа гарлаа');
      }
    } catch (error: unknown) {
      console.error('Login failed:', error);
      setLoading(false);
      
      // Extract error message from various error formats
      let errorMessage = 'Нэвтрэхэд алдаа гарлаа';
      
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'graphQLErrors' in error &&
        Array.isArray((error as { graphQLErrors?: Array<{ message?: string }> }).graphQLErrors) &&
        (error as { graphQLErrors: Array<{ message?: string }> }).graphQLErrors.length > 0
      ) {
        errorMessage =
          (error as { graphQLErrors: Array<{ message?: string }> }).graphQLErrors[0]?.message ||
          errorMessage;
      } else if (typeof error === 'object' && error !== null && 'networkError' in error) {
        errorMessage = 'Сүлжээний алдаа. Дахин оролдоно уу.';
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    clearSessionUser();
    void client.mutate({ mutation: LOGOUT }).catch(() => undefined);
    client.clearStore();
    navigate('/admin/login');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: Boolean(user),
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
