export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  userType: 'USER' | 'SUBSCRIBED_USER' | 'ADMIN';
  isAdmin: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  isSubscribed: boolean;
}
