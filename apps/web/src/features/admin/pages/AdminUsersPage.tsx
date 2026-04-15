import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Users, Crown, User, Search, X, AlertTriangle } from 'lucide-react';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { GET_USERS } from '@/graphql/queries';
import { UPDATE_USER_SUBSCRIPTION } from '@/graphql/mutations';
import { AdminUser } from '@/interfaces/user';

type FilterType = 'ALL' | 'USER' | 'SUBSCRIBED_USER';

export function AdminUsersPage() {
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState<FilterType>('ALL');
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_USERS);
  const [updateSubscription, { loading: updating }] = useMutation(UPDATE_USER_SUBSCRIPTION, {
    onCompleted: () => refetch(),
    onError: (err) => setActionError(err.message),
  });

  const handleToggle = async (user: AdminUser) => {
    const newType = user.userType === 'SUBSCRIBED_USER' ? 'USER' : 'SUBSCRIBED_USER';
    setActionError(null);
    await updateSubscription({ variables: { userId: user.id, userType: newType } });
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
          <div className="h-12 bg-gray-50 border-b border-gray-100" />
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 border-b border-gray-100" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <ErrorDisplay
          title="Хэрэглэгчдийн мэдээлэл ачаалахад алдаа гарлаа"
          message={error.message}
          showRem={true}
          showRam={false}
        />
      </div>
    );
  }

  const users = (data?.users || []) as AdminUser[];
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || u.email?.toLowerCase().includes(q)
      || u.name?.toLowerCase().includes(q)
      || u.phone?.includes(q);
    const matchFilter = filter === 'ALL' || u.userType === filter;
    return matchSearch && matchFilter;
  });

  const totalUsers      = users.length;
  const subscribedCount = users.filter((u) => u.userType === 'SUBSCRIBED_USER').length;
  const normalCount     = totalUsers - subscribedCount;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Хэрэглэгчид</h1>
        <p className="text-sm text-gray-500 mt-0.5">Хэрэглэгчдийн мэдээлэл ба захиалгын статус</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Нийт', value: totalUsers, cls: 'text-gray-900' },
          { label: 'Энгийн', value: normalCount, cls: 'text-gray-700' },
          { label: 'Захиалгатай', value: subscribedCount, cls: 'text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Action error */}
      {actionError && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-red-800">
            <AlertTriangle size={14} /> {actionError}
          </div>
          <button onClick={() => setActionError(null)} className="text-red-400 hover:text-red-600 ml-3">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Search & filter */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Имэйл, нэр, утасаар хайх..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-1.5">
          {(['ALL', 'USER', 'SUBSCRIBED_USER'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'ALL' ? 'Бүгд' : f === 'USER' ? 'Энгийн' : 'Захиалгатай'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-14 text-center">
            <Users size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Хэрэглэгч олдсонгүй</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Хэрэглэгч</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Статус</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Захиалга</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Бүртгүүлсэн</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((user) => {
                  const isSubscribed = user.userType === 'SUBSCRIBED_USER';
                  const letter = user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U';
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-700 text-xs font-semibold">{letter}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{user.name || 'Нэргүй'}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isSubscribed ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isSubscribed ? <Crown size={10} /> : <User size={10} />}
                          {isSubscribed ? 'Захиалгатай' : 'Энгийн'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 hidden sm:table-cell">{user.orders?.length ?? 0}</td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs hidden md:table-cell">
                        {new Date(user.createdAt).toLocaleDateString('mn-MN')}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleToggle(user)}
                          disabled={updating}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                            isSubscribed
                              ? 'text-gray-600 border border-gray-200 hover:bg-gray-50'
                              : 'text-amber-700 border border-amber-200 hover:bg-amber-50'
                          }`}
                        >
                          {isSubscribed ? 'Энгийн болгох' : 'Захиалгатай болгох'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
