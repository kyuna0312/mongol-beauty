import { Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { RouteFallback } from '@/app/RouteFallback';
import * as Pages from '@/app/lazy-pages';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedAdminRoute } from '@/components/admin/ProtectedAdminRoute';

/**
 * Application route tree — storefront + admin.
 * All page components are lazy-loaded via `lazy-pages.ts` (single code-splitting boundary).
 */
export function AppRoutes() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const browserWindow = window as Window & {
      requestIdleCallback?: (cb: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const preload = () => {
      void import('@/features/cart/pages/CartPage');
      void import('@/features/checkout/pages/CheckoutPage');
    };

    if (browserWindow.requestIdleCallback && browserWindow.cancelIdleCallback) {
      const idleId = browserWindow.requestIdleCallback(preload, { timeout: 2500 });
      return () => browserWindow.cancelIdleCallback?.(idleId);
    }

    const timeoutId = browserWindow.setTimeout(preload, 2000);
    return () => browserWindow.clearTimeout(timeoutId);
  }, []);

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Pages.HomePage />} />
          <Route path="products" element={<Pages.ProductsPage />} />
          <Route path="products/detail" element={<Navigate to="/products" replace />} />
          <Route path="products/:categoryId" element={<Pages.ProductsPage />} />
          <Route path="products/detail/:productId" element={<Pages.ProductDetailPage />} />
          <Route path="products/:categoryId/:productId" element={<Pages.ProductDetailPage />} />
          <Route path="cart" element={<Pages.CartPage />} />
          <Route path="checkout" element={<Pages.CheckoutPage />} />
          <Route path="orders/:id" element={<Pages.OrderPage />} />
          <Route path="login" element={<Pages.LoginPage />} />
          <Route path="register" element={<Pages.RegisterPage />} />
          <Route path="forgot-password" element={<Pages.ForgotPasswordPage />} />
          <Route path="reset-password" element={<Pages.ResetPasswordPage />} />
          <Route path="profile" element={<Pages.ProfilePage />} />
          <Route path="about" element={<Pages.AboutPage />} />
          <Route path="faq" element={<Pages.FaqPage />} />
          <Route path="shipping" element={<Pages.ShippingPage />} />
          <Route path="returns" element={<Pages.ReturnsPage />} />
          <Route path="privacy" element={<Pages.PrivacyPage />} />
          <Route path="*" element={<Pages.NotFoundPage />} />
        </Route>

        <Route path="/admin/login" element={<Pages.AdminLoginPage />} />
        <Route path="*" element={<Pages.NotFoundPage />} />

        <Route element={<ProtectedAdminRoute />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Pages.AdminDashboard />} />
            <Route path="products" element={<Pages.AdminProductsPage />} />
            <Route path="products/new" element={<Pages.AdminProductFormPage />} />
            <Route path="products/:id/edit" element={<Pages.AdminProductFormPage />} />
            <Route path="categories" element={<Pages.AdminCategoriesPage />} />
            <Route path="categories/new" element={<Pages.AdminCategoryFormPage />} />
            <Route path="categories/:id/edit" element={<Pages.AdminCategoryFormPage />} />
            <Route path="orders" element={<Pages.AdminOrdersPage />} />
            <Route path="users" element={<Pages.AdminUsersPage />} />
            <Route path="content" element={<Pages.AdminContentPagesPage />} />
            <Route path="preview/:slug" element={<Pages.AdminContentPreviewPage />} />
            <Route path="settings" element={<Pages.AdminSiteSettingsPage />} />
            <Route path="korea-orders" element={<Pages.AdminKoreaOrdersPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
