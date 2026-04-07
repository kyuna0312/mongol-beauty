import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@mongol-beauty/ui';
import { Mail, Phone, LogOut, ShoppingBag, Crown } from 'lucide-react';
import { LoadingSpinner } from '@mongol-beauty/ui';

export function ProfilePage() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isSubscribed = user.userType === 'SUBSCRIBED_USER';

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
          Миний профайл
        </h1>
        <p className="text-gray-500">Хувийн мэдээлэл болон захиалгууд</p>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-primary-100">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name || 'Хэрэглэгч'}</h2>
              <div className="flex items-center gap-2">
                {isSubscribed && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold-100 text-gold-800 rounded-full text-sm font-medium">
                    <Crown className="w-4 h-4" />
                    Захиалгатай хэрэглэгч
                  </span>
                )}
                {!isSubscribed && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    Энгийн хэрэглэгч
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Гарах
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <Mail className="w-5 h-5 text-primary-600" />
            <div>
              <p className="text-xs text-gray-500 mb-1">Имэйл</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
          </div>
          {user.phone && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Phone className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-xs text-gray-500 mb-1">Утас</p>
                <p className="font-medium text-gray-900">{user.phone}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Info */}
      {!isSubscribed && (
        <div className="bg-gradient-to-r from-gold-50 to-beige-50 rounded-2xl p-6 mb-6 border-2 border-gold-200">
          <div className="flex items-center gap-3 mb-3">
            <Crown className="w-6 h-6 text-gold-600" />
            <h3 className="text-xl font-bold text-gray-900">Захиалгатай болох</h3>
          </div>
          <p className="text-gray-700 mb-4">
            Захиалгатай болсноор бүх бүтээгдэхүүн дээр <strong>10% хөнгөлөлт</strong> авах боломжтой!
          </p>
          <p className="text-sm text-gray-600">
            Захиалга худалдаж авсны дараа админ таны статусыг шинэчлэх болно.
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Link
          to="/orders"
          className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
              <ShoppingBag className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Миний захиалгууд</h3>
              <p className="text-sm text-gray-500">Захиалгын түүх харах</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
