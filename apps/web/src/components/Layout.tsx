import { ReactNode, useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Home, Grid, Search, Menu, X, User, LogOut } from 'lucide-react';
import { Footer } from './Footer';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  
  const isCartPage = location.pathname === '/cart';
  const isCheckoutPage = location.pathname.startsWith('/checkout');
  const isOrderPage = location.pathname.startsWith('/orders');
  const isAdminPage = location.pathname.startsWith('/admin');

  // Get cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const totalItems = cart.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
      setCartCount(totalItems);
    };

    updateCartCount();
    // Listen for storage changes (when cart is updated in other tabs)
    window.addEventListener('storage', updateCartCount);
    // Also listen for custom cart update events
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  // Debounce search to avoid excessive navigation
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  }, [searchQuery, navigate]);

  // Don't show footer/nav on admin pages
  if (isAdminPage) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(to bottom, rgba(250, 243, 230, 0.4), white, rgba(250, 243, 230, 0.2))' }}>
      {/* Header - Enhanced INCELLDERM Branding */}
      <header className="bg-white/95 backdrop-blur-md border-b-2 border-beige-200 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 overflow-hidden p-1">
                <img
                  src="/incellderm-logo.png"
                  alt="INCELLDERM MONGOLIA Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.fallback-text')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'fallback-text w-full h-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold text-lg';
                      fallback.textContent = 'ID';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-primary-700 leading-tight group-hover:text-primary-600 transition-colors">
                  INCELLDERM
                </h1>
                <p className="text-xs text-beige-600 font-medium">MONGOLIA</p>
              </div>
            </Link>

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Бүтээгдэхүүн хайх..."
                  className="w-full px-4 py-2 pl-10 pr-4 border-2 border-beige-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-all duration-200 bg-white/80"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-beige-400" />
              </div>
            </form>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/cart"
                className="relative p-2 rounded-xl hover:bg-beige-50 transition-colors duration-200"
                aria-label="Сагс"
              >
                <ShoppingCart className="w-6 h-6 text-primary-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
              
              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-2 rounded-xl hover:bg-beige-50 transition-colors duration-200 flex items-center gap-2"
                    aria-label="Профайл"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </button>
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border-2 border-beige-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-beige-200">
                          <p className="text-sm font-semibold text-gray-900">{user?.name || 'Хэрэглэгч'}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                          {user?.userType === 'SUBSCRIBED_USER' && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-gold-100 text-gold-800 rounded-full text-xs font-medium">
                              Захиалгатай
                            </span>
                          )}
                        </div>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-beige-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4" />
                          Профайл
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Гарах
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors duration-200 text-sm font-medium"
                >
                  Нэвтрэх
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-xl hover:bg-beige-50 transition-colors"
              aria-label="Цэс"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6 text-primary-700" />
              ) : (
                <Menu className="w-6 h-6 text-primary-700" />
              )}
            </button>
          </div>

          {/* Mobile Search & Menu */}
          {showMobileMenu && (
            <div className="md:hidden pb-4 border-t border-beige-200 pt-4 animate-in slide-in-from-top">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Бүтээгдэхүүн хайх..."
                    className="w-full px-4 py-2 pl-10 pr-4 border-2 border-beige-200 rounded-xl focus:outline-none focus:border-primary-400 bg-white"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-beige-400" />
                </div>
              </form>
              <div className="space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-beige-50 transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-primary-700">{user?.name || 'Хэрэглэгч'}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowMobileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-red-50 transition-colors text-red-600"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Гарах</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block w-full text-center px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors font-medium"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Нэвтрэх
                  </Link>
                )}
                <Link
                  to="/cart"
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-beige-50 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <ShoppingCart className="w-6 h-6 text-primary-700" />
                  <span className="text-sm font-medium text-primary-700">Сагс</span>
                  {cartCount > 0 && (
                    <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer - Show on all pages except checkout/order */}
      {!isCheckoutPage && !isOrderPage && <Footer />}

      {/* Bottom Navigation - Mobile Only, INCELLDERM Style */}
      {!isCartPage && !isCheckoutPage && !isOrderPage && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t-2 border-beige-200 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-3 pb-safe-bottom">
            <div className="flex justify-around items-center">
              <Link
                to="/"
                onClick={() => setShowMobileMenu(false)}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-300 ${
                  location.pathname === '/'
                    ? 'text-primary-700 bg-beige-100 scale-110'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-beige-50/50'
                }`}
              >
                <Home className={`w-6 h-6 ${location.pathname === '/' ? 'scale-110' : ''} transition-transform`} />
                <span className="text-xs font-medium">Нүүр</span>
              </Link>
              <Link
                to="/products"
                onClick={() => setShowMobileMenu(false)}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-300 ${
                  location.pathname.startsWith('/products')
                    ? 'text-primary-700 bg-beige-100 scale-110'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-beige-50/50'
                }`}
              >
                <Grid className={`w-6 h-6 ${location.pathname.startsWith('/products') ? 'scale-110' : ''} transition-transform`} />
                <span className="text-xs font-medium">Бүтээгдэхүүн</span>
              </Link>
              <Link
                to="/cart"
                onClick={() => setShowMobileMenu(false)}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-300 relative ${
                  location.pathname === '/cart'
                    ? 'text-primary-700 bg-beige-100 scale-110'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-beige-50/50'
                }`}
              >
                <div className="relative">
                  <ShoppingCart className={`w-6 h-6 ${location.pathname === '/cart' ? 'scale-110' : ''} transition-transform`} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">Сагс</span>
              </Link>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
