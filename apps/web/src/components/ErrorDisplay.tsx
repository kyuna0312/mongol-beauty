import { ReactNode } from 'react';
import { Button } from '@mongol-beauty/ui';
import { Home, RefreshCw, AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  showRem?: boolean;
  showRam?: boolean;
  children?: ReactNode;
}

export function ErrorDisplay({
  title = 'Уучлаарай, алдаа гарлаа!',
  message = 'Ямар нэгэн зүйл буруу болсон байна. Дахин оролдоно уу.',
  actionLabel = 'Нүүр хуудас руу буцах',
  onAction,
  showRem = true,
  showRam = false,
  children,
}: ErrorDisplayProps) {
  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-pink-200">
          {/* Anime Girl Images */}
          <div className="relative bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              {showRem && (
                <div className="relative animate-bounce" style={{ animationDuration: '2s', animationDelay: '0s' }}>
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-300 to-pink-500 flex items-center justify-center shadow-lg border-4 border-white overflow-hidden">
                    <img
                      src="/rem-anime.png"
                      alt="Rem"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to emoji if image fails
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.fallback-emoji')) {
                          const fallback = document.createElement('span');
                          fallback.className = 'fallback-emoji text-6xl';
                          fallback.textContent = '💙';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                    Rem
                  </div>
                </div>
              )}
              {showRam && (
                <div className="relative animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.5s' }}>
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-300 to-purple-500 flex items-center justify-center shadow-lg border-4 border-white overflow-hidden">
                    <img
                      src="/ram-anime.png"
                      alt="Ram"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to emoji if image fails
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.fallback-emoji')) {
                          const fallback = document.createElement('span');
                          fallback.className = 'fallback-emoji text-6xl';
                          fallback.textContent = '💜';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                    Ram
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Content */}
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {title}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {message}
              </p>
            </div>

            {children && (
              <div className="mb-6">
                {children}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleAction}
                variant="primary"
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                <Home className="w-4 h-4 mr-2" />
                {actionLabel}
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-2 border-pink-300 text-pink-600 hover:bg-pink-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Дахин ачаалах
              </Button>
            </div>

            {/* Cute message from Rem/Ram */}
            <div className="mt-8 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
              <p className="text-sm text-gray-600 italic">
                {showRem && showRam 
                  ? "💙 Rem & 💜 Ram: 'Уучлаарай, бид энэ алдааг засах гэж хичээж байна!'"
                  : showRem
                  ? "💙 Rem: 'Уучлаарай, би энэ алдааг засах гэж хичээж байна!'"
                  : "💜 Ram: 'Уучлаарай, би энэ алдааг засах гэж хичээж байна!'"
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
