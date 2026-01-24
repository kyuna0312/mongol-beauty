import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/admin/AdminLayout';
import { ProtectedAdminRoute } from './components/admin/ProtectedAdminRoute';
import { LoadingSpinner } from '@mongol-beauty/ui';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then(m => ({ default: m.ProductsPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CartPage = lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderPage = lazy(() => import('./pages/OrderPage').then(m => ({ default: m.OrderPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

// Admin pages
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage').then(m => ({ default: m.AdminProductsPage })));
const AdminProductFormPage = lazy(() => import('./pages/admin/AdminProductFormPage').then(m => ({ default: m.AdminProductFormPage })));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage').then(m => ({ default: m.AdminCategoriesPage })));
const AdminCategoryFormPage = lazy(() => import('./pages/admin/AdminCategoryFormPage').then(m => ({ default: m.AdminCategoryFormPage })));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage').then(m => ({ default: m.AdminOrdersPage })));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));

// Prefetch common routes after initial load (for better UX)
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // Prefetch cart and checkout after 2 seconds (common next steps)
    setTimeout(() => {
      import('./pages/CartPage');
      import('./pages/CheckoutPage');
    }, 2000);
  });
}

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/*"
          element={
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/:categoryId" element={<ProductsPage />} />
                  <Route path="/products/:categoryId/:productId" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders/:id" element={<OrderPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Routes>
              </Suspense>
            </Layout>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="login" element={<AdminLoginPage />} />
                <Route
                  path="*"
                  element={
                    <ProtectedAdminRoute>
                      <AdminLayout>
                        <Suspense fallback={<LoadingSpinner />}>
                          <Routes>
                            <Route path="" element={<AdminDashboard />} />
                            <Route path="products" element={<AdminProductsPage />} />
                            <Route path="products/new" element={<AdminProductFormPage />} />
                            <Route path="products/:id/edit" element={<AdminProductFormPage />} />
                            <Route path="categories" element={<AdminCategoriesPage />} />
                            <Route path="categories/new" element={<AdminCategoryFormPage />} />
                            <Route path="categories/:id/edit" element={<AdminCategoryFormPage />} />
                            <Route path="orders" element={<AdminOrdersPage />} />
                            <Route path="users" element={<AdminUsersPage />} />
                          </Routes>
                        </Suspense>
                      </AdminLayout>
                    </ProtectedAdminRoute>
                  }
                />
              </Routes>
            </Suspense>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
