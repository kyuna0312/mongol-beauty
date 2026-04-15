import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, TrendingUp } from 'lucide-react';
import { GET_ADMIN_STATS } from '@/graphql/queries';

export function AdminDashboard() {
  const { data, loading, error } = useQuery(GET_ADMIN_STATS);

  if (loading) {
    return (
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded-lg w-64"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <div className="text-amber-500 text-4xl mb-3">⚠️</div>
          <p className="text-amber-800 font-semibold mb-1">Алдаа гарлаа</p>
          <p className="text-amber-700 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const orders = data?.adminOrders?.items || [];
  const products = data?.products || [];
  const totalRevenue = orders
    .filter((o: any) => o.status === 'COMPLETED')
    .reduce((sum: number, o: any) => sum + o.totalPrice, 0);

  const pendingOrders = orders.filter((o: any) => o.status === 'WAITING_PAYMENT').length;
  const lowStockProducts = products.filter((p: any) => p.stock < 10).length;

  const stats = [
    {
      title: 'Нийт захиалга',
      value: orders.length,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      link: '/admin/orders',
    },
    {
      title: 'Хүлээгдэж буй',
      value: pendingOrders,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      link: '/admin/orders?status=WAITING_PAYMENT',
    },
    {
      title: 'Бүтээгдэхүүн',
      value: products.length,
      icon: Package,
      color: 'bg-green-500',
      link: '/admin/products',
    },
    {
      title: 'Орлого',
      value: `${(totalRevenue / 1000).toFixed(0)}K₮`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      link: '/admin/orders?status=COMPLETED',
    },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
          Админ самбар
        </h1>
        <p className="text-gray-500">Системийн ерөнхий мэдээлэл</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.title} to={stat.link} className="group">
            <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{stat.title}</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
              <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${stat.color} rounded-full w-full group-hover:animate-pulse`}></div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Хурдан үйлдлүүд</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/admin/products/new"
            className="group relative bg-gradient-to-br from-primary-500 to-primary-600 text-white p-5 rounded-xl text-center font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-2xl mb-2">✨</div>
              <div className="font-semibold">Шинэ бүтээгдэхүүн</div>
            </div>
          </Link>
          <Link
            to="/admin/categories/new"
            className="group relative bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5 rounded-xl text-center font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative z-10">
              <div className="text-2xl mb-2">📁</div>
              <div className="font-semibold">Шинэ ангилал</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Сүүлийн захиалгууд</h2>
          <Link 
            to="/admin/orders" 
            className="text-primary-600 text-sm font-medium hover:text-primary-700 flex items-center gap-1 transition-colors"
          >
            Бүгдийг харах
            <span>→</span>
          </Link>
        </div>
        <div className="space-y-3">
          {orders.slice(0, 5).map((order: any, index: number) => (
            <Link
              key={order.id}
              to={`/admin/orders/${order.id}`}
              className="block bg-white p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      #{order.id.slice(0, 8)}
                    </p>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        order.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'WAITING_PAYMENT'
                          ? 'bg-yellow-100 text-yellow-700'
                          : order.status === 'SHIPPING'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {order.status === 'COMPLETED' ? '✓ Дууссан' :
                       order.status === 'WAITING_PAYMENT' ? '⏳ Хүлээж байна' :
                       order.status === 'SHIPPING' ? '🚚 Хүргэж байна' :
                       order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('mn-MN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-lg font-bold text-gray-900">{order.totalPrice.toLocaleString()}₮</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Low Stock Warning */}
      {lowStockProducts > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-xl p-5 shadow-sm animate-pulse">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-yellow-900 font-semibold mb-1">
                {lowStockProducts} бүтээгдэхүүний нөөц дуусаж байна
              </p>
              <p className="text-yellow-700 text-sm mb-3">
                Нөөцийг нэмэгдүүлэх шаардлагатай
              </p>
              <Link
                to="/admin/products?lowStock=true"
                className="inline-flex items-center gap-2 text-yellow-800 text-sm font-medium hover:text-yellow-900 transition-colors"
              >
                Шалгах
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
