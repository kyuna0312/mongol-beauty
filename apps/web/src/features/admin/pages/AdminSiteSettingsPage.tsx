import { useMutation, useQuery } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@mongol-beauty/ui';
import { Save, Settings, Upload } from 'lucide-react';
import { GET_SITE_SETTINGS } from '@/graphql/queries';
import { UPDATE_SITE_SETTINGS } from '@/graphql/mutations';

export function AdminSiteSettingsPage() {
  const { data, loading, refetch } = useQuery(GET_SITE_SETTINGS, { fetchPolicy: 'cache-and-network' });
  const [updateSettings, { loading: saving }] = useMutation(UPDATE_SITE_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    bankName: '',
    bankAccount: '',
    bankOwner: '',
    phone: '',
    email: '',
    address: '',
    deliveryFee: 5000,
    freeDeliveryThreshold: 200000,
    logoUrl: '',
    primaryColor: '#c4786e',
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
        logoUrl: s.logoUrl ?? '',
        primaryColor: s.primaryColor ?? '#c4786e',
      });
    }
  }, [data]);

  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload/logo', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(err.message ?? 'Upload failed');
      }
      const { url } = await res.json();
      setForm((f) => ({ ...f, logoUrl: url }));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

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

      {/* Branding */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Брэндинг</h2>

        {/* Logo upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Лого</label>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Logo preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-gray-400">Лого байхгүй</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLogoUpload(file);
                }}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 text-sm"
              >
                <Upload size={14} />
                {uploading ? 'Байршуулж байна...' : 'Лого байршуулах'}
              </Button>
              {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
              {form.logoUrl && (
                <p className="text-xs text-gray-400 break-all">{form.logoUrl}</p>
              )}
            </div>
          </div>
        </div>

        {/* Primary color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Үндсэн өнгө</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.primaryColor}
              onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
              className="h-10 w-10 rounded cursor-pointer border border-gray-300"
            />
            <input
              type="text"
              value={form.primaryColor}
              onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
              className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="#c4786e"
            />
            <div
              className="h-8 w-8 rounded-full border border-gray-200 shrink-0"
              style={{ backgroundColor: form.primaryColor }}
            />
          </div>
        </div>
      </div>

      {/* Bank info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 mb-4">
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
      </div>

      {/* Contact */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 mb-4">
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

      {/* Delivery */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
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
