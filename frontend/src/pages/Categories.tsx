import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../lib/api';
import type { Category } from '../types';

const SUGGESTED_CATEGORIES = [
  { name: 'Food', icon: '🍽️', color: '#f59e0b' },
  { name: 'Travel', icon: '✈️', color: '#06b6d4' },
  { name: 'Bills', icon: '📄', color: '#ef4444' },
  { name: 'Shopping', icon: '🛒', color: '#8b5cf6' },
  { name: 'Health', icon: '❤️', color: '#10b981' },
  { name: 'Transport', icon: '🚗', color: '#6366f1' },
  { name: 'Entertainment', icon: '🎬', color: '#ec4899' },
  { name: 'Others', icon: '📁', color: '#64748b' },
];

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', icon: '📁', color: '#6366f1' });
  const [submitting, setSubmitting] = useState(false);
  const [addingSuggested, setAddingSuggested] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Category[]>('/categories');
      setCategories(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setForm({ name: '', icon: '📁', color: '#6366f1' });
    setEditing(null);
    setModal('add');
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, icon: c.icon || '📁', color: c.color || '#6366f1' });
    setModal('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modal === 'add') await api.post('/categories', form);
      else if (editing) await api.put(`/categories/${editing._id}`, form);
      setModal(null);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const addSuggested = async (sug: (typeof SUGGESTED_CATEGORIES)[0]) => {
    if (categories.some((c) => c.name.toLowerCase() === sug.name.toLowerCase())) return;
    setAddingSuggested(sug.name);
    try {
      await api.post('/categories', sug);
      load();
    } finally {
      setAddingSuggested(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Expenses in it will keep the category reference until you fix them.')) return;
    try {
      await api.delete(`/categories/${id}`);
      load();
    } catch (err) {
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Could not delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-in-down">
        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          Add category
        </button>
      </div>

      {!loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm animate-fade-in-up">
          <p className="text-sm font-medium text-slate-600 mb-2">Quick add</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_CATEGORIES.filter(
              (sug) => !categories.some((c) => c.name.toLowerCase() === sug.name.toLowerCase())
            ).map((sug) => (
              <button
                key={sug.name}
                type="button"
                onClick={() => addSuggested(sug)}
                disabled={addingSuggested !== null}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 text-sm transition-colors disabled:opacity-50 text-slate-800"
              >
                <span>{sug.icon}</span>
                <span>{sug.name}</span>
                {addingSuggested === sug.name && (
                  <span className="inline-block w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            ))}
            {categories.length > 0 && SUGGESTED_CATEGORIES.every((sug) =>
              categories.some((c) => c.name.toLowerCase() === sug.name.toLowerCase())
            ) && (
              <span className="text-slate-400 text-sm py-1.5">All suggested categories added</span>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading…</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {categories.map((c, idx) => (
              <li
                key={c._id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.04}s`, animationFillMode: 'both' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{c.icon || '📁'}</span>
                  <span
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: c.color || '#6366f1' }}
                  />
                  <span className="font-medium text-slate-900">{c.name}</span>
                </div>
                <div>
                  <button onClick={() => openEdit(c)} className="text-indigo-600 hover:underline mr-3">Edit</button>
                  <button onClick={() => handleDelete(c._id)} className="text-red-600 hover:underline">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {!loading && categories.length === 0 && (
          <div className="p-8">
            <p className="text-slate-600 text-center mb-4">No categories yet. Add one below or use these suggestions:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED_CATEGORIES.map((sug) => (
                <button
                  key={sug.name}
                  type="button"
                  onClick={() => addSuggested(sug)}
                  disabled={addingSuggested !== null}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-indigo-300 transition-colors disabled:opacity-50 text-sm font-medium text-slate-800"
                >
                  <span>{sug.icon}</span>
                  <span>{sug.name}</span>
                  {addingSuggested === sug.name && (
                    <span className="inline-block w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {modal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 modal-content border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{modal === 'add' ? 'Add category' : 'Edit category'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 transition-colors"
                  placeholder="e.g. Food, Travel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Icon (emoji)</label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    className="h-10 w-14 rounded border border-slate-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 transition-colors">
                  {submitting ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
