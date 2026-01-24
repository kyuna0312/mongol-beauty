import { useState, useEffect, createContext, useContext, ReactNode, JSX } from 'react';
import { useApolloClient } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { gql } from '@apollo/client';

const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
      phone
      userType
      isAdmin
    }
  }
`;

const USER_LOGIN = gql`
  mutation UserLogin($email: String!, $password: String!) {
    userLogin(email: $email, password: $password) {
      access_token
      user {
        id
        email
        name
        phone
        userType
        isAdmin
      }
    }
  }
`;

const REGISTER = gql`
  mutation Register($email: String!, $password: String!, $name: String!, $phone: String) {
    register(email: $email, password: $password, name: $name, phone: $phone) {
      id
      email
      name
      phone
      userType
    }
  }
`;

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  userType: 'USER' | 'SUBSCRIBED_USER' | 'ADMIN';
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  isSubscribed: boolean;
}

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
        variables: { email, password },
      });

      if (data?.userLogin) {
        const { access_token, user: userData } = data.userLogin;
        localStorage.setItem('user_token', access_token);
        setToken(access_token);
        setUser(userData);
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      setLoading(false);
      throw new Error(error.message || 'Нэвтрэхэд алдаа гарлаа');
    }
  };

  const register = async (email: string, password: string, name: string, phone?: string) => {
    try {
      const { data } = await client.mutate({
        mutation: REGISTER,
        variables: { email, password, name, phone },
      });

      if (data?.register) {
        // Auto-login after registration
        await login(email, password);
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.message || 'Бүртгэлд алдаа гарлаа');
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
