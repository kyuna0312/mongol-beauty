import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Folder, ShoppingBag, Users, ArrowLeft, LogOut } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminNavItems = [
  { path: '/admin', label: 'Самбар', icon: LayoutDashboard },
  { path: '/admin/products', label: 'Бүтээгдэхүүн', icon: Package },
  { path: '/admin/categories', label: 'Ангилал', icon: Folder },
  { path: '/admin/orders', label: 'Захиалга', icon: ShoppingBag },
  { path: '/admin/users', label: 'Хэрэглэгчид', icon: Users },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const { user, logout } = useAdminAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Mobile Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 lg:hidden shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Админ панел
          </h1>
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
            title="Гарах"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-72 bg-white/80 backdrop-blur-sm border-r border-gray-200 min-h-screen sticky top-0 shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100 w-fit"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Гарах</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50"
                title="Системээс гарах"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Админ панел
            </h2>
            {user && (
              <p className="text-sm text-gray-500 mb-6">Нэвтэрсэн: {user.name || user.email}</p>
            )}
            <nav className="space-y-2">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path !== '/admin' && location.pathname.startsWith(item.path));
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200 font-medium transform scale-105'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-10 shadow-lg">
          <div className="grid grid-cols-4 gap-1 px-2 py-2">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path !== '/admin' && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 pb-20 lg:pb-4">
          {children}
        </main>
      </div>
    </div>
  );
}
