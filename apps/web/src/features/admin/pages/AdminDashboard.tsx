import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, TrendingUp, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { GET_ADMIN_STATS } from '@/graphql/queries';

const statusLabel: Record<string, { label: string; cls: string }> = {
  WAITING_PAYMENT: { label: 'Хүлээж байна', cls: 'bg-amber-100 text-amber-700' },
  PAID_CONFIRMED:  { label: 'Баталгаажсан', cls: 'bg-blue-100 text-blue-700' },
  SHIPPING:        { label: 'Хүргэлтэнд', cls: 'bg-purple-100 text-purple-700' },
  COMPLETED:       { label: 'Дууссан', cls: 'bg-green-100 text-green-700' },
  CANCELLED:       { label: 'Цуцлагдсан', cls: 'bg-gray-100 text-gray-600' },
};

function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  href,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  href: string;
}) {
  return (
    <Link to={href} className="block group">
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${iconBg}`}>
          <Icon size={18} className={iconColor} />
        </div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-4">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-gray-100" />
      <div className="h-3 w-20 bg-gray-100 rounded mt-4" />
      <div className="h-7 w-14 bg-gray-100 rounded mt-2" />
    </div>
  );
}

export function AdminDashboard() {
  const { data, loading, error } = useQuery(GET_ADMIN_STATS);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="h-7 w-40 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Мэдээлэл ачаалахад алдаа гарлаа</p>
            <p className="text-xs text-red-600 mt-0.5">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const s = data?.adminStats;
  const totalOrders     = s?.totalOrders ?? 0;
  const completedRevenue = s?.completedRevenue ?? 0;
  const pendingOrders   = s?.pendingOrders ?? 0;
  const totalProducts   = s?.totalProducts ?? 0;
  const lowStockProducts = s?.lowStockProducts ?? 0;
  const recentOrders: any[] = s?.recentOrders ?? [];

  const revenueDisplay =
    completedRevenue >= 1_000_000
      ? `${(completedRevenue / 1_000_000).toFixed(1)}M₮`
      : completedRevenue >= 1_000
      ? `${(completedRevenue / 1_000).toFixed(0)}K₮`
      : `${completedRevenue}₮`;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Самбар</h1>
        <p className="text-sm text-gray-500 mt-0.5">Системийн ерөнхий мэдээлэл</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Нийт захиалга"
          value={totalOrders}
          icon={ShoppingBag}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          href="/admin/orders"
        />
        <StatCard
          title="Хүлээгдэж буй"
          value={pendingOrders}
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          href="/admin/orders?status=WAITING_PAYMENT"
        />
        <StatCard
          title="Бүтээгдэхүүн"
          value={totalProducts}
          icon={Package}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          href="/admin/products"
        />
        <StatCard
          title="Орлого"
          value={revenueDisplay}
          icon={TrendingUp}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          href="/admin/orders?status=COMPLETED"
        />
      </div>

      {/* Low-stock alert */}
      {lowStockProducts > 0 && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              <span className="font-semibold">{lowStockProducts} бүтээгдэхүүний</span> нөөц 10-аас бага байна
            </p>
          </div>
          <Link
            to="/admin/products"
            className="text-xs font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1 whitespace-nowrap ml-4"
          >
            Харах <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Сүүлийн захиалгууд</h2>
          <Link
            to="/admin/orders"
            className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            Бүгдийг харах <ArrowRight size={12} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingBag size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Захиалга байхгүй байна</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentOrders.map((order: any) => {
              const st = statusLabel[order.status] ?? { label: order.status, cls: 'bg-gray-100 text-gray-600' };
              return (
                <li key={order.id}>
                  <Link
                    to="/admin/orders"
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-mono text-gray-700 font-medium">#{order.id.slice(0, 8)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${st.cls}`}>
                        {st.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {order.totalPrice.toLocaleString()}₮
                      </span>
                      <span className="text-xs text-gray-400 hidden sm:block">
                        {new Date(order.createdAt).toLocaleDateString('mn-MN')}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/admin/products/new"
          className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-primary-300 hover:shadow-sm transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
            <Package size={16} className="text-primary-600" />
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Шинэ бүтээгдэхүүн</span>
        </Link>
        <Link
          to="/admin/categories/new"
          className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-primary-300 hover:shadow-sm transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
            <ShoppingBag size={16} className="text-purple-600" />
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Шинэ ангилал</span>
        </Link>
      </div>
    </div>
  );
}
