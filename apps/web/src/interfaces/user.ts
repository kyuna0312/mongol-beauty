export type UserType = 'USER' | 'SUBSCRIBED_USER' | 'ADMIN';

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  userType: UserType;
  createdAt: string;
  orders?: Array<{ id: string }>;
}
