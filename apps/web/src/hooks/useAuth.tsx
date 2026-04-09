import { useState, useEffect, createContext, useContext, ReactNode, JSX } from 'react';
import { useApolloClient } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_ME } from '@/graphql/queries';
import { REGISTER, USER_LOGIN } from '@/graphql/mutations';
import { AuthContextType, User } from '@/interfaces/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const client = useApolloClient();
  const navigate = useNavigate();

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const { data } = await client.query({
        query: GET_ME,
        context: {
          headers: {
            authorization: `Bearer ${tokenToVerify}`,
          },
        },
        fetchPolicy: 'network-only',
      });

      if (data?.me) {
        setUser(data.me);
      } else {
        localStorage.removeItem('user_token');
        setToken(null);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('user_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('user_token');
    if (storedToken) {
      setToken(storedToken);
      verifyToken(storedToken);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await client.mutate({
        mutation: USER_LOGIN,
        variables: { input: { email, password } },
      });

      if (data?.userLogin) {
        const { access_token, user: userData } = data.userLogin;
        localStorage.setItem('user_token', access_token);
        setToken(access_token);
        setUser(userData);
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
    setToken(null);
    setUser(null);
    localStorage.removeItem('user_token');
    client.clearStore();
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user && !!token,
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
