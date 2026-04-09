import { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Home, Grid, Search, Menu, X, User, LogOut } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';

/**
 * Storefront shell: header, main outlet, footer, mobile tab bar.
 * Admin uses a separate route tree (no MainLayout).
 */
export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { getCount, mergeLocalCartToServer } = useCart();
  const cartCount = getCount();

  const isCartPage = location.pathname === '/cart';
  const isCheckoutPage = location.pathname.startsWith('/checkout');
  const isOrderPage = location.pathname.startsWith('/orders');

  useEffect(() => {
    if (isAuthenticated) {
      mergeLocalCartToServer();
    }
     
  }, [isAuthenticated]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery('');
      }
    },
    [searchQuery, navigate],
  );

  const showMobileNav = !isCartPage && !isCheckoutPage && !isOrderPage;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-primary-100/80 bg-white/85 shadow-soft backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 py-3 md:py-4">
            <Link to="/" className="group flex shrink-0 items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50 to-amber-50/50 p-1 shadow-sm ring-1 ring-primary-100/90 transition-all duration-300 group-hover:ring-primary-200/80 md:h-12 md:w-12">
                <img
                  src="/incellderm-logo.png"
                  alt="INCELLDERM MONGOLIA Logo"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.fallback-text')) {
                      const fallback = document.createElement('div');
                      fallback.className =
                        'fallback-text flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 text-lg font-bold text-white';
                      fallback.textContent = 'ID';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-display text-lg font-semibold tracking-tight text-primary-700 transition-colors group-hover:text-primary-600 md:text-xl">
                  INCELLDERM
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-500 md:text-xs">
                  Mongolia
                </span>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 text-sm font-medium text-stone-600 lg:flex">
              <Link
                to="/"
                className={`rounded-xl px-3 py-2 transition-colors ${
                  location.pathname === '/' ? 'bg-primary-500/10 text-primary-800' : 'hover:bg-primary-50/80'
                }`}
              >
                Нүүр
              </Link>
              <Link
                to="/products"
                className={`rounded-xl px-3 py-2 transition-colors ${
                  location.pathname.startsWith('/products')
                    ? 'bg-primary-500/10 text-primary-800'
                    : 'hover:bg-primary-50/80'
                }`}
              >
                Бүтээгдэхүүн
              </Link>
            </nav>

            <form onSubmit={handleSearch} className="hidden min-w-0 max-w-md flex-1 md:flex">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Бүтээгдэхүүн хайх..."
                  className="w-full rounded-full border border-primary-100/90 bg-white/70 py-2.5 pl-11 pr-4 text-stone-800 placeholder:text-stone-400 transition-shadow focus:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-200/80"
                />
                <Search className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-stone-400" />
              </div>
            </form>

            <div className="hidden shrink-0 items-center gap-2 md:flex">
              <Link
                to="/cart"
                className="relative rounded-xl p-2.5 text-primary-700 transition-colors hover:bg-primary-50/90"
                aria-label="Сагс"
              >
                <ShoppingCart className="h-[22px] w-[22px]" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-primary-500 px-0.5 text-[10px] font-bold text-white shadow-sm">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 rounded-xl p-2 transition-colors duration-200 hover:bg-primary-50/90"
                    aria-label="Профайл"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </button>
                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-primary-100/90 bg-white py-2 shadow-soft">
                        <div className="border-b border-primary-100/80 px-4 py-2">
                          <p className="text-sm font-semibold text-gray-900">{user?.name || 'Хэрэглэгч'}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                          {user?.userType === 'SUBSCRIBED_USER' && (
                            <span className="mt-1 inline-block rounded-full bg-gold-100 px-2 py-0.5 text-xs font-medium text-gold-800">
                              Захиалгатай
                            </span>
                          )}
                        </div>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 transition-colors hover:bg-primary-50/80"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="h-4 w-4" />
                          Профайл
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-primary-700 transition-colors hover:bg-primary-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Гарах
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600"
                >
                  Нэвтрэх
                </Link>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="rounded-xl p-2 text-primary-800 transition-colors hover:bg-primary-50/90 md:hidden"
              aria-label="Цэс"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {showMobileMenu && (
            <div className="border-t border-primary-100/70 pb-4 pt-4 md:hidden">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Бүтээгдэхүүн хайх..."
                    className="w-full rounded-full border border-primary-100/90 bg-white/70 py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-200/80"
                  />
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                </div>
              </form>
              <div className="space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 rounded-xl p-2 transition-colors hover:bg-primary-50/80"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-primary-700">{user?.name || 'Хэрэглэгч'}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setShowMobileMenu(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl p-2 text-primary-700 transition-colors hover:bg-primary-50"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Гарах</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block w-full rounded-xl bg-primary-500 px-4 py-2 text-center font-medium text-white transition-colors hover:bg-primary-600"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Нэвтрэх
                  </Link>
                )}
                <Link
                  to="/cart"
                  className="flex items-center gap-2 rounded-xl p-2 transition-colors hover:bg-primary-50/80"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <ShoppingCart className="h-6 w-6 text-primary-700" />
                  <span className="text-sm font-medium text-primary-700">Сагс</span>
                  {cartCount > 0 && (
                    <span className="rounded-full bg-primary-600 px-2 py-0.5 text-xs font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <main
        className={`flex-1 ${showMobileNav ? 'pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0' : ''}`}
      >
        <Outlet />
      </main>

      {!isCheckoutPage && !isOrderPage && <Footer />}

      {showMobileNav && (
        <nav className="fixed bottom-3 left-3 right-3 z-50 pb-safe-bottom md:hidden">
          <div className="flex justify-around rounded-2xl border border-primary-100/90 bg-white/92 py-2 shadow-nav backdrop-blur-xl">
            <Link
              to="/"
              onClick={() => setShowMobileMenu(false)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 transition-colors ${
                location.pathname === '/' ? 'bg-primary-500/12 text-primary-800' : 'text-stone-500 hover:text-primary-700'
              }`}
            >
              <Home className="h-[22px] w-[22px]" strokeWidth={location.pathname === '/' ? 2.25 : 2} />
              <span className="text-[11px] font-medium">Нүүр</span>
            </Link>
            <Link
              to="/products"
              onClick={() => setShowMobileMenu(false)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 transition-colors ${
                location.pathname.startsWith('/products')
                  ? 'bg-primary-500/12 text-primary-800'
                  : 'text-stone-500 hover:text-primary-700'
              }`}
            >
              <Grid className="h-[22px] w-[22px]" strokeWidth={location.pathname.startsWith('/products') ? 2.25 : 2} />
              <span className="text-[11px] font-medium">Бүтээгдэхүүн</span>
            </Link>
            <Link
              to="/cart"
              onClick={() => setShowMobileMenu(false)}
              className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 transition-colors ${
                location.pathname === '/cart'
                  ? 'bg-primary-500/12 text-primary-800'
                  : 'text-stone-500 hover:text-primary-700'
              }`}
            >
              <div className="relative">
                <ShoppingCart className="h-[22px] w-[22px]" strokeWidth={location.pathname === '/cart' ? 2.25 : 2} />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-primary-500 px-0.5 text-[10px] font-bold text-white shadow-sm">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium">Сагс</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
