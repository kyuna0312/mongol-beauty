import { AlertCircle } from 'lucide-react';

interface InlineErrorProps {
  message: string;
  title?: string;
  showRem?: boolean;
}

export function InlineError({ message, title, showRem = false }: InlineErrorProps) {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-primary-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top">
      <div className="flex-shrink-0">
        {showRem ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-300 to-pink-500 flex items-center justify-center overflow-hidden">
            <img
              src="/rem-anime.png"
              alt="Rem"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.fallback-emoji')) {
                  const fallback = document.createElement('span');
                  fallback.className = 'fallback-emoji text-xl';
                  fallback.textContent = '💙';
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        )}
      </div>
      <div className="flex-1">
        {title && (
          <p className="text-sm font-semibold text-amber-900 mb-1">{title}</p>
        )}
        <p className="text-sm text-amber-800">{message}</p>
      </div>
    </div>
  );
}
