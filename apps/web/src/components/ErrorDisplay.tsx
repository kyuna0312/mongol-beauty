import { FormEvent, ReactNode, useState } from 'react';
import { Button } from '@mongol-beauty/ui';
import { Home, RefreshCw, AlertCircle, ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  actionLabel?: string; // Legacy prop; maps to home action label
  onAction?: () => void; // Legacy prop; maps to home action callback
  onRetry?: () => void;
  onBack?: () => void;
  onSearch?: (query: string) => void;
  showBack?: boolean;
  showRetry?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  homePath?: string;
  showRem?: boolean;
  showRam?: boolean;
  children?: ReactNode;
}

export function ErrorDisplay({
  title = 'Уучлаарай, алдаа гарлаа!',
  message = 'Ямар нэгэн зүйл буруу болсон байна. Дахин оролдоно уу.',
  actionLabel = 'Нүүр хуудас руу буцах',
  onAction,
  onRetry,
  onBack,
  onSearch,
  showBack = true,
  showRetry = true,
  showSearch = true,
  searchPlaceholder = 'Бүтээгдэхүүн хайх...',
  homePath = '/',
  showRem = true,
  showRam = false,
  children,
}: ErrorDisplayProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleHome = () => {
    if (onAction) {
      onAction();
      return;
    }
    navigate(homePath);
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
      return;
    }
    window.location.reload();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate(-1);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    if (onSearch) {
      onSearch(query);
      return;
    }
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-amber-50 p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-primary-100 bg-white shadow-soft">
          <div className="p-6 md:p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-stone-900">{title}</h2>
            <p className="mt-3 text-sm md:text-base text-stone-600 leading-relaxed">{message}</p>
            {(showRem || showRam) && (
              <p className="mt-3 text-xs text-stone-500">
                {showRem && showRam ? 'Түр хугацаанд саатал гарлаа.' : 'Системийн саатлыг засаж байна.'}
              </p>
            )}
          </div>

          <div className="border-t border-primary-100 p-5 md:p-6">
            {showSearch && (
              <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
                <Button type="submit" variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            )}

            {children ? <div className="mb-4">{children}</div> : null}

            <div className="flex flex-wrap gap-2">
              {showBack && (
                <Button onClick={handleBack} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Буцах
                </Button>
              )}
              {showRetry && (
                <Button onClick={handleRetry} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Дахин оролдох
                </Button>
              )}
              <Button onClick={handleHome} variant="primary">
                <Home className="mr-2 h-4 w-4" />
                {actionLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
