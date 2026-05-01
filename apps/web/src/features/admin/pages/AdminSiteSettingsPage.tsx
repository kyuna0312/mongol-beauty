import { useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { Button } from '@mongol-beauty/ui';
import { Save, Settings } from 'lucide-react';
import { GET_SITE_SETTINGS } from '@/graphql/queries';
import { UPDATE_SITE_SETTINGS } from '@/graphql/mutations';

export function AdminSiteSettingsPage() {
  const { data, loading, refetch } = useQuery(GET_SITE_SETTINGS, { fetchPolicy: 'cache-and-network' });
  const [updateSettings, { loading: saving }] = useMutation(UPDATE_SITE_SETTINGS);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    bankName: '',
    bankAccount: '',
    bankOwner: '',
    phone: '',
    email: '',
    address: '',
    deliveryFee: 5000,
    freeDeliveryThreshold: 200000,
  });

  useEffect(() => {
    if (data?.siteSettings) {
      const s = data.siteSettings;
      setForm({
        bankName: s.bankName ?? '',
        bankAccount: s.bankAccount ?? '',
        bankOwner: s.bankOwner ?? '',
        phone: s.phone ?? '',
        email: s.email ?? '',
        address: s.address ?? '',
        deliveryFee: s.deliveryFee ?? 5000,
        freeDeliveryThreshold: s.freeDeliveryThreshold ?? 200000,
      });
    }
  }, [data]);

  const handleSave = async () => {
    await updateSettings({ variables: { input: form } });
    await refetch();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
          <Settings size={16} className="text-primary-600" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Сайтын тохиргоо</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Банкны мэдээлэл</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Банкны нэр</label>
          <input
            type="text"
            value={form.bankName}
            onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Дансны дугаар</label>
          <input
            type="text"
            value={form.bankAccount}
            onChange={(e) => setForm((f) => ({ ...f, bankAccount: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Эзэмшлийн нэр</label>
          <input
            type="text"
            value={form.bankOwner}
            onChange={(e) => setForm((f) => ({ ...f, bankOwner: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="pt-2 border-t border-gray-100 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Холбоо барих</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Утасны дугаар</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">И-мэйл</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Хаяг</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Хүргэлтийн тохиргоо</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Хүргэлтийн төлбөр (₮)</label>
            <input
              type="number"
              min={0}
              value={form.deliveryFee}
              onChange={(e) => setForm((f) => ({ ...f, deliveryFee: Number(e.target.value) }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Үнэгүй хүргэлтийн босго (₮)
            </label>
            <input
              type="number"
              min={0}
              value={form.freeDeliveryThreshold}
              onChange={(e) => setForm((f) => ({ ...f, freeDeliveryThreshold: Number(e.target.value) }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Энэ дүнгээс дээш захиалгад хүргэлт үнэгүй болно
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save size={14} />
          {saving ? 'Хадгалж байна...' : 'Хадгалах'}
        </Button>
        {saved && <span className="text-sm text-green-600 font-medium">Амжилттай хадгаллаа</span>}
      </div>
    </div>
  );
}
