import { lazy } from 'react';

/** Central lazy imports — one place for code-splitting boundaries. */
export const HomePage = lazy(() =>
  import('@/features/home/pages/HomePage').then((m) => ({ default: m.HomePage })),
);
export const ProductsPage = lazy(() =>
  import('@/features/catalog/pages/ProductsPage').then((m) => ({ default: m.ProductsPage })),
);
export const ProductDetailPage = lazy(() =>
  import('@/features/catalog/pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })),
);
export const CartPage = lazy(() =>
  import('@/features/cart/pages/CartPage').then((m) => ({ default: m.CartPage })),
);
export const CheckoutPage = lazy(() =>
  import('@/features/checkout/pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })),
);
export const OrderPage = lazy(() =>
  import('@/features/orders/pages/OrderPage').then((m) => ({ default: m.OrderPage })),
);
export const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
);
export const RegisterPage = lazy(() =>
  import('@/features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);
export const ForgotPasswordPage = lazy(() =>
  import('@/features/auth/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
);
export const ResetPasswordPage = lazy(() =>
  import('@/features/auth/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
);
export const ProfilePage = lazy(() =>
  import('@/features/account/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
export const FaqPage = lazy(() =>
  import('@/features/content/pages/FaqPage').then((m) => ({ default: m.FaqPage })),
);
export const ShippingPage = lazy(() =>
  import('@/features/content/pages/ShippingPage').then((m) => ({ default: m.ShippingPage })),
);
export const ReturnsPage = lazy(() =>
  import('@/features/content/pages/ReturnsPage').then((m) => ({ default: m.ReturnsPage })),
);
export const PrivacyPage = lazy(() =>
  import('@/features/content/pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })),
);
export const AboutPage = lazy(() =>
  import('@/features/about/pages/AboutPage').then((m) => ({ default: m.AboutPage })),
);
export const NotFoundPage = lazy(() =>
  import('@/features/shared/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

export const AdminLoginPage = lazy(() =>
  import('@/features/admin/pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })),
);
export const AdminDashboard = lazy(() =>
  import('@/features/admin/pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard })),
);
export const AdminProductsPage = lazy(() =>
  import('@/features/admin/pages/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage })),
);
export const AdminProductFormPage = lazy(() =>
  import('@/features/admin/pages/AdminProductFormPage').then((m) => ({ default: m.AdminProductFormPage })),
);
export const AdminCategoriesPage = lazy(() =>
  import('@/features/admin/pages/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage })),
);
export const AdminCategoryFormPage = lazy(() =>
  import('@/features/admin/pages/AdminCategoryFormPage').then((m) => ({ default: m.AdminCategoryFormPage })),
);
export const AdminOrdersPage = lazy(() =>
  import('@/features/admin/pages/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage })),
);
export const AdminUsersPage = lazy(() =>
  import('@/features/admin/pages/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })),
);
export const AdminContentPagesPage = lazy(() =>
  import('@/features/admin/pages/AdminContentPagesPage').then((m) => ({ default: m.AdminContentPagesPage })),
);
export const AdminContentPreviewPage = lazy(() =>
  import('@/features/admin/pages/AdminContentPreviewPage').then((m) => ({ default: m.AdminContentPreviewPage })),
);
export const AdminSiteSettingsPage = lazy(() =>
  import('@/features/admin/pages/AdminSiteSettingsPage').then((m) => ({ default: m.AdminSiteSettingsPage })),
);
export const AdminKoreaOrdersPage = lazy(() =>
  import('@/features/admin/pages/AdminKoreaOrdersPage').then((m) => ({ default: m.AdminKoreaOrdersPage })),
);
