export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
  user?: string;
}

export interface Expense {
  _id: string;
  amount: number;
  category: Category;
  date: string;
  notes?: string;
  user?: string;
}

export interface Budget {
  _id?: string;
  month: string;
  amount: number;
}

export interface DashboardAnalytics {
  month: string;
  totalSpent: number;
  budget: number;
  remainingBudget: number;
  highestSpendingCategory: { categoryName: string; total: number; color?: string } | null;
  recentTransactions: Expense[];
  byCategory: { categoryName: string; total: number; color?: string; icon?: string }[];
  monthlyTrend: { _id: string; total: number }[];
  avgDailySpending: number;
}

export interface PaginatedExpenses {
  expenses: Expense[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
