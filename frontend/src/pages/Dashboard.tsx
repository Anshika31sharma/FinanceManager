import { useEffect, useState } from 'react';
import api from '../lib/api';
import type { DashboardAnalytics } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#84cc16', '#f97316'];

export function Dashboard() {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(true);
  const [budgetInput, setBudgetInput] = useState('');
  const [savingBudget, setSavingBudget] = useState(false);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get<DashboardAnalytics>('/analytics/dashboard', { params: { month } });
      setData(res);
      if (res.budget > 0 && !budgetInput) setBudgetInput(String(res.budget));
      else if (res.budget === 0 && !budgetInput) setBudgetInput('');
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [month]);

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(budgetInput);
    if (isNaN(amount) || amount < 0) return;
    setSavingBudget(true);
    try {
      await api.post('/budget', { month, amount });
      await loadAnalytics();
    } finally {
      setSavingBudget(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const pieData = data?.byCategory?.map((c, i) => ({ ...c, fill: c.color || COLORS[i % COLORS.length] })) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-in-down">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
          />
          <form onSubmit={handleSetBudget} className="flex gap-2">
            <input
              type="number"
              min="0"
              step="100"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder="Monthly budget"
              className="w-36 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={savingBudget}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              Set budget
            </button>
          </form>
        </div>
      </div>

      {!data ? (
        <p className="text-slate-500">Unable to load analytics.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
              <p className="text-sm font-medium text-slate-500">Total spent this month</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                ₹{data.totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
              <p className="text-sm font-medium text-slate-500">Remaining budget</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                ₹{data.remainingBudget.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
              <p className="text-sm font-medium text-slate-500">Highest spending category</p>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {data.highestSpendingCategory
                  ? `${data.highestSpendingCategory.categoryName} (₹${data.highestSpendingCategory.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })})`
                  : '—'}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
              <p className="text-sm font-medium text-slate-500">Avg daily spending</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                ₹{data.avgDailySpending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
              <h2 className="font-semibold text-slate-900 mb-4">Spending by category</h2>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="total"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ categoryName, total }) => `${categoryName} ₹${total.toLocaleString('en-IN')}`}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={pieData[i].fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500 py-12 text-center">No expenses this month</p>
              )}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
              <h2 className="font-semibold text-slate-900 mb-4">Monthly trend (last 12 months)</h2>
              {data.monthlyTrend?.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.monthlyTrend} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                    <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                    <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 'Total']} />
                    <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500 py-12 text-center">No trend data yet</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            <h2 className="font-semibold text-slate-900 mb-4">Recent transactions</h2>
            {data.recentTransactions?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-200">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Category</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentTransactions.map((tx, idx) => (
                      <tr key={tx._id} className="border-b border-slate-100 animate-fade-in-up hover:bg-slate-50 transition-colors" style={{ animationDelay: `${0.25 + idx * 0.03}s`, animationFillMode: 'both' }}>
                        <td className="py-3 text-slate-700">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                            style={{ backgroundColor: (tx.category as { color?: string })?.color ? `${(tx.category as { color: string }).color}20` : '#eee', color: (tx.category as { color?: string })?.color || '#333' }}
                          >
                            {(tx.category as { name?: string })?.name ?? '—'}
                          </span>
                        </td>
                        <td className="py-3 font-medium text-slate-900">
                          ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-slate-600">{tx.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 py-8 text-center">No recent transactions</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
