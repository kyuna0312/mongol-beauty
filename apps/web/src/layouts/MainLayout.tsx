import { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Home, Grid, Search, Menu, X, User, LogOut, Sparkles, BookOpen } from 'lucide-react';
import { useQuery } from '@apollo/client';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { GET_SITE_SETTINGS } from '@/graphql/queries';

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

  const { data: settingsData } = useQuery(GET_SITE_SETTINGS);
  const logoUrl = settingsData?.siteSettings?.logoUrl ?? null;

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Luxury editorial header ── */}
      <header className="sticky top-0 z-50 bg-[#fdf8f5]/95 backdrop-blur-xl border-b border-terracotta-100/50 shadow-[0_1px_0_0_rgba(196,120,110,0.08),0_4px_20px_-4px_rgba(0,0,0,0.06)]">
        {/* top accent line */}
        <div className="h-[2px] bg-gradient-to-r from-terracotta-200/40 via-terracotta-400/60 to-rose-gold-light/40" />

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center gap-4 py-3 md:py-3.5">

            {/* ── Logo ── */}
            <Link to="/" className="group flex shrink-0 items-center gap-3 mr-4">
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-[10px] bg-gradient-to-br from-[#fdf0ec] to-[#f9e6e0] ring-1 ring-terracotta-200/60 transition-all duration-300 group-hover:ring-terracotta-400/50 group-hover:shadow-md md:h-11 md:w-11">
                <img
                  src={logoUrl || '/incellderm-logo.png'}
                  alt="Мөнгөн Косметикс ХХК Logo"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.fallback-text')) {
                      const fallback = document.createElement('div');
                      fallback.className =
                        'fallback-text flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-terracotta-400 to-terracotta-600 text-base font-bold text-white';
                      fallback.textContent = 'ID';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
              <div className="flex flex-col leading-none gap-0.5">
                <span className="font-display text-[17px] font-bold tracking-[0.04em] text-stone-800 transition-colors group-hover:text-terracotta-600 md:text-[18px]">
                  Мөнгөн Косметикс
                </span>
                <span className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-[0.3em] text-terracotta-400/80">
                  <Sparkles className="h-2.5 w-2.5" />
                  ХХК
                </span>
              </div>
            </Link>

            {/* ── Desktop nav ── */}
            <nav className="hidden items-center gap-1 lg:flex">
              {[
                { to: '/', label: 'Нүүр', exact: true },
                { to: '/products', label: 'Бүтээгдэхүүн', exact: false },
                { to: '/blog', label: 'Блог', exact: false },
              ].map(({ to, label, exact }) => {
                const active = exact ? location.pathname === to : location.pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`relative px-3.5 py-2 text-sm font-medium transition-all duration-200 rounded-lg group/nav ${
                      active
                        ? 'text-terracotta-700'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {label}
                    <span
                      className={`absolute bottom-0.5 left-3.5 right-3.5 h-[1.5px] rounded-full bg-terracotta-400 transition-transform duration-300 origin-left ${
                        active ? 'scale-x-100' : 'scale-x-0 group-hover/nav:scale-x-100'
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* ── Search (desktop) ── */}
            <form onSubmit={handleSearch} className="hidden min-w-0 max-w-sm flex-1 md:flex ml-auto">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Бүтээгдэхүүн хайх..."
                  className="w-full rounded-full border border-terracotta-100 bg-[#fdf0ec]/60 py-2 pl-10 pr-4 text-sm text-stone-700 placeholder:text-stone-400/70 transition-all duration-200 focus:border-terracotta-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-200/40"
                />
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-terracotta-300" />
              </div>
            </form>

            {/* ── Action icons ── */}
            <div className="hidden shrink-0 items-center gap-1 md:flex ml-2">

              {/* Cart */}
              <Link
                to="/cart"
                className="group/icon relative flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition-all duration-200 hover:bg-terracotta-50 hover:text-terracotta-600"
                aria-label="Сагс"
              >
                <ShoppingCart className="h-[20px] w-[20px]" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-terracotta-500 px-0.5 text-[10px] font-bold text-white ring-2 ring-[#fdf8f5] animate-scale-in">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User: always shows an icon */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex h-9 w-9 items-center justify-center rounded-full ring-2 ring-terracotta-200 bg-gradient-to-br from-terracotta-400 to-terracotta-600 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:ring-terracotta-400 hover:shadow-md"
                    aria-label="Профайл"
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </button>
                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 z-50 mt-2.5 w-56 overflow-hidden rounded-2xl border border-terracotta-100/80 bg-[#fdf8f5] py-1.5 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.15)] animate-scale-in">
                        <div className="border-b border-terracotta-100/60 bg-gradient-to-r from-[#fdf0ec]/80 to-transparent px-4 py-3">
                          <p className="text-sm font-semibold text-stone-800">{user?.name || 'Хэрэглэгч'}</p>
                          <p className="text-xs text-stone-400 mt-0.5">{user?.email}</p>
                          {user?.userType === 'SUBSCRIBED_USER' && (
                            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-terracotta-50 border border-terracotta-200/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-terracotta-600">
                              <Sparkles className="h-2.5 w-2.5" />
                              Захиалгатай
                            </span>
                          )}
                        </div>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-600 transition-colors hover:bg-terracotta-50/60 hover:text-terracotta-700"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="h-4 w-4 text-terracotta-400" />
                          Профайл
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-stone-500 transition-colors hover:bg-rose-50/60 hover:text-rose-600"
                        >
                          <LogOut className="h-4 w-4" />
                          Гарах
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Unauthenticated: User icon + text label */
                <Link
                  to="/login"
                  className="group/user flex items-center gap-1.5 rounded-full border border-terracotta-200/80 bg-white px-3.5 py-1.5 text-sm font-medium text-terracotta-600 shadow-sm transition-all duration-200 hover:bg-terracotta-500 hover:text-white hover:border-terracotta-500 hover:shadow-md"
                  aria-label="Нэвтрэх"
                >
                  <User className="h-[15px] w-[15px] transition-transform duration-200 group-hover/user:scale-110" />
                  <span>Нэвтрэх</span>
                </Link>
              )}
            </div>

            {/* ── Mobile: cart icon + hamburger ── */}
            <div className="flex items-center gap-1 md:hidden ml-auto">
              <Link
                to="/cart"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-stone-500"
                aria-label="Сагс"
              >
                <ShoppingCart className="h-[20px] w-[20px]" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-terracotta-500 px-0.5 text-[9px] font-bold text-white ring-2 ring-[#fdf8f5]">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-terracotta-50"
                aria-label="Цэс"
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* ── Mobile dropdown ── */}
          {showMobileMenu && (
            <div className="border-t border-terracotta-100/60 pb-4 pt-3 md:hidden">
              <form onSubmit={handleSearch} className="mb-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Бүтээгдэхүүн хайх..."
                    className="w-full rounded-full border border-terracotta-100 bg-[#fdf0ec]/50 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-200/50 focus:border-terracotta-300"
                  />
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-terracotta-300" />
                </div>
              </form>
              <div className="space-y-1">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-terracotta-50/70"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-terracotta-400 to-terracotta-600 text-sm font-bold text-white ring-2 ring-terracotta-200/60">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-stone-800">{user?.name || 'Хэрэглэгч'}</p>
                        <p className="text-xs text-stone-400">{user?.email}</p>
                      </div>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setShowMobileMenu(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-stone-500 transition-colors hover:bg-rose-50/70 hover:text-rose-600"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Гарах</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-terracotta-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-terracotta-600"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <User className="h-4 w-4" />
                    Нэвтрэх
                  </Link>
                )}
                <Link
                  to="/"
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-stone-600 transition-colors hover:bg-terracotta-50/70 hover:text-terracotta-700"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Home className="h-4 w-4 text-terracotta-400" />
                  Нүүр
                </Link>
                <Link
                  to="/products"
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-stone-600 transition-colors hover:bg-terracotta-50/70 hover:text-terracotta-700"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Grid className="h-4 w-4 text-terracotta-400" />
                  Бүтээгдэхүүн
                </Link>
                <Link
                  to="/blog"
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-stone-600 transition-colors hover:bg-terracotta-50/70 hover:text-terracotta-700"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <BookOpen className="h-4 w-4 text-terracotta-400" />
                  Блог
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
