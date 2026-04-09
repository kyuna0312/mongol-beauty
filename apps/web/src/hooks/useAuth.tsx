import { useState, useEffect, createContext, useContext, ReactNode, JSX } from 'react';
import { useApolloClient } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_ME } from '@/graphql/queries';
import { LOGOUT, REGISTER, USER_LOGIN } from '@/graphql/mutations';
import { AuthContextType, User } from '@/interfaces/auth';
import { clearSessionUser, setSessionUser } from '@/features/session/store';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const client = useApolloClient();
  const navigate = useNavigate();

  const verifySession = async () => {
    try {
      const { data } = await client.query({
        query: GET_ME,
        fetchPolicy: 'network-only',
      });

      if (data?.me) {
        setUser(data.me);
        setSessionUser({
          id: data.me.id,
          email: data.me.email,
          name: data.me.name,
          isAdmin: Boolean(data.me.isAdmin),
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

  // Verify cookie-backed session on mount
  useEffect(() => {
    void verifySession();
     
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await client.mutate({
        mutation: USER_LOGIN,
        variables: { input: { email, password } },
      });

      if (data?.userLogin) {
        const { user: userData } = data.userLogin;
        setUser(userData);
        setSessionUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          isAdmin: Boolean(userData.isAdmin),
        });
        setLoading(false);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Нэвтрэхэд алдаа гарлаа';
      console.error('Login failed:', error);
      setLoading(false);
      throw new Error(message);
    }
  };

  const register = async (email: string, password: string, name: string, phone?: string) => {
    try {
      const { data } = await client.mutate({
        mutation: REGISTER,
        variables: { input: { email, password, name, phone } },
      });

      if (data?.register) {
        // Auto-login after registration
        await login(email, password);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Бүртгэлд алдаа гарлаа';
      console.error('Registration failed:', error);
      throw new Error(message);
    }
  };

  const logout = () => {
    setUser(null);
    clearSessionUser();
    void client.mutate({ mutation: LOGOUT }).catch(() => undefined);
    client.clearStore();
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated: Boolean(user),
        isSubscribed: user?.userType === 'SUBSCRIBED_USER',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
