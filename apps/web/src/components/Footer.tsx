import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-rose-100/90 bg-gradient-to-b from-white/90 via-rose-50/40 to-amber-50/25 text-stone-600">
      <div className="h-px bg-gradient-to-r from-transparent via-primary-300/40 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12 mb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50/60 ring-1 ring-rose-100/90 flex items-center justify-center overflow-hidden p-1 shadow-sm">
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
                        'fallback-text h-full w-full rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-display font-bold text-lg';
                      fallback.textContent = 'ID';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-primary-800 tracking-tight">INCELLDERM</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Mongolia</p>
              </div>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed max-w-sm">
              Монголын гоо сайхны дэлгүүр — эрүүл, төлөвтэй арьс арчилгаа.
            </p>
            <div className="flex gap-2 pt-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-primary-600 ring-1 ring-rose-100 shadow-sm hover:bg-primary-50 hover:scale-105 transition-all"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-primary-600 ring-1 ring-rose-100 shadow-sm hover:bg-primary-50 hover:scale-105 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-700/90 mb-4">Холбоос</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-stone-600 hover:text-primary-700 transition-colors">
                  Нүүр хуудас
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-stone-600 hover:text-primary-700 transition-colors">
                  Бүтээгдэхүүн
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-stone-600 hover:text-primary-700 transition-colors">
                  Сагс
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-stone-600 hover:text-primary-700 transition-colors">
                  Бидний тухай
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-700/90 mb-4">Дэмжлэг</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/faq" className="text-stone-600 hover:text-primary-700 transition-colors">
                  Түгээмэл асуулт
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-stone-600 hover:text-primary-700 transition-colors">
                  Хүргэлт
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-stone-600 hover:text-primary-700 transition-colors">
                  Буцаах
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-stone-600 hover:text-primary-700 transition-colors">
                  Нууцлалын бодлого
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-700/90 mb-4">Холбоо барих</h4>
            <ul className="space-y-3 text-sm text-stone-600">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                <span>9911-2233</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                <span>info@incellderm.mn</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                <span>Улаанбаатар хот, Монгол улс</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-rose-100/80 pt-8 md:flex-row">
          <p className="text-sm text-stone-500 text-center md:text-left">
            © {currentYear} INCELLDERM MONGOLIA. Бүх эрх хуулиар хамгаалагдсан.
          </p>
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-primary-400 fill-primary-300/70" />
            <span>in Mongolia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
