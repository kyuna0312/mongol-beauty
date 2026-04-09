import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Button } from '@mongol-beauty/ui';
import { Users, Crown, User, Search, RefreshCw } from 'lucide-react';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { GET_USERS } from '@/graphql/queries';
import { UPDATE_USER_SUBSCRIPTION } from '@/graphql/mutations';
import { AdminUser } from '@/interfaces/user';

export function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'USER' | 'SUBSCRIBED_USER'>('ALL');
  const { data, loading, error, refetch } = useQuery(GET_USERS);
  const [updateSubscription, { loading: updating }] = useMutation(UPDATE_USER_SUBSCRIPTION, {
    onCompleted: () => {
      refetch();
    },
  });

  const handleUpdateSubscription = async (userId: string, newType: 'USER' | 'SUBSCRIBED_USER') => {
    if (window.confirm(`Хэрэглэгчийн статусыг ${newType === 'SUBSCRIBED_USER' ? 'Захиалгатай' : 'Энгийн'} болгох уу?`)) {
      try {
        await updateSubscription({
          variables: { userId, userType: newType },
        });
      } catch (err: unknown) {
        // Error will be handled by mutation's onError
        console.error('Failed to update subscription:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded-lg w-64"></div>
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <ErrorDisplay
          title="Хэрэглэгчдийн мэдээлэл ачаалахад алдаа гарлаа"
          message={error.message || "Хэрэглэгчдийн мэдээллийг ачаалахад алдаа гарсан байна. Дахин оролдоно уу."}
          showRem={true}
          showRam={false}
        />
      </div>
    );
  }

  const users = (data?.users || []) as AdminUser[];
  
  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = !searchQuery || 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery);
    
    const matchesFilter = filterType === 'ALL' || user.userType === filterType;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Хэрэглэгчийн удирдлага
            </h1>
            <p className="text-gray-500">Хэрэглэгчдийн мэдээлэл болон захиалгын статус удирдах</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Имэйл, нэр, утасны дугаараар хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'ALL'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Бүгд
            </button>
            <button
              onClick={() => setFilterType('USER')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'USER'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Энгийн
            </button>
            <button
              onClick={() => setFilterType('SUBSCRIBED_USER')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'SUBSCRIBED_USER'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Захиалгатай
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Хэрэглэгч олдсонгүй</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Хэрэглэгч
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Захиалга
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Бүртгүүлсэн
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Үйлдэл
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name || 'Нэргүй'}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          {user.phone && (
                            <p className="text-xs text-gray-400">{user.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.userType === 'SUBSCRIBED_USER' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold-100 text-gold-800 rounded-full text-xs font-medium">
                          <Crown className="w-3 h-3" />
                          Захиалгатай
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          <User className="w-3 h-3" />
                          Энгийн
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{user.orders?.length || 0}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('mn-MN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {user.userType === 'SUBSCRIBED_USER' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateSubscription(user.id, 'USER')}
                          disabled={updating}
                        >
                          <RefreshCw className={`w-4 h-4 mr-1 ${updating ? 'animate-spin' : ''}`} />
                          Энгийн болгох
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleUpdateSubscription(user.id, 'SUBSCRIBED_USER')}
                          disabled={updating}
                        >
                          <Crown className="w-4 h-4 mr-1" />
                          Захиалгатай болгох
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Нийт хэрэглэгч</p>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Энгийн хэрэглэгч</p>
          <p className="text-2xl font-bold text-gray-900">
            {users.filter((u) => u.userType === 'USER').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Захиалгатай хэрэглэгч</p>
          <p className="text-2xl font-bold text-gold-600">
            {users.filter((u) => u.userType === 'SUBSCRIBED_USER').length}
          </p>
        </div>
      </div>
    </div>
  );
}
