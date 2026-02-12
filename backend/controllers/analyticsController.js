import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';

const getMonthStartEnd = (date = new Date()) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = d.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
  return { start, end, monthStr: `${y}-${String(m + 1).padStart(2, '0')}` };
};

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { month } = req.query;
    const refDate = month ? new Date(month + '-01') : new Date();
    const { start, end, monthStr } = getMonthStartEnd(refDate);

    const expenseMatch = {
      user: userId,
      date: { $gte: start, $lte: end },
    };

    const [
      totalSpentResult,
      byCategory,
      recentExpenses,
      monthlyTrend,
      budgetDoc,
    ] = await Promise.all([
      Expense.aggregate([
        { $match: expenseMatch },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: expenseMatch },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'cat',
          },
        },
        { $unwind: '$cat' },
        {
          $project: {
            categoryId: '$_id',
            categoryName: '$cat.name',
            icon: '$cat.icon',
            color: '$cat.color',
            total: 1,
            _id: 0,
          },
        },
      ]),
      Expense.find(expenseMatch)
        .populate('category', 'name icon color')
        .sort({ date: -1 })
        .limit(10)
        .lean(),
      Expense.aggregate([
        {
          $match: {
            user: userId,
            date: {
              $gte: new Date(refDate.getFullYear(), refDate.getMonth() - 11, 1),
              $lte: end,
            },
          },
        },
        {
          $project: {
            month: {
              $dateToString: { format: '%Y-%m', date: '$date' },
            },
            amount: 1,
          },
        },
        { $group: { _id: '$month', total: { $sum: '$amount' } } },
        { $sort: { _id: 1 } },
      ]),
      Budget.findOne({ user: userId, month: monthStr }),
    ]);

    const totalSpent = totalSpentResult[0]?.total ?? 0;
    const budgetAmount = budgetDoc?.amount ?? 0;
    const remainingBudget = Math.max(0, budgetAmount - totalSpent);
    const daysInMonth = new Date(
      refDate.getFullYear(),
      refDate.getMonth() + 1,
      0
    ).getDate();
    const daysElapsed = Math.min(
      Math.ceil((Date.now() - start.getTime()) / (24 * 60 * 60 * 1000)),
      daysInMonth
    );
    const avgDailySpending =
      daysElapsed > 0 ? totalSpent / daysElapsed : 0;
    const highestCategory = byCategory[0] || null;

    res.json({
      month: monthStr,
      totalSpent: Math.round(totalSpent * 100) / 100,
      budget: budgetAmount,
      remainingBudget: Math.round(remainingBudget * 100) / 100,
      highestSpendingCategory: highestCategory,
      recentTransactions: recentExpenses,
      byCategory,
      monthlyTrend,
      avgDailySpending: Math.round(avgDailySpending * 100) / 100,
    });
  } catch (error) {
    next(error);
  }
};
