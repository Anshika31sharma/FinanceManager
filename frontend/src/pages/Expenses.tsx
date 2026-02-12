import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import type { Expense, Category } from '../types';
import type { PaginatedExpenses } from '../types';

export function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryId, setCategoryId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState({ amount: '', category: '', date: new Date().toISOString().slice(0, 10), notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successFlash, setSuccessFlash] = useState(false);

  const loadCategories = async () => {
    const { data } = await api.get<Category[]>('/categories');
    setCategories(data);
  };

  const loadExpenses = async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (categoryId) params.categoryId = categoryId;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const { data } = await api.get<PaginatedExpenses>('/expenses', { params });
      setExpenses(data.expenses);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [categoryId, startDate, endDate]);

  useEffect(() => {
    loadExpenses(pagination.page);
  }, [pagination.page, categoryId, startDate, endDate]);

  const openAdd = () => {
    if (!categories.length) {
      alert('Create at least one category first.');
      return;
    }
    setForm({ amount: '', category: categories[0]._id, date: new Date().toISOString().slice(0, 10), notes: '' });
    setEditing(null);
    setModal('add');
  };

  const openEdit = (exp: Expense) => {
    setEditing(exp);
    setForm({
      amount: String(exp.amount),
      category: typeof exp.category === 'object' ? exp.category._id : '',
      date: exp.date.slice(0, 10),
      notes: exp.notes ?? '',
    });
    setModal('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { amount: Number(form.amount), category: form.category, date: form.date, notes: form.notes };
      if (modal === 'add') await api.post('/expenses', payload);
      else if (editing) await api.put(`/expenses/${editing._id}`, payload);
      setModal(null);
      loadExpenses(pagination.page);
      setSuccessFlash(true);
      setTimeout(() => setSuccessFlash(false), 2000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    await api.delete(`/expenses/${id}`);
    loadExpenses(pagination.page);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-in-down">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
          {successFlash && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-700  text-sm font-medium animate-check-pop">
              <span aria-hidden>✓</span> Saved
            </span>
          )}
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          Add expense
        </button>
      </div>

      {categories.length === 0 && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm animate-fade-in-up">
          <strong>No categories yet.</strong> Add categories first so you can tag expenses. Go to{' '}
          <Link to="/categories" className="font-medium underline text-amber-700 hover:text-amber-900">
            Categories
          </Link>{' '}
          and use &quot;Quick add&quot; to add Food, Travel, Bills, etc.
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Notes</th>
                  <th className="px-4 py-3 font-medium w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp, idx) => (
                  <tr
                    key={exp._id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors animate-fade-in-up"
                    style={{ animationDelay: `${idx * 0.03}s`, animationFillMode: 'both' }}
                  >
                    <td className="px-4 py-3 text-slate-700">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-700"
                        style={(exp.category as Category)?.color ? {
                          backgroundColor: `${(exp.category as Category).color}20`,
                          color: (exp.category as Category).color,
                        } : undefined}
                      >
                        {(exp.category as Category)?.name ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-slate-600">{exp.notes || '—'}</td>
                    <td className="px-4 py-3 flex gap-2 ">
                      <button onClick={() => openEdit(exp)} className="text-indigo-600 hover:underline mr-2">Edit</button>
                      <button onClick={() => handleDelete(exp._id)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
            <span>
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => loadExpenses(pagination.page - 1)}
                className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50 hover:bg-slate-50 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => loadExpenses(pagination.page + 1)}
                className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50 hover:bg-slate-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {modal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 modal-content border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{modal === 'add' ? 'Add expense' : 'Edit expense'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 transition-colors"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 transition-colors"
                  placeholder="Optional"
                />
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
