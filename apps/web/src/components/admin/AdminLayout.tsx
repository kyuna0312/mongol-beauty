import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Folder,
  ShoppingBag,
  Users,
  LogOut,
  FileText,
  ExternalLink,
  ChevronRight,
  Settings,
  Plane,
  BookOpen,
} from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const adminNavItems = [
  { path: '/admin', label: 'Самбар', icon: LayoutDashboard, exact: true },
  { path: '/admin/products', label: 'Бүтээгдэхүүн', icon: Package },
  { path: '/admin/categories', label: 'Ангилал', icon: Folder },
  { path: '/admin/orders', label: 'Захиалга', icon: ShoppingBag },
  { path: '/admin/users', label: 'Хэрэглэгчид', icon: Users },
  { path: '/admin/content', label: 'Контент', icon: FileText },
  { path: '/admin/settings', label: 'Тохиргоо', icon: Settings },
  { path: '/admin/korea-orders', label: 'Солонгос', icon: Plane },
  { path: '/admin/blog', label: 'Блог', icon: BookOpen },
];

function NavItem({ item, isActive }: { item: typeof adminNavItems[0]; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
        isActive
          ? 'bg-primary-600 text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon
        className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`}
        size={18}
      />
      <span className="truncate">{item.label}</span>
      {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />}
    </Link>
  );
}

export function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAdminAuth();

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? 'A';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-20">
        {/* Brand */}
        <div className="flex items-center gap-2.5 h-14 px-5 border-b border-gray-200 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">ID</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">Incellderm Admin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            Навигац
          </p>
          {adminNavItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return <NavItem key={item.path} item={item} isActive={isActive} />;
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 px-3 py-3 flex-shrink-0 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors group"
          >
            <ExternalLink size={16} className="text-gray-400 group-hover:text-gray-500" />
            Сайт руу очих
          </Link>
          {user && (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-700 text-xs font-semibold">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">{user.name || user.email}</p>
                <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={logout}
                title="Гарах"
                className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 h-[52px] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary-600 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">ID</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">Админ</span>
        </div>
        <Link to="/" className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ExternalLink size={16} />
        </Link>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 safe-area-inset-bottom">
        <div className="grid grid-cols-9 h-14">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={18} />
                <span className="text-[9px] font-medium leading-none truncate max-w-full px-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="flex-1 lg:ml-60 pt-[52px] lg:pt-0 pb-14 lg:pb-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
