import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { GET_ADMIN_BLOG_POSTS } from '@/graphql/queries';
import { CREATE_BLOG_POST, DELETE_BLOG_POST, UPDATE_BLOG_POST } from '@/graphql/mutations';

interface PostForm {
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  coverImageUrl: string;
  isPublished: boolean;
}

const emptyForm: PostForm = {
  title: '',
  slug: '',
  excerpt: '',
  contentHtml: '',
  coverImageUrl: '',
  isPublished: false,
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

export function AdminBlogPage() {
  const { data, loading, refetch } = useQuery(GET_ADMIN_BLOG_POSTS, { fetchPolicy: 'cache-and-network' });
  const [createPost, { loading: creating }] = useMutation(CREATE_BLOG_POST);
  const [updatePost, { loading: updating }] = useMutation(UPDATE_BLOG_POST);
  const [deletePost] = useMutation(DELETE_BLOG_POST);

  const posts: any[] = data?.adminBlogPosts ?? [];

  const [modal, setModal] = useState<{ open: boolean; editId: string | null }>({ open: false, editId: null });
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openCreate = () => {
    setForm(emptyForm);
    setModal({ open: true, editId: null });
  };

  const openEdit = (post: any) => {
    setForm({
      title: post.title ?? '',
      slug: post.slug ?? '',
      excerpt: post.excerpt ?? '',
      contentHtml: post.contentHtml ?? '',
      coverImageUrl: post.coverImageUrl ?? '',
      isPublished: post.isPublished ?? false,
    });
    setModal({ open: true, editId: post.id });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modal.editId) {
      await updatePost({ variables: { input: { id: modal.editId, ...form } } });
    } else {
      await createPost({ variables: { input: form } });
    }
    setModal({ open: false, editId: null });
    void refetch();
  };

  const handleDelete = async (id: string) => {
    await deletePost({ variables: { id } });
    setDeleteConfirm(null);
    void refetch();
  };

  const isSaving = creating || updating;

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Блог нийтлэл</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} />
          Нийтлэл нэмэх
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <p className="text-gray-500">Нийтлэл байхгүй байна.</p>
      )}

      <div className="space-y-2">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{post.title}</p>
              <p className="text-xs text-gray-400 truncate">/{post.slug}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                post.isPublished
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {post.isPublished ? 'Нийтлэгдсэн' : 'Ноорог'}
            </span>
            <button
              onClick={() => openEdit(post)}
              className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              title="Засах"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => setDeleteConfirm(post.id)}
              className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Устгах"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-2xl bg-white p-6 shadow-xl max-w-sm w-full mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Нийтлэл устгах уу?</h3>
            <p className="text-sm text-gray-500 mb-5">Энэ үйлдлийг буцаах боломжгүй.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Цуцлах
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                Устгах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
              <h2 className="font-semibold text-gray-900">
                {modal.editId ? 'Нийтлэл засах' : 'Шинэ нийтлэл'}
              </h2>
              <button
                onClick={() => setModal({ open: false, editId: null })}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Гарчиг</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm((f) => ({
                      ...f,
                      title,
                      slug: modal.editId ? f.slug : slugify(title),
                    }));
                  }}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  placeholder="Нийтлэлийн гарчиг"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  placeholder="my-blog-post"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Зургийн URL</label>
                <input
                  value={form.coverImageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Товч тайлбар</label>
                <textarea
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 resize-none"
                  placeholder="Нийтлэлийн товч тайлбар..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Агуулга (HTML)</label>
                <textarea
                  rows={8}
                  value={form.contentHtml}
                  onChange={(e) => setForm((f) => ({ ...f, contentHtml: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 resize-y"
                  placeholder="<p>Нийтлэлийн агуулга...</p>"
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.isPublished}
                  onClick={() => setForm((f) => ({ ...f, isPublished: !f.isPublished }))}
                  className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                    form.isPublished ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${
                      form.isPublished ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="flex items-center gap-1.5 text-sm text-gray-700">
                  {form.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                  {form.isPublished ? 'Нийтлэх' : 'Ноорог хэлбэрээр хадгалах'}
                </span>
              </label>
            </form>

            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4 shrink-0">
              <button
                type="button"
                onClick={() => setModal({ open: false, editId: null })}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Цуцлах
              </button>
              <button
                onClick={handleSubmit as any}
                disabled={isSaving}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60 transition-colors"
              >
                {isSaving ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
