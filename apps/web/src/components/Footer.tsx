import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 text-white mt-auto">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden p-1">
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
                      fallback.className = 'fallback-text w-full h-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-primary-900 font-bold text-xl';
                      fallback.textContent = 'ID';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">INCELLDERM</h3>
                <p className="text-xs text-gold-200">MONGOLIA</p>
              </div>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Монголын Gen Z-д зориулсан гоо сайхны бүтээгдэхүүн. Бид таны арьсыг эрүүл, гэрэлтэй байлгахад туслана.
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-gold-500 flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-gold-500 flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-gold-300">Холбоос</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white/80 hover:text-gold-300 transition-colors text-sm flex items-center gap-2">
                  <span>→</span> Нүүр хуудас
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-white/80 hover:text-gold-300 transition-colors text-sm flex items-center gap-2">
                  <span>→</span> Бүтээгдэхүүн
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-white/80 hover:text-gold-300 transition-colors text-sm flex items-center gap-2">
                  <span>→</span> Сагс
                </Link>
              </li>
              <li>
                <a href="#about" className="text-white/80 hover:text-gold-300 transition-colors text-sm flex items-center gap-2">
                  <span>→</span> Бидний тухай
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-gold-300">Дэмжлэг</h4>
            <ul className="space-y-2">
              <li>
                <a href="#faq" className="text-white/80 hover:text-gold-300 transition-colors text-sm flex items-center gap-2">
                  <span>→</span> Түгээмэл асуулт
                </a>
              </li>
              <li>
                <a href="#shipping" className="text-white/80 hover:text-gold-300 transition-colors text-sm flex items-center gap-2">
                  <span>→</span> Хүргэлт
                </a>
              </li>
              <li>
                <a href="#returns" className="text-white/80 hover:text-gold-300 transition-colors text-sm flex items-center gap-2">
                  <span>→</span> Буцаах
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-white/80 hover:text-gold-300 transition-colors text-sm flex items-center gap-2">
                  <span>→</span> Нууцлалын бодлого
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-gold-300">Холбоо барих</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-white/80">
                <Phone className="w-4 h-4 mt-0.5 text-gold-400 flex-shrink-0" />
                <span>9911-2233</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/80">
                <Mail className="w-4 h-4 mt-0.5 text-gold-400 flex-shrink-0" />
                <span>info@incellderm.mn</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/80">
                <MapPin className="w-4 h-4 mt-0.5 text-gold-400 flex-shrink-0" />
                <span>Улаанбаатар хот, Монгол улс</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-6 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/60 text-center md:text-left">
              © {currentYear} INCELLDERM MONGOLIA. Бүх эрх хуулиар хамгаалагдсан.
            </p>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-gold-400 fill-gold-400" />
              <span>in Mongolia</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
